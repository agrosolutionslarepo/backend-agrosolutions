import { Request, Response, NextFunction } from 'express';
import { usuarioService } from '../services/usuario.service';
import { loginService } from '../services/login.service';
import { passwordResetService } from '../services/passwordReset.service';
import { notificationService } from '../services/notification.service';
import { EmpresaExistenteError } from '../errors/empresaErrors';
import { HttpError } from '../errors/HttpError';

class UsuarioController {

  public registrarse = async (req: Request, res: Response, next: NextFunction): Promise<void> => { // funciona
    try {
        const { codigoInvitacion, empresaData, ...usuarioData } = req.body;
        const usuarioCreado = await usuarioService.registrarse(usuarioData, codigoInvitacion, empresaData);
        res.status(201).json(usuarioCreado);
    } catch (error) {
        if (error instanceof EmpresaExistenteError) {
            next(new HttpError(409, error.message));
        } else {
            next(error);
        }
    }
  };

  public async solicitarReset(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;
      await passwordResetService.enviarCodigo(email);
      res.status(200).json({ message: 'Código enviado' });
    } catch (error) {
      next(error);
    }
  }

  public async confirmarReset(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, codigo, contraseña } = req.body;
      await passwordResetService.resetear(email, codigo, contraseña);
      res.status(200).json({ message: 'Contraseña actualizada'});
    } catch (error) {
      next(error);
    }
  }

  public async deleteUsuario(req: Request, res: Response, next: NextFunction) {
    try {
        const idUsuario = req.user?.id;

        if (!idUsuario) {
            return next(new HttpError(400, "ID de usuario no encontrado en el token"));
        }

        const usuarioEliminado = await usuarioService.deleteUsuario(idUsuario);

        if (!usuarioEliminado) {
            return next(new HttpError(404, "Usuario no encontrado"));
        }

        return res.status(200).json({
            message: "Usuario eliminado correctamente",
            usuario: usuarioEliminado,
        });
    } catch (error) {
        next(error); // Deja que Express maneje el error con su middleware
    }
  }

  public async updateContraseña(req: Request, res: Response, next: NextFunction) {
    const id = req.user?.id;

    // Verificamos si 'id' es undefined y devolvemos un error si es el caso
    if (!id) {
        return next(new HttpError(400, 'ID de usuario no encontrado en el token'));
    }

    const {oldContraseña, contraseña } = req.body;

    try {
        const check = await loginService.validarContraseña(id, oldContraseña);
        const usuarioActualizado = await usuarioService.cambioContraseña(check, id, { contraseña })

        if (!usuarioActualizado) {
            return next(new HttpError(404, 'Usuario no encontrado'));
        }

        return res.status(200).json({
            message: "Usuario actualizado correctamente",
            usuario: usuarioActualizado
        });
    } catch (error) {
        next(error); // Delega el error al middleware de Express
    }
  }

  public async updateUsuario(req: Request, res: Response, next: NextFunction) {
    const id = req.user?.id;

    // Verificamos si 'id' es undefined y devolvemos un error si es el caso
    if (!id) {
        return next(new HttpError(400, 'ID de usuario no encontrado en el token'));
    }

    const { nombre, apellido } = req.body;

    try {
        const usuarioActualizado = await usuarioService.updateUsuario(id, { nombre, apellido });

        if (!usuarioActualizado) {
            return next(new HttpError(404, 'Usuario no encontrado'));
        }

        return res.status(200).json({
            message: "Usuario actualizado correctamente",
            usuario: usuarioActualizado
        });
    } catch (error) {
        next(error); // Delega el error al middleware de Express
    }
  }
  
  public async getUsuariosMismaEmpresa(req: Request, res: Response, next: NextFunction) {
    try {
        const id = req.user?.id;

        if (!id) {
            return next(new HttpError(401, "Usuario no autenticado"));
        }

        const usuarios = await usuarioService.getUsuariosMismaEmpresa(id);
        return res.json(usuarios);
    } catch (error: any) {
        next(error);
    }
  }

  public async getUsuarioAutenticado(req: Request, res: Response, next: NextFunction) {
    try {
      const idUsuario = req.user?.id;
      if (!idUsuario) return next(new HttpError(401, 'Token inválido o no presente'));

      const usuario = await usuarioService.getUsuarioById(idUsuario);
      if (!usuario) return next(new HttpError(404, 'Usuario no encontrado'));

      res.json(usuario);
    } catch (error) {
      next(error);
    }
  }

  public async saveExpoToken(req: Request, res: Response, next: NextFunction) {
    try {
      const idUsuario = req.user?.id;
      if (!idUsuario) return next(new HttpError(401, 'No autenticado'));

      const { token } = req.body;
      if (!token) return next(new HttpError(400, 'Token requerido'));

      const usuario = await usuarioService.setExpoToken(idUsuario, token);
      res.json(usuario);
    } catch (error) {
      next(error);
    }
  }

  public async getUltimasNotificaciones(req: Request, res: Response, next: NextFunction) {
    try {
      const idUsuario = req.user?.id;
      if (!idUsuario) return next(new HttpError(401, 'No autenticado'));

      const notifs = await notificationService.getLastForUser(idUsuario, 10);
      res.json(notifs);
    } catch (error) {
      next(error);
    }
  }

  public async deleteUsuarioDeMiEmpresa(req: Request, res: Response, next: NextFunction) {
    try {
      const idAdmin = req.user?.id;
      const idUsuarioReasignar = req.params.id;
  
      if (!idAdmin) {
        return next(new HttpError(401, 'No autenticado'));
      }
  
      const resultado = await usuarioService.deleteUsuarioDeMiEmpresa(idAdmin, idUsuarioReasignar);
  
      return res.status(200).json({ message: 'Usuario reasignado correctamente', usuario: resultado });
    } catch (error) {
      next(error);
    }
  }

}

export default new UsuarioController();