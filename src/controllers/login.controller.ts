import { Request, Response, NextFunction } from 'express';
import { loginService } from '../services/login.service';


class LoginController {

    public async loguear(req: Request, res: Response, next: NextFunction): Promise<void> {
        const { email, contraseña } = req.body;
        
        try {
            // Llamar al servicio de autenticación
            const result = await loginService.loguear(email, contraseña);
            
            // Enviar la respuesta con el JWT
            res.send(result);
        } catch (error) {
            next(error); // Pasa el error al middleware de manejo de errores
        }
    }

    public async loginConGoogle(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { idToken } = req.body;

    if (!idToken) {
      res.status(400).json({ error: 'Token de Google no proporcionado' });
      return;
    }

    try {
      const result = await loginService.loginConGoogle(idToken);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

}

export default new LoginController();