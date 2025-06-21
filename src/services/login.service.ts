import Usuario from '../models/usuario';
import { InvalidCredentialsError, UsuarioEliminadoError } from '../errors/loginErrors';
import {  UsuarioGoogleError } from '../errors/usuarioErrors';
import { sanitize } from '../helpers/sanitize';
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

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


}

export const loginService = new LoginService();
