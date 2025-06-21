import mongoose, { Schema, Document } from 'mongoose';

export interface IInviteCodes extends Document {
  codigo: String;
  estado: Boolean;
  empresa: Schema.Types.ObjectId;
}

const InviteCodesSchema = new Schema<IInviteCodes>({
  codigo: {
    type: String,
    required: true,
  },
  estado: {
    type: Boolean,
    required: true,
  },
  empresa: {
    type: Schema.Types.ObjectId,
    ref: 'Empresa',
  },
});

export default mongoose.model<IInviteCodes>('InviteCoedes', InviteCodesSchema);
