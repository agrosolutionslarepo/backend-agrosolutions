import Usuario, { IUsuario } from '../models/usuario';
import { IEmpresa } from '../models/empresa';
import Empresa from '../models/empresa';
import { UsuarioExistenteError } from "../errors/usuarioErrors";
import { EmpresaExistenteError } from "../errors/empresaErrors";
import { empresaService } from './empresa.service';
import { semillaService } from './semilla.service';
import { inviteCodeService } from './inviteCodes.service';
import { sanitize } from '../helpers/sanitize';
const bcrypt = require('bcrypt');

class UsuarioService {

  public async registrarse(nuevoUsuario: IUsuario, codigoInvitacion?: string, empresaData?: IEmpresa): Promise<IUsuario> {
    const cleanUser = sanitize({ ...nuevoUsuario }) as IUsuario;
    const cleanEmpresa = empresaData ? sanitize({ ...empresaData }) as IEmpresa : undefined;

    if (await Usuario.exists({ email: cleanUser.email })) {
        throw new UsuarioExistenteError();
    }

    let empresa: IEmpresa | null = null;

    if (codigoInvitacion) {
        // Si hay código de invitación, busca la empresa asociada
        let inviteDoc = await inviteCodeService.checkInviteCode(codigoInvitacion);
        const idEmpresaStr = inviteDoc.empresa.toString();
        empresa = await empresaService.getEmpresaById(idEmpresaStr);
        if (!empresa) {
            throw new UsuarioExistenteError("Código de invitación inválido o empresa no encontrada");
        }
        // Si el usuario se está uniendo con invitación, no es administrador
        cleanUser.administrador = false;
    } else if (empresaData) {
        // Si está creando una empresa nueva, asignar fecha de creación y registrar la empresa
        if (!cleanEmpresa) throw new UsuarioExistenteError("Faltan datos para empresa");
        const exists = await Empresa.exists({ nombreEmpresa: cleanEmpresa.nombreEmpresa });
        if (exists) {
            throw new EmpresaExistenteError();
        }
        cleanEmpresa.fechaCreacion = new Date();
        empresa = await empresaService.createEmpresa(cleanEmpresa);
        
        // Crear semillas base con stock 0
        await semillaService.crearSemillasBase(empresa._id);

        // El primer usuario que crea la empresa es administrador
        cleanUser.administrador = true;
    } else {
        throw new UsuarioExistenteError("Faltan datos para empresa");
    }

    // Hashear la contraseña antes de guardar
    cleanUser.contraseña = await bcrypt.hash(cleanUser.contraseña, 8);
    cleanUser.empresa = empresa._id;
    cleanUser.estado = true;

    return await Usuario.create(cleanUser);
  }

  public async deleteUsuario(id: string): Promise<IUsuario | null> {
    try {
      const cleanId = sanitize(id) as string;
      const usuario = await Usuario.findById(cleanId);
      if (!usuario) {
        throw new Error('Usuario no encontrado');
      }
  
      // Si el usuario es administrador, desactivar empresa y reasignar otros usuarios
      if (usuario.administrador && usuario.empresa) {
        const empresaId = usuario.empresa;
        const empresaFicticiaId = '6840da01ba52fec6d68de6bc';
  
        // 🔒 Desactivar la empresa actual
        await Empresa.findByIdAndUpdate(empresaId, { estado: false });
  
        // 🔄 Reasignar todos los usuarios activos de esa empresa (excepto el admin)
        await Usuario.updateMany(
          { empresa: empresaId, _id: { $ne: usuario._id }, estado: true },
          { empresa: empresaFicticiaId }
        );
      }
  
      // 🔒 Desactivar al usuario (sea admin o no)
      usuario.estado = false;
      await usuario.save();
  
      return usuario;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(error.message || 'Error al eliminar usuario');
      }
      throw new Error('Error desconocido al eliminar usuario');
    }
  }

  public async updateUsuario(id: string, datosActualizados: Partial<IUsuario>): Promise<IUsuario | null> {
    try {
        const cleanId = sanitize(id) as string;
        // Buscar el usuario por ID
        const usuario = await Usuario.findById(cleanId);
        if (!usuario) {
            throw new Error('Usuario no encontrado');
        }

        // Verificar qué campos se actualizarán
        const clean = sanitize({ ...datosActualizados }) as Partial<IUsuario>;
        if (clean.nombre !== undefined) {
            usuario.nombre = clean.nombre;
        }
        if (clean.apellido !== undefined) {
            usuario.apellido = clean.apellido;
        }

        // Guardar los cambios
        await usuario.save();

        return usuario;
    } catch (error: unknown) {
        if (error instanceof Error) {
            throw new Error(error.message || 'Error al actualizar usuario');
        }
        throw new Error('Error desconocido al actualizar usuario');
    }
  }

  public async cambioContraseña(check: boolean, id: string, datosActualizados: Partial<IUsuario>): Promise<IUsuario | null> {
    try {
        if(!check){
          throw new Error('invalid credentials');
        }
        const cleanId = sanitize(id) as string;
        const usuario = await Usuario.findById(cleanId);
        if (!usuario) {
            throw new Error('Usuario no encontrado');
        }

        // Verificar qué campos se actualizarán
        const clean = sanitize({ ...datosActualizados }) as Partial<IUsuario>;
        if (clean.contraseña !== undefined) {
            usuario.contraseña = await bcrypt.hash(clean.contraseña, 8);
            console.log(usuario.contraseña);
        }  else{
          
          throw new Error('invalid credentials');

        }

        // Guardar los cambios
        await usuario.save();

        return usuario; //revisar
      
    } catch (error: unknown) {
        if (error instanceof Error) {
            throw new Error(error.message || 'Error al actualizar usuario');
        }
        throw new Error('Error desconocido al actualizar usuario');
    }
  }

  public async getUsuariosMismaEmpresa(id: String): Promise<{ nombreUsuario: String }[]> { // funciona
    try {
        const cleanId = sanitize(id as string) as string;
        // Buscar el usuario logueado para obtener su empresa
        const usuario = await Usuario.findById(cleanId);
        if (!usuario) {
            throw new Error('Usuario no encontrado');
        }

        // Buscar otros usuarios de la misma empresa, excluyendo al usuario logueado
        const usuarios = await Usuario.find(
            { empresa: usuario.empresa, _id: { $ne: usuario._id } },
            { nombreUsuario: 1 } // Solo traemos el nombreUsuario 
        );

        return usuarios;
    } catch (error: unknown) {
        if (error instanceof Error) {
            throw new Error(error.message || 'Error al obtener usuarios de la empresa');
        }
        throw new Error('Error desconocido al obtener usuarios de la empresa');
    }
  }
  
  public async getUsuarioById(id: string) {
    const cleanId = sanitize(id) as string;
    return Usuario.findById(cleanId).select('nombre apellido nombreUsuario email administrador empresa fechaNacimiento');
  }

  public async setExpoToken(id: string, token: string) {
    const cleanToken = sanitize(token) as string;
    const cleanId = sanitize(id) as string;
    const usuario = await Usuario.findByIdAndUpdate(
      cleanId,
      { expoToken: cleanToken },
      { new: true }
    );
    if (!usuario) {
      throw new Error('Usuario no encontrado');
    }
    return usuario;
  }

  public async deleteUsuarioDeMiEmpresa(idAdmin: string, idUsuario: string): Promise<IUsuario> {
    const admin = await Usuario.findById(sanitize(idAdmin));
    if (!admin || !admin.administrador) {
      throw new Error('No autorizado: solo administradores pueden realizar esta acción');
    }

    const usuario = await Usuario.findById(sanitize(idUsuario));
    if (!usuario) {
      throw new Error('Usuario a reasignar no encontrado');
    }
  
    if (usuario.empresa.toString() !== admin.empresa.toString()) {
      throw new Error('El usuario no pertenece a tu empresa');
    }
  
    const empresaFicticiaId = '6840da01ba52fec6d68de6bc';
    usuario.empresa = empresaFicticiaId as any;
    await usuario.save();
  
    return usuario;
  }
  
}

export const usuarioService = new UsuarioService();
