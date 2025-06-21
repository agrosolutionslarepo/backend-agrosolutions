export class LatLongRequiredError extends Error {
    constructor() {
      super('lat & lon required');
      this.name = 'LatLongRequiredError';
    }
  }