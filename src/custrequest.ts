import { Request } from "express";

// Definimos la estructura del usuario dentro del request
export interface IUserToken {
  id: string;
  nombre: string,
  apellido: string,
  administrador: boolean,
  nombreUsuario: string;
  email: string;
  idEmpresa: string;
}

export interface CustRequest extends Request {
  user?: IUserToken;
}