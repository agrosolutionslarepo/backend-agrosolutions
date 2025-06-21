import Cosecha, { ICosecha } from '../models/cosecha';
import Cultivo from '../models/cultivo';
import { sanitize } from '../helpers/sanitize';

class CosechaService {
  public async getAllCosechas(idEmpresa: string): Promise<ICosecha[]> {
    const cleanEmpresa = sanitize(idEmpresa) as string;
    return Cosecha.find({ empresa: cleanEmpresa, estado: true }).populate('cultivo');
  }

  public async getCosechaById(id: string, idEmpresa: string): Promise<ICosecha | null> {
    const cleanId = sanitize(id) as string;
    const cleanEmpresa = sanitize(idEmpresa) as string;
    return Cosecha.findOne({ _id: cleanId, empresa: cleanEmpresa }).populate('cultivo');
  }

  public async createCosecha(data: Partial<ICosecha>, idEmpresa: string): Promise<ICosecha> {
    const cleanEmpresa = sanitize(idEmpresa) as string;
    const clean = sanitize({ ...data }) as Partial<ICosecha>;
    const { cultivo, cantidadCosechada, unidad, observaciones } = clean;
  
    // Validar que el cultivo pertenece a la empresa
    const cultivoExiste = await Cultivo.findOne({ _id: cultivo, empresa: cleanEmpresa });
    if (!cultivoExiste) {
      throw new Error('Cultivo no válido para esta empresa');
    }
  
    const nueva = new Cosecha({
      fechaCosecha: new Date(), // Usamos fecha actual automáticamente
      cantidadCosechada,
      unidad,
      observaciones,
      cultivo,
      empresa: cleanEmpresa,
      estado: true,
    });
  
    return nueva.save();
  }

  public async updateCosecha(id: string, data: Partial<ICosecha>, idEmpresa: string): Promise<ICosecha | null> {
    const cleanId = sanitize(id) as string;
    const cleanEmpresa = sanitize(idEmpresa) as string;
    const actual = await Cosecha.findOne({ _id: cleanId, empresa: cleanEmpresa });
    if (!actual) throw new Error('Cosecha no encontrada o no pertenece a la empresa');

    const clean = sanitize({ ...data }) as Partial<ICosecha>;
    const updateData = {
      ...clean,
      cultivo: clean.cultivo ?? actual.cultivo,
    };

    return Cosecha.findByIdAndUpdate(cleanId, updateData, { new: true });
  }

  public async deleteCosecha(id: string, idEmpresa: string): Promise<ICosecha | null> {
    const cleanId = sanitize(id) as string;
    const cleanEmpresa = sanitize(idEmpresa) as string;
    const cosecha = await Cosecha.findOne({ _id: cleanId, empresa: cleanEmpresa });

    if (!cosecha) throw new Error('Cosecha no encontrada o no pertenece a la empresa');

    cosecha.estado = false;
    return cosecha.save();
  }
}

export const cosechaService = new CosechaService();
