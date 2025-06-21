export class EmpresaExistenteError extends Error {
  constructor(message = 'El nombre de la empresa ya existe') {
    super(message);
    this.name = 'EmpresaExistenteError';
  }
}
