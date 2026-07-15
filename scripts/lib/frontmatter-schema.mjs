import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import { formatDate } from './wiki-utils.mjs';

function normalizeFrontmatter(data) {
  const normalized = { ...data };
  for (const field of ['created', 'updated']) {
    if (field in normalized && normalized[field] instanceof Date) normalized[field] = formatDate(normalized[field]);
  }
  return normalized;
}

export function createFrontmatterValidator(schema) {
  const ajv = new Ajv2020({ allErrors: true, strict: true });
  addFormats(ajv, { mode: 'full' });
  const validate = ajv.compile(schema);

  return (data) => {
    const valid = validate(normalizeFrontmatter(data));
    const errors = (validate.errors ?? []).map((error) => ({
      ...error,
      params: { ...error.params },
    }));
    return { valid, errors };
  };
}

export function schemaErrorMessage(error) {
  const location = error.instancePath || '/';
  const detail = error.keyword === 'required' ? ` (${error.params.missingProperty})` : '';
  return `${location} ${error.message}${detail}`;
}
