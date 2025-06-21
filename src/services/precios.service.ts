import Price from '../models/precios';
import { sanitize } from '../helpers/sanitize';

class PreciosService {
public async savePrice(doc: { symbol: string; price: number; ts: Date }) {
  const clean = sanitize({ ...doc }) as { symbol: string; price: number; ts: Date };
  // Evita duplicar dentro de la misma ventana de 40 min
  return Price.findOneAndUpdate(
    { symbol: clean.symbol, ts: { $lte: clean.ts, $gte: new Date(clean.ts.getTime() - 40 * 60000) } },
    clean,
    { upsert: true, new: true }
  );
}

public async getLatest(symbol: string) {
  const cleanSymbol = sanitize(symbol) as string;
  return Price.findOne({ symbol: cleanSymbol }).sort({ ts: -1 }).lean();
}

public async getHistory(symbol: string, limit = 100) {
  const cleanSymbol = sanitize(symbol) as string;
  return Price.find({ symbol: cleanSymbol }).sort({ ts: -1 }).limit(limit).lean();
}

}

export const preciosService = new PreciosService();