export const OFFICIAL_SOURCE_COUNT = 110;
export const LOCAL_INVENTORY_SOURCE_COUNT = 109;
export const MISSING_OFFICIAL_SOURCE_PREFIX = '047';
export const FIRST_SHIFTED_LOCAL_PREFIX = '047';

function threeDigitPrefix(value, label) {
  const prefix = String(value ?? '').trim();
  if (!/^\d{3}$/.test(prefix)) {
    throw new Error(`${label} must be a three-digit prefix.`);
  }
  return prefix;
}

function formatPrefix(value) {
  return String(value).padStart(3, '0');
}

/**
 * Convert the physical collection prefix used by /lt and raw artifacts to the
 * official History of Language AI book chapter number.
 *
 * The local inventory omits official chapter 047, whose upstream article is
 * unavailable. Consequently local 047–109 correspond to official 048–110.
 */
export function canonicalSourcePrefix(localPrefix) {
  const prefix = threeDigitPrefix(localPrefix, 'Local inventory prefix');
  const number = Number(prefix);
  if (number < 1 || number > LOCAL_INVENTORY_SOURCE_COUNT) {
    throw new Error(`Local inventory prefix must be between 001 and ${formatPrefix(LOCAL_INVENTORY_SOURCE_COUNT)}.`);
  }
  return formatPrefix(number >= Number(FIRST_SHIFTED_LOCAL_PREFIX) ? number + 1 : number);
}

/**
 * Convert an official chapter number back to the physical local inventory
 * prefix. Official chapter 047 has no local artifact and therefore returns
 * null.
 */
export function localInventoryPrefixForCanonical(canonicalPrefix) {
  const prefix = threeDigitPrefix(canonicalPrefix, 'Official chapter prefix');
  const number = Number(prefix);
  if (number < 1 || number > OFFICIAL_SOURCE_COUNT) {
    throw new Error(`Official chapter prefix must be between 001 and ${formatPrefix(OFFICIAL_SOURCE_COUNT)}.`);
  }
  if (prefix === MISSING_OFFICIAL_SOURCE_PREFIX) return null;
  return formatPrefix(number > Number(MISSING_OFFICIAL_SOURCE_PREFIX) ? number - 1 : number);
}

export function localInventoryPrefixesFromArtifacts(artifacts = []) {
  const prefixes = artifacts.flatMap((artifact) => {
    const match = String(artifact).replaceAll('\\', '/').match(/^raw\/(\d{3})(?:[_-])/i);
    return match ? [match[1]] : [];
  });
  return [...new Set(prefixes)].sort();
}

/**
 * Validate the numbering invariant for a public source page. The raw artifact
 * prefix remains physical provenance; only the page ID and filename use the
 * official book chapter number.
 */
export function sourcePageNumberingErrors({ id, filename, artifacts = [] } = {}) {
  const errors = [];
  const localPrefixes = localInventoryPrefixesFromArtifacts(artifacts);
  if (localPrefixes.length === 0) {
    return ['source page must reference at least one raw artifact with a three-digit local inventory prefix.'];
  }
  if (localPrefixes.length > 1) {
    return [`source page artifacts use multiple local inventory prefixes: ${localPrefixes.join(', ')}.`];
  }

  const localPrefix = localPrefixes[0];
  let canonicalPrefix;
  try {
    canonicalPrefix = canonicalSourcePrefix(localPrefix);
  } catch (error) {
    return [error.message];
  }

  const expectedId = `source.${canonicalPrefix}`;
  if (String(id ?? '') !== expectedId) {
    errors.push(`id '${id ?? ''}' must be '${expectedId}' for local raw prefix ${localPrefix}.`);
  }
  if (!new RegExp(`^${canonicalPrefix}(?:[_-]|$)`).test(String(filename ?? ''))) {
    errors.push(`filename '${filename ?? ''}' must start with official prefix ${canonicalPrefix}_ or ${canonicalPrefix}-.`);
  }
  return errors;
}
