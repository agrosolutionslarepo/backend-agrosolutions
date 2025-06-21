import mongoose, { Schema, Document } from 'mongoose';
import { IEmpresa } from './empresa';

export interface IParcela extends Document {
  nombreParcela: String;
  tamaño: Number;
  ubicacion: String;
  estado: boolean;
  latitud: Number;
  longitud: Number;
  empresa: IEmpresa['_id'];
}

const ParcelaSchema = new Schema<IParcela>({
  nombreParcela: {
    type: String,
    required: true,
    trim: true,
  },
  tamaño: {
    type: Number,
    required: true,
    min: 0,
  },
  ubicacion: {
    type: String,
    required: true,
    trim: true,
  },
  estado: {
    type: Boolean,
    required: true,
  },
  latitud: {
    type: Number,
    required: false,
  },
  longitud: {
    type: Number,
    required: false,
  },
  empresa: {
    type: Schema.Types.ObjectId,
    ref: 'Empresa',
    required: true,
  },
});

export default mongoose.model<IParcela>('Parcela', ParcelaSchema);