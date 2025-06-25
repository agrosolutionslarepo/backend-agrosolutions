import { Request, Response, NextFunction } from 'express';
import { HttpError } from '../errors/HttpError';

const ERROR_HANDLERS = {
  JsonWebTokenError: (res: Response) =>
    res.status(401).json({ error: 'token missing or invalid' }),

  TokenExpiredError: (res: Response) =>
    res.status(401).json({ error: 'token expired' }),

  InvalidCredentialsError: (res: Response, error: Error) =>
    res.status(401).json({ error: error.message }),

  UsuarioExistenteError: (res: Response, error: Error) =>
    res.status(409).json({ error: error.message }),
  
  UsuarioGoogleError: (res: Response, error: Error) =>
    res.status(409).json({ error: error.message }),

  UsuarioGoogleLoginError: (res: Response, error: Error) =>
    res.status(409).json({ error: error.message }),

  EmpresaExistenteError: (res: Response, error: Error) =>
    res.status(409).json({ error: error.message }),

  UsuarioEliminadoError: (res: Response, error: Error) =>
    res.status(403).json({ error: error.message }), 
  
  EnvVarMissingError: (res: Response, error: Error) => 
    res.status(500).json({ error: error.message }),

  InviteCodeNotFoundError: (res: Response, err: Error) =>
    res.status(404).json({ error: err.message }),
  
  InviteCodeDisabledError: (res: Response, err: Error) =>
    res.status(403).json({ error: err.message }),

  InviteCodeDuplicateError: (res: Response, err: Error) =>
    res.status(403).json({ error: err.message }),

  InviteCodeExistError: (res: Response, err: Error) =>
    res.status(403).json({ error: err.message }),

  LatLongRequiredError: (res: Response, err: Error) =>
    res.status(422).json({ error: err.message }),

  defaultError: (res: Response, error: Error) => {
    console.error("Unhandled error:", error.name, error.message); // Log para depuración
    res.status(500).json({ error: 'internal server error' });
  },
};

module.exports = (
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  // Log every error for troubleshooting
  console.error(error);

  if (error instanceof HttpError) {
    return res.status(error.status).json({ error: error.message });
  }

  const handler =
    ERROR_HANDLERS[error.name as keyof typeof ERROR_HANDLERS] ||
    ERROR_HANDLERS.defaultError;

  handler(res, error);
};

