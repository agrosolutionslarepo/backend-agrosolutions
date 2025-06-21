export class EnvVarMissingError extends Error {
    constructor(varName: string) {
      super(`${varName} env var is missing`);
      this.name = 'EnvVarMissingError';
    }
  }