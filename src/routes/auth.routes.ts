import express, { Request, Response, NextFunction } from 'express';
import passport from '../auth/googleAuth';

const router = express.Router();

// 🔹 Iniciar auth con Google
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email'],
  session: false,
}));

// 🔹 Callback de Google
router.get('/google/callback', (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate('google', { session: false }, (err, data) => {
    if (err || !data) {
      return res.status(401).json({ error: 'Autenticación con Google fallida' });
    }

    // Ya devolvemos los datos del usuario y el token
    return res.json({
      usuario: data.usuario,
      jwt: data.jwt,
    });
  })(req, res, next);
});

export default router;