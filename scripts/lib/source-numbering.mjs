export const OFFICIAL_SOURCE_COUNT = 110;
export const MISSING_OFFICIAL_SOURCE_PREFIX = '047';

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
 * Validate a History of Language AI official chapter number.
 *
 * Every selector, source filename, translated artifact, public source ID,
 * and commit number uses this same official prefix. Chapter 047 is reserved in
 * the official table of contents, but its upstream original is unavailable.
 */
export function officialSourcePrefix(value) {
  const prefix = threeDigitPrefix(value, 'Official source prefix');
  const number = Number(prefix);
  if (number < 1 || number > OFFICIAL_SOURCE_COUNT) {
    throw new Error(`Official source prefix must be between 001 and ${formatPrefix(OFFICIAL_SOURCE_COUNT)}.`);
  }
  if (prefix === MISSING_OFFICIAL_SOURCE_PREFIX) {
    throw new Error(`Official source ${MISSING_OFFICIAL_SOURCE_PREFIX} is unavailable because its upstream original is missing.`);
  }
  return prefix;
}

export function sourcePrefixesFromArtifacts(artifacts = []) {
  const prefixes = artifacts.flatMap((artifact) => {
    const match = String(artifact).replaceAll('\\', '/').match(/^raw\/(\d{3})(?:[_-])/i);
    return match ? [match[1]] : [];
  });
  return [...new Set(prefixes)].sort();
}

/** Validate that a raw registry record uses one official prefix consistently. */
export function rawArtifactRecordNumberingErrors({ path: artifactPath, order_prefix: orderPrefix } = {}) {
  const normalizedPath = String(artifactPath ?? '').replaceAll('\\', '/');
  const pathPrefix = normalizedPath.match(/^raw\/(\d{3})(?:[_-])/i)?.[1] ?? '';
  if (!pathPrefix) {
    return [`raw artifact path '${artifactPath ?? ''}' must start with a three-digit official source prefix.`];
  }

  try {
    officialSourcePrefix(pathPrefix);
  } catch (error) {
    return [error.message];
  }

  const declaredPrefix = String(orderPrefix ?? '').trim();
  if (declaredPrefix !== pathPrefix) {
    return [`order_prefix '${declaredPrefix}' must match raw path prefix ${pathPrefix}.`];
  }
  return [];
}

/** Validate the single-number invariant for a public source page. */
export function sourcePageNumberingErrors({ id, filename, artifacts = [] } = {}) {
  const errors = [];
  const artifactPrefixes = sourcePrefixesFromArtifacts(artifacts);
  if (artifactPrefixes.length === 0) {
    return ['source page must reference at least one raw artifact with a three-digit official source prefix.'];
  }
  if (artifactPrefixes.length > 1) {
    return [`source page artifacts use multiple official source prefixes: ${artifactPrefixes.join(', ')}.`];
  }

  const prefix = artifactPrefixes[0];
  try {
    officialSourcePrefix(prefix);
  } catch (error) {
    return [error.message];
  }

  const expectedId = `source.${prefix}`;
  if (String(id ?? '') !== expectedId) {
    errors.push(`id '${id ?? ''}' must be '${expectedId}' for raw prefix ${prefix}.`);
  }
  if (!new RegExp(`^${prefix}(?:[_-]|$)`).test(String(filename ?? ''))) {
    errors.push(`filename '${filename ?? ''}' must start with official prefix ${prefix}_ or ${prefix}-.`);
  }
  return errors;
}
