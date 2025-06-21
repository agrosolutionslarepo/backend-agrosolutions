import Parcela, { IParcela } from '../models/parcela';
import { sanitize } from '../helpers/sanitize';

class ParcelaService {

  public async getAllParcelas(idEmpresa: string): Promise<IParcela[]> {
    const cleanEmpresa = sanitize(idEmpresa) as string;
    return Parcela.find({ empresa: cleanEmpresa, estado: true });
  }

  public async getParcelaById(id: string, idEmpresa: string): Promise<IParcela | null> {
    const cleanId = sanitize(id) as string;
    const cleanEmpresa = sanitize(idEmpresa) as string;
    return Parcela.findOne({ _id: cleanId, empresa: cleanEmpresa });
  }

  public async createParcela(data: Partial<IParcela>, idEmpresa: string): Promise<IParcela> {
    const clean = sanitize({ ...data }) as Partial<IParcela>;
    const cleanEmpresa = sanitize(idEmpresa) as string;
    const nuevaParcela = new Parcela({
      ...clean,
      estado: true,
      empresa: cleanEmpresa,
    });
  
    return nuevaParcela.save();
  }

  public async updateParcela(id: string, data: Partial<IParcela>, idEmpresa: string): Promise<IParcela | null> {
    const clean = sanitize({ ...data }) as Partial<IParcela>;
    const cleanId = sanitize(id) as string;
    const cleanEmpresa = sanitize(idEmpresa) as string;
    const actualizada = await Parcela.findOneAndUpdate(
      { _id: cleanId, empresa: cleanEmpresa },
      clean,
      { new: true }
    );

    if (!actualizada) {
      throw new Error('Parcela no encontrada o no pertenece a la empresa');
    }

    return actualizada;
  }

  public async deleteParcela(id: string, idEmpresa: string): Promise<IParcela | null> {
    const cleanId = sanitize(id) as string;
    const cleanEmpresa = sanitize(idEmpresa) as string;
    const parcela = await Parcela.findOne({ _id: cleanId, empresa: cleanEmpresa });

    if (!parcela) {
      throw new Error('Parcela no encontrada o no pertenece a la empresa');
    }

    parcela.estado = false;
    return parcela.save();
    }
  }

export const parcelaService = new ParcelaService();
