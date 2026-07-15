import assert from 'node:assert/strict';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { createFrontmatterValidator } from '../lib/frontmatter-schema.mjs';
import { metaDir } from '../lib/project-paths.mjs';

const schema = JSON.parse(await fs.readFile(path.join(metaDir, 'page.schema.json'), 'utf8'));
const validate = createFrontmatterValidator(schema);
const validMetaPage = {
  schema_version: 2,
  id: 'meta.test',
  page_type: 'meta',
  title: 'Test',
  aliases: [],
  tags: ['type/meta'],
  created: '2026-07-15',
  updated: '2026-07-15',
  lifecycle: 'active',
  verification: 'verified',
  artifacts: [],
  evidence: [],
  related: [],
};

test('the frontmatter schema accepts a complete meta page', () => {
  assert.deepEqual(validate(validMetaPage), { valid: true, errors: [] });
  assert.equal(validate({ ...validMetaPage, created: new Date('2026-07-15T00:00:00Z') }).valid, true);
});

test('the frontmatter schema rejects structural drift', () => {
  const result = validate({
    ...validMetaPage,
    aliases: 'not-an-array',
    tags: ['type/meta', 'type/meta'],
    created: '2026-13-40',
    unexpected: true,
  });
  const keywords = new Set(result.errors.map((error) => error.keyword));

  assert.equal(result.valid, false);
  assert.equal(keywords.has('type'), true);
  assert.equal(keywords.has('uniqueItems'), true);
  assert.equal(keywords.has('format'), true);
  assert.equal(keywords.has('additionalProperties'), true);
});

test('the frontmatter schema requires evidence for non-meta pages', () => {
  const result = validate({
    ...validMetaPage,
    id: 'concept.test',
    page_type: 'concept',
    tags: ['type/concept'],
  });

  assert.equal(result.valid, false);
  assert.equal(result.errors.some((error) => error.keyword === 'minItems' && error.instancePath === '/evidence'), true);
});
