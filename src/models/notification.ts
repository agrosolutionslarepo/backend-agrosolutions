import mongoose, { Schema, Document, Types } from 'mongoose';

export interface INotification extends Document {
  parcela: Types.ObjectId;
  ruleId: string;
  message: string;
  fecha: Date;
}

const NotificationSchema = new Schema<INotification>({
  parcela: { type: Schema.Types.ObjectId, ref: 'Parcela', required: true },
  ruleId: { type: String, required: true },
  message: { type: String, required: true },
  fecha: { type: Date, default: Date.now },
});

export default mongoose.model<INotification>('Notification', NotificationSchema);
