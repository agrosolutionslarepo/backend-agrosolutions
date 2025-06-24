import Usuario from '../models/usuario';
import { InvalidCredentialsError, UsuarioEliminadoError } from '../errors/loginErrors';
import {  UsuarioGoogleError, UsuarioRegistradoLocalmenteError } from '../errors/usuarioErrors';
import { sanitize } from '../helpers/sanitize';
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
import { OAuth2Client } from 'google-auth-library';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const EMPRESA_FIJA_ID = '6840da01ba52fec6d68de6bc';

class LoginService {

    public async loguear(email: string, contraseña: string) { // funciona
        try {
            const cleanEmail = sanitize(email);
            const cleanPass = sanitize(contraseña);
            // Buscar usuario por email
            const user = await Usuario.findOne({ email: cleanEmail });
            if (!user) {
                throw new InvalidCredentialsError();
            }

            console.log('Usuario encontrado:', user);

            // Verificar si el usuario está eliminado
            if (user.estado === false) {
                throw new UsuarioEliminadoError();
            }

            // Comparar contraseñas
            const passwordCorrect = await bcrypt.compare(cleanPass, user.contraseña);
            if (!passwordCorrect) {
                throw new InvalidCredentialsError();
            }

            // Información del token
            const infoToken = {
                id: user.id,
                nombre: user.nombre,
                apellido: user.apellido,
                administrador: user.administrador,
                nombreUsuario: user.nombreUsuario,
                email: user.email,
                idEmpresa: user.empresa,
            };

            // Crear el token
            const token = jwt.sign(infoToken, process.env.SECRET as string);

            // Retornar el token
            return { jwt: token };
        } catch (error) {
            throw error;
        }
    }

    public async validarContraseña(id: string, contraseña: string) {

        try {
            const user = await Usuario.findById(id);
            if (!user) {
                throw new InvalidCredentialsError();
            }
            
            if (user.authType == "google") {
                throw new UsuarioGoogleError();
            }

            if (user.estado === false) {
                throw new UsuarioEliminadoError();
            }

            const cleanPass = sanitize(contraseña);
            const passwordCorrect = await bcrypt.compare(cleanPass, user.contraseña);
            if (!passwordCorrect) {
                throw new InvalidCredentialsError();
            }

            return passwordCorrect;

        }

        catch (error) {
            throw error;
        }

    }

    public async loginConGoogle(idToken: string) {
        try {
            const ticket = await googleClient.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID,
            });

            const payload = ticket.getPayload();
            if (!payload || !payload.email) {
            throw new Error('Token inválido');
            }

            const email = sanitize(payload.email);
            let usuario = await Usuario.findOne({ email });

            if (usuario) {
            if (usuario.authType !== 'google') {
                throw new UsuarioRegistradoLocalmenteError();
            }

            if (usuario.estado === false) {
                throw new UsuarioEliminadoError();
            }
            } else {
            // Crear nuevo usuario
            usuario = await Usuario.create({
                nombre: payload.given_name || '',
                apellido: payload.family_name || '',
                email,
                googleId: payload.sub,
                estado: true,
                administrador: true,
                nombreUsuario: payload.name || email,
                empresa: EMPRESA_FIJA_ID,
                authType: 'google',
            });
            }

            const tokenPayload = {
            id: usuario.id,
            nombre: usuario.nombre,
            apellido: usuario.apellido,
            administrador: usuario.administrador,
            nombreUsuario: usuario.nombreUsuario,
            email: usuario.email,
            idEmpresa: usuario.empresa,
            };

            const jwtToken = jwt.sign(tokenPayload, process.env.SECRET as string);
            return { jwt: jwtToken };

        } catch (error) {
            throw error;
        }
    }


}

export const loginService = new LoginService();
