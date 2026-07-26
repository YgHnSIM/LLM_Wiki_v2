import path from 'node:path';

export function isRecord(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

export function nonemptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

export function duplicateValues(values = []) {
  const seen = new Set();
  const duplicates = new Set();
  for (const value of values) {
    if (seen.has(value)) duplicates.add(value);
    seen.add(value);
  }
  return [...duplicates];
}

export function normalizeRepoRelativePath(value) {
  if (!nonemptyString(value)) return null;
  const source = value.trim().replaceAll('\\', '/');
  if (
    source.includes('\0')
    || source.startsWith('/')
    || source.startsWith('//')
    || /^[A-Za-z][A-Za-z0-9+.-]*:/.test(source)
  ) {
    return null;
  }
  const segments = source.split('/');
  if (segments.some((segment) => segment === '..')) return null;
  const normalized = path.posix.normalize(source);
  if (normalized === '.' || normalized === '..' || normalized.startsWith('../')) return null;
  return normalized;
}

export function isIsoDate(value) {
  if (typeof value !== 'string') return false;
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (year < 1 || month < 1 || month > 12 || day < 1) return false;
  const leapYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const daysInMonth = [31, leapYear ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return day <= daysInMonth[month - 1];
}
