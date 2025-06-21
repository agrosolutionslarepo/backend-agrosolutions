import Cultivo, { ICultivo } from '../models/cultivo';
import Semilla from '../models/semilla';
import Parcela from '../models/parcela';

class CultivoService {
  public async getAllCultivos(idEmpresa: string): Promise<ICultivo[]> {
    return Cultivo.find({ empresa: idEmpresa, estado: true }).populate('semilla').populate('parcela');
  }

  public async getCultivoById(id: string, idEmpresa: string): Promise<ICultivo | null> {
    return Cultivo.findOne({ _id: id, empresa: idEmpresa }).populate('semilla').populate('parcela');
  }

  public async createCultivo(data: Partial<ICultivo>, idEmpresa: string): Promise<ICultivo> {
    const { semilla, parcela, cantidadSemilla, unidad, fechaSiembra, fechaCosecha } = data;

    // Validar existencia de semilla y parcela dentro de la empresa
    const semillaExiste = await Semilla.findOne({ _id: semilla, empresa: idEmpresa });
    const parcelaExiste = await Parcela.findOne({ _id: parcela, empresa: idEmpresa });

    if (!semillaExiste || !parcelaExiste) {
      throw new Error('Semilla o Parcela no válida para esta empresa');
    }

    const cultivo = new Cultivo({
      fechaSiembra,
      fechaCosecha,
      cantidadSemilla,
      unidad,
      semilla,
      parcela,
      empresa: idEmpresa,
      estado: true,
    });

    return cultivo.save();
  }

  public async updateCultivo(id: string, data: Partial<ICultivo>, idEmpresa: string): Promise<ICultivo | null> {
    const cultivoActual = await Cultivo.findOne({ _id: id, empresa: idEmpresa });
  
    if (!cultivoActual) {
      throw new Error('Cultivo no encontrado o no pertenece a la empresa');
    }
  
    // Si no se manda semilla o parcela, mantener las actuales
    const updateData = {
      ...data,
      semilla: data.semilla ?? cultivoActual.semilla,
      parcela: data.parcela ?? cultivoActual.parcela,
    };
  
    const actualizado = await Cultivo.findByIdAndUpdate(id, updateData, { new: true });
    return actualizado;
  }

  public async deleteCultivo(id: string, idEmpresa: string): Promise<ICultivo | null> {
    const cultivo = await Cultivo.findOne({ _id: id, empresa: idEmpresa });

    if (!cultivo) {
      throw new Error('Cultivo no encontrado o no pertenece a la empresa');
    }

    cultivo.estado = false;
    return cultivo.save();
  }
}

export const cultivoService = new CultivoService();