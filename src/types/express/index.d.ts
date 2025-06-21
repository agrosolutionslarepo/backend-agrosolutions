import { IUserToken } from '../custrequest'; // Ruta correcta según tu estructura


declare module 'express' {
    interface Request {
      user?: IUserToken;
    }
  }
