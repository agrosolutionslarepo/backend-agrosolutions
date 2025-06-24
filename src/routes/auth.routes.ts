import express from 'express';
import { OAuth2Client } from 'google-auth-library';
import Usuario from '../models/usuario';
import {  UsuarioGoogleError } from '../errors/usuarioErrors';
import { InvalidCredentialsError } from '../errors/loginErrors';
import { sanitize } from '../helpers/sanitize';
import jwt from 'jsonwebtoken';

dotenv.config();

const router = express.Router();
const client = new OAuth2Client('916278295990-872c52rl0j6sae8i7cvcqotv8jpta3l7.apps.googleusercontent.com');

router.post('/google/token', async (req, res) => {
  const { idToken } = req.body;

  if (!idToken) return res.status(400).json({ error: 'Token de Google faltante' });

  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: '916278295990-872c52rl0j6sae8i7cvcqotv8jpta3l7.apps.googleusercontent.com'
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) return res.status(401).json({ error: 'Token inválido' });

    const cleanEmail = sanitize(payload.email);
    const user = await Usuario.findOne({ email: cleanEmail });

    if (!user) throw new InvalidCredentialsError();
    if (user.authType !== 'google') throw new UsuarioGoogleError();

    const infoToken = {
      id: user.id,
      nombre: user.nombre,
      apellido: user.apellido,
      administrador: user.administrador,
      nombreUsuario: user.nombreUsuario,
      email: user.email,
      idEmpresa: user.empresa
    };

    const token = jwt.sign(infoToken, process.env.SECRET as string);

    return res.json({ jwt: token });
  } catch (error) {
    console.error('Error en login con Google:', error);
    return res.status(401).json({ error: 'Error en autenticación con Google' });
  }
});

export default router;