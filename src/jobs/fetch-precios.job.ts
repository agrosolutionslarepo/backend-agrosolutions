// src/jobs/fetch-precios.job.ts
import cron from 'node-cron';
import { fmpService } from '../services/fmp.service';
import { preciosService }  from '../services/precios.service';

/**
 * Lanza un fetch inmediato y luego programa la ejecución
 * a los minutos 00 y 30 de cada hora.
 */
export function startPriceJob(symbols: string[]) {
  // 1) Ejecución instantánea al boot
  runOnce(symbols).catch(console.error);

  // 2) Ejecución periódica (hh:00 y hh:30)
  cron.schedule('0 0 * * *', () => runOnce(symbols));
}

/**
 * Obtiene y guarda el precio de cada símbolo.
 * Se reutiliza para la llamada inicial y para el cron.
 */
async function runOnce(symbols: string[]) {
  for (const sym of symbols) {
    try {
      const quote = await fmpService.fetchQuote(sym);  // llama a FMP
      await preciosService.savePrice(quote);               // persiste en Mongo
      console.log(`[JOB] ${sym} ${quote.price}`);
    } catch (err) {
      console.error(`[JOB] error ${sym}:`, err);
    }
  }
}
