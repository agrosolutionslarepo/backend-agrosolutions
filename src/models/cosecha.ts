import mongoose, { Schema, Document } from 'mongoose';
import { IEmpresa } from './empresa';
import { ICultivo } from './cultivo';

export interface ICosecha extends Document {
  fechaCosecha: Date;
  cantidadCosechada: number;
  unidad: 'kg' | 'ton';
  observaciones?: string;
  cultivo: ICultivo['_id'];
  empresa: IEmpresa['_id'];
  estado: boolean;
}

const CosechaSchema = new Schema<ICosecha>({
  fechaCosecha: {
    type: Date,
    required: true,
  },
  cantidadCosechada: {
    type: Number,
    required: true,
    min: 0,
  },
  unidad: {
    type: String,
    enum: ['kg', 'ton'],
    required: true,
  },
  observaciones: {
    type: String,
    required: false,
  },
  cultivo: {
    type: Schema.Types.ObjectId,
    ref: 'Cultivo',
    required: true,
  },
  empresa: {
    type: Schema.Types.ObjectId,
    ref: 'Empresa',
    required: true,
  },
  estado: {
    type: Boolean,
    required: true,
    default: true,
  },
});

export default mongoose.model<ICosecha>('Cosecha', CosechaSchema);