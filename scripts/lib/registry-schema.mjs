import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';

const ajv = new Ajv2020({ allErrors: true, strict: true });
addFormats(ajv, { mode: 'full' });

const validators = new WeakMap();

export function validateRegistry(data, schema) {
  let validate = validators.get(schema);
  if (!validate) {
    validate = ajv.compile(schema);
    validators.set(schema, validate);
  }
  const valid = validate(data);
  return {
    valid,
    errors: (validate.errors ?? []).map((error) => ({
      instancePath: error.instancePath,
      keyword: error.keyword,
      message: error.message,
      params: { ...error.params },
    })),
  };
}

export function registryErrorMessage(error) {
  const location = error.instancePath || '/';
  const detail = error.keyword === 'required' ? ` (${error.params.missingProperty})` : '';
  return `${location} ${error.message}${detail}`;
}
