import Notification, { INotification } from '../models/notification';
import Parcela from '../models/parcela';
import Usuario from '../models/usuario';
import { sanitize } from '../helpers/sanitize';

class NotificationService {
  public async getLastForUser(userId: string, limit = 10): Promise<INotification[]> {
    const cleanId = sanitize(userId) as string;
    const usuario = await Usuario.findById(cleanId).select('empresa');
    if (!usuario) {
      throw new Error('Usuario no encontrado');
    }

    const parcelas = await Parcela.find({ empresa: usuario.empresa }).select('_id');
    const parcelaIds = parcelas.map(p => p._id);

    return Notification.find({ parcela: { $in: parcelaIds } })
      .sort({ fecha: -1 })
      .limit(limit)
      .exec();
  }
}

export const notificationService = new NotificationService();
