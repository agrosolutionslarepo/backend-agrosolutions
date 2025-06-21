import mongoose, { Schema, Document } from 'mongoose';
import { IEmpresa } from './empresa';

export interface ISemilla extends Document {
  nombreSemilla: String;
  tipoSemilla: 'maíz' | 'trigo' | 'soja';
  cantidadSemilla: number;
  unidad: 'kg' | 'ton';
  empresa: IEmpresa['_id'];
}

const SemillaSchema = new Schema<ISemilla>({
  nombreSemilla: {
    type: String,
    required: true,
    trim: true,
  },
  tipoSemilla: {
    type: String,
    required: true,
    enum: ['maíz', 'trigo', 'soja'],
  },
  cantidadSemilla: {
    type: Number,
    required: true,
    min: 0,
  },
  unidad: {
    type: String,
    enum: ['kg', 'ton'],
    required: true,
  },
  empresa: {
    type: Schema.Types.ObjectId,
    ref: 'Empresa',
    required: true,
  },
});

export default mongoose.model<ISemilla>('Semilla', SemillaSchema);