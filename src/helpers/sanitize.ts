export function sanitize(obj: any): any {
  if (obj && typeof obj === 'object') {
    for (const key of Object.keys(obj)) {
      if (key.startsWith('$') || key.includes('.')) {
        delete obj[key];
      } else {
        obj[key] = sanitize(obj[key]);
      }
    }
  }
  return obj;
}
