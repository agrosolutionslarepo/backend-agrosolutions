import { Types } from 'mongoose';
import InviteCodes, { IInviteCodes } from '../models/inviteCodes';
import Usuario from '../models/usuario';
import {
  InviteCodeDisabledError,
  InviteCodeDuplicateError,
  InviteCodeNotFoundError,
  InviteCodeExistError,
} from '../errors/inviteCodesError';

/**
 * Crea un código de invitación.
 * Reglas de negocio:
 *   • Un código puede repetirse entre empresas.
 *   • Dentro de **la misma empresa** el par (codigo, empresa) debe ser único
 *     sin importar si el registro previo está habilitado o no.
 */
class InviteCodeService {

  public async createInviteCode(
    empresaId: string | Types.ObjectId,
    code: string
  ): Promise<IInviteCodes> {
    const empresa = new Types.ObjectId(empresaId);
    const codigo = code.trim().toUpperCase();

    // 1️⃣ La empresa ya tiene *algún* código activo → prohibido
    const anyActiveSameCompany = await InviteCodes.exists({ empresa, estado: true });
    if (anyActiveSameCompany) throw new InviteCodeExistError();

    // 2️⃣ La empresa tiene el MISMO código deshabilitado → prohibido (no reusar)
    const sameCompanyDisabled = await InviteCodes.exists({ codigo, empresa, estado: false });
    if (sameCompanyDisabled) throw new InviteCodeDuplicateError();

    // 3️⃣ Otra empresa posee el MISMO código activo → prohibido
    const otherActive = await InviteCodes.exists({ codigo, empresa: { $ne: empresa }, estado: true });
    if (otherActive) throw new InviteCodeDuplicateError();

    // ✅ Se permite crear (o sólo hay registros deshabilitados en otras empresas)
    return InviteCodes.create({ codigo, estado: true, empresa });
  }

  /**
   * Deshabilita un código (no importa a qué empresa pertenece).
   */
  public async disableInviteCode(
    empresaId: string | Types.ObjectId,
    code: string
  ): Promise<IInviteCodes> {
    const empresa = new Types.ObjectId(empresaId);
    const codigo = code.trim().toUpperCase();

    try {
      // 1️⃣ Busca y actualiza sólo si coincide empresa + código
      const doc = await InviteCodes.findOneAndUpdate(
        { codigo, empresa },          // filtro estricto
        { estado: false },            // set
        { new: true, runValidators: true }
      );

      if (doc) return doc;
      // 3️⃣ El código directamente no existe
      throw new InviteCodeNotFoundError();
    } catch (err) {
      // Propaga al controlador/middleware para manejo centralizado
      throw err;
    }
  }

  public async getEmpresaIdByInviteCode(code: string): Promise<string> {
    const codigo = code.trim().toUpperCase();

    try {
      // 1️⃣ Busca un registro activo (estado: true)
      const activeDoc = await InviteCodes.findOne({ codigo, estado: true });
      if (activeDoc) return activeDoc.empresa.toString();

      // 3️⃣ No existe en absoluto
      throw new InviteCodeNotFoundError();
    } catch (err) {
      throw err;
    }
  }


  public async checkInviteCode(
    code: string
  ): Promise<IInviteCodes> {
    const codigo = code.trim().toUpperCase();

    try {
      // 1️⃣ Busca un registro activo (estado: true)
      const doc = await InviteCodes.findOne({ codigo, estado: true });
      if (doc) return doc;                // ✔ válido y activo

      // 2️⃣ Existe pero está deshabilitado
      const exists = await InviteCodes.exists({ codigo });
      if (exists) throw new InviteCodeDisabledError();

      // 3️⃣ No existe en absoluto
      throw new InviteCodeNotFoundError();
    } catch (err) {
      throw err;                          // Propaga al controlador/errorHandler
    }
  }

  public async getActiveInviteCodeByEmpresaId(empresaId: string | Types.ObjectId): Promise<IInviteCodes> {
    const empresa = new Types.ObjectId(empresaId);

    const doc = await InviteCodes.findOne({ empresa, estado: true });

    if (!doc) {
      throw new Error('No hay código de invitación activo para esta empresa');
    }

    return doc;
  }

  public async attachUserToCompany(
    userId: string | Types.ObjectId,
    empresaId: string | Types.ObjectId
  ): Promise<void> {
    const userObjectId = new Types.ObjectId(userId);
    const empresaObjectId = new Types.ObjectId(empresaId);

    const updatedUser = await Usuario.findByIdAndUpdate(
      userObjectId,
      { empresa: empresaObjectId },
      { new: true }
    );

    if (!updatedUser) {
      throw new Error('Usuario no encontrado al intentar vincular empresa');
    }
  }

}

export const inviteCodeService = new InviteCodeService();
