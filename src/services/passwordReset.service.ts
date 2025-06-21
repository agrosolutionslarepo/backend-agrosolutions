import Usuario from '../models/usuario';
import { randomString } from '../helpers/randomString';
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');

class PasswordResetService {
  async enviarCodigo(email: string): Promise<void> {
    const usuario = await Usuario.findOne({ email });
    if (!usuario) {
      throw new Error('Usuario no encontrado');
    }
    const codigo = randomString(6);
    usuario.codigoReset = codigo;
    usuario.resetExpira = new Date(Date.now() + 60 * 60 * 1000); // 1h
    await usuario.save();

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: email,
      subject: 'Código para restablecer contraseña',
      text: `Tu código es: ${codigo}`,
    });
  }

  async resetear(email: string, codigo: string, nueva: string) {
    const usuario = await Usuario.findOne({ email });
    if (!usuario || usuario.codigoReset !== codigo) {
      throw new Error('Código inválido');
    }
    if (!usuario.resetExpira || usuario.resetExpira.getTime() < Date.now()) {
      throw new Error('Código expirado');
    }
    usuario.contraseña = await bcrypt.hash(nueva, 8);
    usuario.codigoReset = undefined as any;
    usuario.resetExpira = undefined as any;
    await usuario.save();
    return usuario;
  }
}

export const passwordResetService = new PasswordResetService();
