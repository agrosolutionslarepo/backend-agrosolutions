export class UsuarioExistenteError extends Error {
    constructor(message = "Usuario existente") {
      super(message);
      this.name = "UsuarioExistenteError";
    }
  }

  export class UsuarioGoogleError extends Error {
    constructor(message = "No puede realizar esta acción usted esta federado en google") {
      super(message);
      this.name = "UsuarioGoogleError";
    }
  }