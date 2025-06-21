import { Request, Response, NextFunction } from 'express';
import { inviteCodeService } from '../services/inviteCodes.service';
import {
  InviteCodeDuplicateError,
} from '../errors/inviteCodesError';
import { HttpError } from '../errors/HttpError';
import { randomString } from '../helpers/randomString';
import jwt from 'jsonwebtoken';
import { IUserToken } from '../custrequest';
import Usuario from '../models/usuario';

const MAX_ATTEMPTS = 5; // reintentos ante colisión

class InviteCodesController {

  public async createInviteCodes(req: Request, res: Response, next: NextFunction) {
    try {
      const idEmpresa = req.user?.idEmpresa;
      if (!idEmpresa) return next(new HttpError(403, 'empresaId missing in token'));
      let lastErr: unknown = null;
      for (let attempts = 0; attempts < MAX_ATTEMPTS; attempts++) {
        const code = randomString(6);
        try {
          const doc = await inviteCodeService.createInviteCode(idEmpresa, code);
          return res.status(201).json(doc);
        } catch (err) {
          if (err instanceof InviteCodeDuplicateError) {
            // colisión: vuelve al for y prueba con nuevo código
            continue;
          }
          // otro tipo de error -> lo capturará el catch externo
          throw err;
        }
      }
      // se agotaron los intentos
      throw lastErr ?? new Error('Unexpected error generating invite code');
    } catch (e) {
      next(e);
    }
  }

  public async disableInviteCodes(req: Request, res: Response, next: NextFunction) {
    try {
      console.log(req.body.code);
      const idEmpresa = req.user?.idEmpresa;
      if (!idEmpresa) return next(new HttpError(403, 'empresaId missing in token'));
      await inviteCodeService.disableInviteCode(idEmpresa, req.body.code);
      return res.status(200).send('done');
    } catch (e) {
      next(e);
    }
  }

  public async checkInviteCodes(req: Request, res: Response, next: NextFunction) {
    try {
      const doc = await inviteCodeService.checkInviteCode(req.body.code);
      res.json({ valid: true, empresa: doc.empresa });
    } catch (e) {
      next(e);
    }
  }

  public async getActiveInviteCode(req: Request, res: Response, next: NextFunction) {
    try {
      const idEmpresa = req.user?.idEmpresa;

      if (!idEmpresa) {
        return next(new HttpError(403, 'ID de empresa no encontrado en el token'));
      }

      const code = await inviteCodeService.getActiveInviteCodeByEmpresaId(idEmpresa);

      return res.status(200).json({ codigo: code.codigo });
    } catch (error: any) {
      next(error);
    }
  }

  public async joinCompanyWithCode(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      const codigo = req.body.codigo;
  
      if (!userId || !codigo) {
        return next(new HttpError(400, 'Faltan datos: id de usuario o código'));
      }
  
      const empresaId = await inviteCodeService.getEmpresaIdByInviteCode(codigo);
      await inviteCodeService.attachUserToCompany(userId, empresaId);
  
      // 🔄 Obtener el usuario actualizado
      const updatedUser = await Usuario.findById(userId);
      if (!updatedUser) {
        return next(new HttpError(404, 'Usuario no encontrado después de actualizar empresa'));
      }
  
      // 🔐 Generar nuevo token
      const tokenPayload: IUserToken = {
        id: updatedUser._id.toString(),
        nombre: updatedUser.nombre.toString(),
        apellido: updatedUser.apellido.toString(),
        administrador: Boolean(updatedUser.administrador),
        nombreUsuario: updatedUser.nombreUsuario.toString(),
        email: updatedUser.email.toString(),
        idEmpresa: updatedUser.empresa.toString(),
      };
  
      const nuevoToken = jwt.sign(tokenPayload, process.env.SECRET as string);
  
      return res.status(200).json({
        message: 'Usuario vinculado correctamente a la empresa',
        jwt: nuevoToken, // ⬅️ devolvés el nuevo token al frontend
      });
    } catch (e) {
      next(e);
    }
  }
}

export default new InviteCodesController();