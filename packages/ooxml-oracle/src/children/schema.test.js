import { describe, it, expect } from 'vitest';
import { getSchema, loadSchemaSync } from './index.js';

describe('schema accessors', () => {
  it('getSchema returns the same instance (memoized)', () => {
    const a = getSchema();
    const b = getSchema();
    expect(b).toBe(a); // identity
  });

  it('loadSchemaSync proxies to getSchema', () => {
    const s1 = getSchema();
    const s2 = loadSchemaSync();
    expect(s2).toBe(s1);
  });

  it('schema has expected top-level shape', () => {
    const s = getSchema();
    expect(s).toBeTypeOf('object');
    expect(s).toHaveProperty('namespaces');
    expect(s).toHaveProperty('elements');
  });
});
