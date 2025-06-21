// src/jobs/agroNotifications.job.ts
// ---------------------------------------------------------------------------
// Este job se ejecuta cada hora. Toma los snapshots climáticos y el estado
// de cada lote, evalúa reglas agroclimáticas y, si corresponde, envía
// notificaciones.
// ---------------------------------------------------------------------------
import cron from 'node-cron';
import { climaService } from '../services/clima.service';
import { getActiveLots, saveNotification, updateLotGdd, Lot } from '../services/farm.service';
import { pushToUser } from '../services/push.service';
//import { Types } from 'mongoose';

//--------------------------------------------------
// Tipos mínimos
//--------------------------------------------------
interface RuleCtx {
  lote: Lot;
  temp: number;
  humidity: number;
  rain24h: number;
  windGust: number;
  gddAcum: number;
  et0Hoy: number;
}
interface RuleResult { id: string; message: string; }

type Rule = (ctx: RuleCtx) => RuleResult | null;

/** 1. Lluvia > 8 mm próximas 24 h  → retrasar siembra/fertilización */
const rainHeavyRule: Rule = (c) => {
  if (c.rain24h > 8) {
    return {
      id: `RAIN_HEAVY_${c.lote._id}`,
      message: `⚠️ Se pronostican ${c.rain24h.toFixed(1)} mm en 24 h. Retrasar siembra/fertilización en lote ${c.lote.nombre}.`,
    };
  }
  return null;
};

/** 2. Viento + baja humedad → deriva de pulverización */
const driftRule: Rule = (c) => {
  if (c.windGust > 35 && c.humidity < 60) {
    return {
      id: `DRIFT_${c.lote._id}_${Date.now() >> 16}`,
      message: `💨 Viento ${c.windGust} km/h y HR ${c.humidity} %. Postergar aplicación en ${c.lote.nombre}.`,
    };
  }
  return null;
};

/** 3. GDD alcanzan estadio clave */
const gddStages: Record<'maiz' | 'soja' | 'trigo', { gdd: number; label: string }[]> = {
  maiz: [
    { gdd: 100, label: 'V2' },
    { gdd: 450, label: 'V6' },
    { gdd: 1000, label: 'VT' },
  ],
  soja: [
    { gdd: 70, label: 'V2' },
    { gdd: 450, label: 'R1' },
  ],
  trigo: [
    { gdd: 300, label: 'Hoja bandera' },
    { gdd: 600, label: 'Espigado' },
  ],
};
const gddRule: Rule = (c) => {
  const etapas = gddStages[c.lote.cultivo];
  const etapa = etapas.find(e => Math.abs(c.gddAcum - e.gdd) < 2);
  if (etapa) {
    return {
      id: `GDD_${etapa.label}_${c.lote._id}`,
      message: `🌱 ${capitalize(c.lote.cultivo)} en lote ${c.lote.nombre} llegó a ${etapa.label} (${c.gddAcum.toFixed(0)} GDD). Programar manejo.`,
    };
  }
  return null;
};


//--------------------------------------------------
// Job runner (schedule hourly)
//--------------------------------------------------
export function startAgroNotifyJob() {
  cron.schedule('* * * * *', async () => {
    try {
      const lots = await getActiveLots();
      for (const lote of lots) {
        await processLot(lote);
      }
    } catch (err) {
      console.error('[NotifyJob] error', err);
    }
  });
}

async function processLot(lote: Lot) {
  // 1. Datos climáticos
  const cur = await climaService.getSmnCurrent(lote.lat, lote.lon);
  const minute = await climaService.getTomorrowMinute(lote.lat, lote.lon);
  const rain24 = minute.data.timelines[0].intervals.slice(0, 24 * 60).reduce((a: number, i: any) => a + i.values.precipitationIntensity / 60, 0);
  const meteo = await climaService.getOpenMeteoAgro(lote.lat, lote.lon, 1);
  const et0 = meteo.daily.et0_fao_evapotranspiration[0];

  // 2. Actualiza GDD una vez al día
  const today = new Date().toISOString().slice(0, 10);
  const last = lote.gddDate ? lote.gddDate.toISOString().slice(0, 10) : null;
  let updatedToday = false;
  if (last !== today) {
    const gddDay = meteo.daily.gdd_base10[0];
    lote.gddAcum += gddDay;
    lote.gddDate = new Date();
    await updateLotGdd(lote._id, lote.gddAcum, lote.gddDate);
    updatedToday = true;
  }

  const ctx: RuleCtx = {
    lote,
    temp: cur.temp,
    humidity: cur.humidity,
    rain24h: rain24,
    windGust: minute.data.timelines[0].intervals[0].values.windGust ?? 0,
    gddAcum: lote.gddAcum,
    et0Hoy: et0,
  };

  for (const rule of [rainHeavyRule, driftRule]) {
    const res = rule(ctx);
    if (res && !lote.lastNotifs.includes(res.id)) {
      await pushToUser(lote.userId, res.message);
      await saveNotification(lote.parcelaId, res.id, res.message);
      lote.lastNotifs.push(res.id);
    }
  }

  if (updatedToday) {
    const res = gddRule(ctx);
    if (res && !lote.lastNotifs.includes(res.id)) {
      await pushToUser(lote.userId, res.message);
      await saveNotification(lote.parcelaId, res.id, res.message);
      lote.lastNotifs.push(res.id);
    }
  }
}

function capitalize(s: string) { return s.charAt(0).toUpperCase() + s.slice(1); }
