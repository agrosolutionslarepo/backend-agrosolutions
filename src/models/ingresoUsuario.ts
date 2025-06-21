import mongoose, { Schema, Document } from 'mongoose';

export interface IIngresoUsuario extends Document {
  idUsuario: Number,
  fechaIngreso: Date,
}

const IngresoUsuarioSchema = new Schema({
  idUsuario: Number,
  fechaIngreso: Date,
});

export default mongoose.model<IIngresoUsuario>('IngresoUsuario', IngresoUsuarioSchema);