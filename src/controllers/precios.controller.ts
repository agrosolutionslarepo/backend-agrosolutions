import { Request, Response, NextFunction } from 'express';
import { preciosService } from '../services/precios.service';
import { HttpError } from '../errors/HttpError';

export async function latest(req: Request, res: Response, next: NextFunction) {
  try {
    const { symbol } = req.params;
    const doc = await preciosService.getLatest(symbol.toUpperCase());
    if (!doc) return next(new HttpError(404, 'not found'));
    res.json(doc);
  } catch (err) {
    next(err);
  }
}

export async function history(req: Request, res: Response, next: NextFunction) {
  try {
    const { symbol } = req.params;
    const limit = Number(req.query.limit) || 100;
    const docs = await preciosService.getHistory(symbol.toUpperCase(), limit);
    res.json(docs);
  } catch (err) {
    next(err);
  }
}
