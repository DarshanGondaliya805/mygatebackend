const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000; // UTC+5:30

export function toIST(date: Date): string {
  const ist = new Date(date.getTime() + IST_OFFSET_MS);
  return ist.toISOString().replace('T', ' ').replace(/\.\d{3}Z$/, '');
}

/**
 * Recursively walks any value and converts every Date instance to an IST
 * string. Sequelize model instances are unwrapped via toJSON() before walking.
 */
export function convertDatesToIST(val: any): any {
  if (val === null || val === undefined) return val;
  if (val instanceof Date) return toIST(val);
  if (Array.isArray(val)) return val.map(convertDatesToIST);
  if (typeof val === 'object') {
    // Unwrap Sequelize model instances to plain objects first
    const plain: Record<string, any> =
      typeof val.toJSON === 'function' ? val.toJSON() : val;
    const out: Record<string, any> = {};
    for (const key of Object.keys(plain)) {
      out[key] = convertDatesToIST(plain[key]);
    }
    return out;
  }
  return val;
}

export function istTimestamp(): string {
  return toIST(new Date());
}
