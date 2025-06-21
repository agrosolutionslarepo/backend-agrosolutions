import { haversine } from '../helpers/kmConversion';
import fetch from 'node-fetch';

class ClimaService{

//--------------------------------------------------
// 1. Servicio Meteorológico Nacional – obs + alertas
//--------------------------------------------------
public async getSmnCurrent(lat: number, lon: number) {
  // El endpoint oficial retorna todas las estaciones; filtramos la más cercana
  const res = await fetch('https://ws.smn.gob.ar/map_items/weather');
  const stations: any[] = await res.json();
  const closest = stations
    .map(s => ({ ...s, d: haversine(lat, lon, s.lat, s.lon) }))
    .sort((a, b) => a.d - b.d)[0];
  return {
    source: 'SMN',
    station: closest.name,
    temp: Number(closest.weather.temp),
    humidity: Number(closest.weather.humidity),
    precip_mm: Number(closest.weather.rain || 0),
    ts: closest.weather.dt
  };
}

//--------------------------------------------------
// 2. Open‑Meteo Agro – ET₀ Penman y GDD base 10 °C
//--------------------------------------------------
public async getOpenMeteoAgro(lat: number, lon: number, days = 7) {
    const hourly = 'temperature_2m';
    const daily  = 'et0_fao_evapotranspiration';
  
    const common = `latitude=${lat}&longitude=${lon}` +
      `&hourly=${hourly}&daily=${daily}` +
      `&temperature_unit=celsius&forecast_days=${days}&timezone=auto`;
  
    const url = `https://api.open-meteo.com/v1/forecast?${common}`;
    const res = await fetch(url);
    if (!res.ok) {
      const detail = await res.text();
      throw new Error(`Open‑Meteo ${res.status}: ${detail}`);
    }
    const json = await res.json();
  
    // 🟢 Cálculo local de GDD base 10 °C a partir de la serie horaria
    const gddDaily: number[] = [];
    const temps: number[] = json.hourly.temperature_2m as number[];
    const times: string[]  = json.hourly.time as string[];
  
    // Agrupa por día ISO‑YYYY‑MM‑DD
    const gddMap: Record<string, number> = {};
    temps.forEach((t, idx) => {
      const day = times[idx].slice(0, 10);
      const contrib = Math.max(0, t - 10) / 24; // hora a hora
      gddMap[day] = (gddMap[day] || 0) + contrib;
    });
    // Ordena por fecha y llena array
    Object.keys(gddMap).sort().forEach(d => gddDaily.push(Number(gddMap[d].toFixed(2))));
  
    json.daily.gdd_base10 = gddDaily;
    json.daily_units.gdd_base10 = '°C·día';
  
    return json;
  }

//--------------------------------------------------
// 3. Tomorrow.io hiperlocal (precipitación minuto a minuto)
//--------------------------------------------------
public async getTomorrowMinute(lat: number, lon: number) {
  const url = `https://api.tomorrow.io/v4/timelines?location=${lat},${lon}` +
    `&fields=temperature,precipitationIntensity,windGust` +
    `&timesteps=1m&units=metric&apikey=${process.env.TOMORROW_API}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Tomorrow.io ${res.status}`);
  return await res.json();
}

//--------------------------------------------------
// 4. NASA POWER – históricos diarios (1984‑hoy)
//--------------------------------------------------
public async getPowerDaily(lat: number, lon: number, start: string, end: string) {
    const url = `https://power.larc.nasa.gov/api/temporal/daily/point?parameters=T2M_MAX,T2M_MIN,PRECTOT,GHI&start=${start}&end=${end}` +
    `&latitude=${lat}&longitude=${lon}&format=JSON`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`NASA POWER ${res.status}`);
  return await res.json();
}


}
//--------------------------------------------------
// Ejemplo de exportación agrupada (opcional)
//--------------------------------------------------
export const climaService = new ClimaService();