import { Types } from 'mongoose';
import Cultivo from '../models/cultivo';
//import Parcela from '../models/parcela';
import Usuario from '../models/usuario';
import Notification from '../models/notification';

export interface Lot {
  _id: Types.ObjectId; // id del cultivo
  parcelaId: Types.ObjectId;
  nombre: string;
  cultivo: 'maiz' | 'soja' | 'trigo';
  lat: number;
  lon: number;
  fechaSiembra: Date;
  gddAcum: number;
  gddDate?: Date;
  userId: Types.ObjectId;
  lastNotifs: string[];
}

export async function updateLotGdd(lotId: Types.ObjectId, gdd: number, gddDate: Date): Promise<void> {
  await Cultivo.findByIdAndUpdate(lotId, { gdd, gddDate });
}

export async function getActiveLots(): Promise<Lot[]> {
  const cultivos = await Cultivo.find({ estado: true })
    .populate('semilla')
    .populate('parcela')
    .exec();

  const lots: Lot[] = [];

  for (const c of cultivos) {
    const parcela = c.parcela as any;
    const semilla = c.semilla as any;
    const admin = await Usuario.findOne({ empresa: c.empresa, administrador: true });

    if (!parcela || !semilla || !admin) continue;

    const tipo = (semilla.tipoSemilla as string).replace('í', 'i') as 'maiz' | 'soja' | 'trigo';

    lots.push({
      _id: c._id,
      parcelaId: parcela._id,
      nombre: parcela.nombreParcela,
      cultivo: tipo,
      lat: parcela.latitud,
      lon: parcela.longitud,
      fechaSiembra: c.fechaSiembra,
      gddAcum: c.gdd || 0,
      gddDate: c.gddDate,
      userId: admin._id,
      lastNotifs: [],
    });
  }

  return lots;
}

export async function saveNotification(parcelaId: Types.ObjectId, ruleId: string, message: string) {
  await Notification.create({ parcela: parcelaId, ruleId, message });
}