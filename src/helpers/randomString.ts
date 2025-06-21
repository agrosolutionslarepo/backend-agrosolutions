export function randomString(len: number = 8): string {
    const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    return Array.from({ length: len }, () =>
      alphabet.charAt(Math.floor(Math.random() * alphabet.length))
    ).join('');
  }
  