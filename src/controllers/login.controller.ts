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

}

export default new LoginController();