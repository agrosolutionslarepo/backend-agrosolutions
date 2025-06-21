import mongoose, { Schema, Document } from 'mongoose';

export interface IUsuario extends Document {
  nombreUsuario: String;
  nombre: String;
  apellido: String;
  fechaNacimiento?: Date;
  contraseña?: String;
  email: String;
  estado: Boolean;
  administrador: Boolean;
  empresa: Schema.Types.ObjectId;
  googleId?: String; // <- agregalo si usás login con Google
  authType?: string; // <- opcional para distinguir tipo de autenticación
  expoToken?: String;
  codigoReset?: String;
  resetExpira?: Date;
}

const UsuarioSchema = new Schema<IUsuario>({
  nombreUsuario: {
    type: String,
    required: true,
  },
  nombre: {
    type: String,
    required: true,
  },
  apellido: {
    type: String,
    required: true,
  },
  fechaNacimiento: {
    type: Date,
    required: function (this: any) {
      return this.authType !== 'google';
    },
  },
  contraseña: {
    type: String,
    required: function (this: any) {
      return this.authType !== 'google';
    },
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  estado: {
    type: Boolean,
    required: true,
  },
  administrador: {
    type: Boolean,
    required: true,
  },
  empresa: {
    type: Schema.Types.ObjectId,
    ref: 'Empresa',
  },
  expoToken: {
    type: String,
  },
  codigoReset: {
    type: String,
  },
  resetExpira: {
    type: Date,
  },
  googleId: {
    type: String,
  },
  authType: {
    type: String,
    default: 'local', // 'google' si viene por OAuth
  },
});

export default mongoose.model<IUsuario>('Usuario', UsuarioSchema);
