import { Types } from 'mongoose';
import Empresa, { IEmpresa } from '../models/empresa';
import Usuario from '../models/usuario';
import { semillaService } from './semilla.service';
import { EmpresaExistenteError } from "../errors/empresaErrors";
import jwt from 'jsonwebtoken';
import { IUserToken } from '../custrequest'; // Asegurate de tener esta interfaz
import { sanitize } from '../helpers/sanitize';


class EmpresaService {

  public async createEmpresa(data: IEmpresa): Promise<IEmpresa> { // funciona
    const clean = sanitize({ ...data }) as IEmpresa;
    if (typeof clean.nombreEmpresa !== 'string') {
      throw new Error('Los datos de entrada son inválidos');
    }

    try {
      const empresaCreada: IEmpresa = await Empresa.create(clean);
      return empresaCreada;
    } catch (error: any) {
      throw new Error(error.message || 'Error al crear la empresa');
    }
  }

  public async updateEmpresa(id: string, data: Partial<IEmpresa>): Promise<IEmpresa | null> { // funciona
    const cleanId = sanitize(id) as string;
    const clean = sanitize({ ...data }) as Partial<IEmpresa>;
    if (!clean.nombreEmpresa || typeof clean.nombreEmpresa !== 'string') {
      throw new Error('El nombre de la empresa es obligatorio y debe ser un string');
    }

    try {
      const empresaActualizada = await Empresa.findByIdAndUpdate(cleanId, clean, { new: true });

      if (!empresaActualizada) {
        throw new Error('Empresa no encontrada');
      }

      return empresaActualizada;
    } catch (error: any) {
      throw new Error(error.message || 'Error al actualizar la empresa');
    }
  }

  public async getNombreEmpresa(id: String): Promise<String> {
    const cleanId = sanitize(id) as string;
    const empresa = await Empresa.findById(cleanId);

    if (!empresa) {
      throw new Error('Empresa no encontrada');
    }

    return empresa.nombreEmpresa;
  }
    
  public async deleteEmpresa(id: String): Promise<IEmpresa | null> { //funciona
    try {
        const cleanId = sanitize(id) as string;
        const empresaEliminada = await Empresa.findByIdAndUpdate(
            cleanId,
            { estado: false },
            { new: true }
        );

        if (!empresaEliminada) {
            throw new Error("Empresa no encontrada");
        }

        // Desactivar usuarios asociados a la empresa
        await Usuario.updateMany({ empresa: cleanId }, { estado: false });

        return empresaEliminada;
    } catch (error: any) {
        throw new Error(error.message || "Error al eliminar la empresa");
    }
  }

  public async getEmpresaById(id: string | Types.ObjectId) {
    const cleanId = sanitize(id as string) as string;
    const empresa = await Empresa.findById(cleanId);
    return empresa;
  }

  public async getEmpresaByCodigo(codigoInvitacion: string) {
    const cleanCode = sanitize(codigoInvitacion) as string;
    const empresa = await Empresa.findOne({ codigoInvitacion: cleanCode });
    return empresa;
  }

  public async crearEmpresaDesdeGoogle(nombreEmpresa: string, userId: string): Promise<{ empresa: IEmpresa; jwt: string }> {
    const yaExiste = await Empresa.exists({ nombreEmpresa });
    if (yaExiste) {
      throw new EmpresaExistenteError();
    }
  
    // Crear la empresa real
    const nuevaEmpresa = await Empresa.create({
      nombreEmpresa,
      estado: true,
      fechaCreacion: new Date(),
    });
  
    // Actualizar al usuario: asignar empresa y dejarlo como administrador
    const updatedUser = await Usuario.findByIdAndUpdate(
      userId,
      {
        empresa: nuevaEmpresa._id,
        administrador: true,
      },
      { new: true } // <- necesario para obtener el documento actualizado
    );
  
    if (!updatedUser) {
      throw new Error('Usuario no encontrado al actualizar');
    }
  
    // Crear semillas base
    await semillaService.crearSemillasBase(nuevaEmpresa._id.toString());
  
    const tokenPayload: IUserToken = {
      id: updatedUser._id.toString(),
      nombre: updatedUser.nombre.toString(),
      apellido: updatedUser.apellido.toString(),
      administrador: Boolean(updatedUser.administrador),
      nombreUsuario: updatedUser.nombreUsuario.toString(),
      email: updatedUser.email.toString(),
      idEmpresa: nuevaEmpresa._id.toString(),
    };
  
    const token = jwt.sign(tokenPayload, process.env.SECRET as string);
  
    return {
      empresa: nuevaEmpresa,
      jwt: token,
    };
  }
  
}



export const empresaService = new EmpresaService();
