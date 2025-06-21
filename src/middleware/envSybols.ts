import { Request, Response, NextFunction } from 'express';
import { EnvVarMissingError } from '../errors/EnvVarMissingError';

export function parseSymbolsStrict(_req: Request, _res: Response, next: NextFunction) {
  try {
    const symbolsEnv = process.env.SYMBOLS;
    if (!symbolsEnv) throw new EnvVarMissingError('SYMBOLS');

    // Guardamos el array en res.locals y en el singleton app
    const symbols = symbolsEnv.split(',').map(s => s.trim().toUpperCase());
    _req.app.locals.symbols = symbols;

    next();
  } catch (error) {
    next(error);
  }
}