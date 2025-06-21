export class InviteCodeNotFoundError extends Error {
    constructor() {
      super('Invite code not found');
      this.name = 'InviteCodeNotFoundError';
    }
  }
  
  export class InviteCodeDisabledError extends Error {
    constructor() {
      super('Invite code is disabled');
      this.name = 'InviteCodeDisabledError';
    }
  }

  export class InviteCodeDuplicateError extends Error {
    constructor() {
      super('Invite code already exists for this company');
      this.name = 'InviteCodeDuplicateError';
    }
  }

  export class InviteCodeExistError extends Error {
    constructor() {
      super('Invite code already exists for this company');
      this.name = 'InviteCodeDuplicateError';
    }
  }

  export class InviteCodeCompanyMismatchError extends Error {
    constructor() {
      super('Invite code already exists for this company');
      this.name = 'InviteCodeDuplicateError';
    }
  }