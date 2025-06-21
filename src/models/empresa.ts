import mongoose, { Schema, Document } from 'mongoose';

export interface IEmpresa extends Document {
  nombreEmpresa: String,
  estado: Boolean,
  fechaCreacion: Date
}

const EmpresaSchema = new Schema({
  nombreEmpresa: {
    type: String,
    required: true,
    unique: true
  },
  estado:{
    type: Boolean,
    required: true,
  },
  fechaCreacion: {
    type: Date,
    required: true
  }
});

export default mongoose.model<IEmpresa>('Empresa', EmpresaSchema);
