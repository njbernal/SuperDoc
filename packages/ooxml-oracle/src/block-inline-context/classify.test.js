import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getSchema } from '../children/schema.js';
import { classifyBlockOrInline, clearInspectorCache } from './classify.js';

vi.mock('../children/schema.js', () => ({
  getSchema: vi.fn(),
}));

describe('classifyBlockOrInline', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns unknown if schema has no elements', () => {
    getSchema.mockReturnValue({ elements: null });
    expect(classifyBlockOrInline('w:p')).toBe('unknown');
  });

  it('returns unknown if qname is missing', () => {
    getSchema.mockReturnValue({ elements: {} });
    expect(classifyBlockOrInline('')).toBe('unknown');
    expect(classifyBlockOrInline(null)).toBe('unknown');
  });

  it('classifies direct block children (p, tbl)', () => {
    getSchema.mockReturnValue({
      elements: {
        'w:sect': { children: ['w:p'] },
      },
    });
    expect(classifyBlockOrInline('w:sect')).toBe('block');
  });

  it('classifies direct inline children (r, t)', () => {
    getSchema.mockReturnValue({
      elements: {
        'w:run': { children: ['w:r', 'w:t'] },
      },
    });
    expect(classifyBlockOrInline('w:run')).toBe('inline');
  });

  it('returns unknown if no children match signals', () => {
    getSchema.mockReturnValue({
      elements: {
        'w:foo': { children: ['w:bar'] },
        'w:bar': { children: [] },
      },
    });
    expect(classifyBlockOrInline('w:foo')).toBe('unknown');
  });

  it('recurses into children when depth > 0', () => {
    getSchema.mockReturnValue({
      elements: {
        'w:foo': { children: ['w:bar'] },
        'w:bar': { children: ['w:p'] },
      },
    });
    expect(classifyBlockOrInline('w:foo', 2)).toBe('block');
  });

  it('returns inline if nested inline found but no block', () => {
    getSchema.mockReturnValue({
      elements: {
        'w:foo': { children: ['w:bar'] },
        'w:bar': { children: ['w:r'] },
      },
    });
    expect(classifyBlockOrInline('w:foo', 2)).toBe('inline');
  });

  it('respects maxDepth cutoff', () => {
    getSchema.mockReturnValue({
      elements: {
        'w:foo': { children: ['w:bar'] },
        'w:bar': { children: ['w:p'] },
      },
    });
    // With depth 0, it cannot reach w:p
    expect(classifyBlockOrInline('w:foo', 0)).toBe('unknown');
  });

  it('caches results for same schema map and qname', () => {
    const elements = { 'w:p': { children: ['w:r'] } };
    getSchema.mockReturnValue({ elements });
    const first = classifyBlockOrInline('w:p');
    const second = classifyBlockOrInline('w:p');
    expect(first).toBe('inline');
    expect(second).toBe('inline'); // should be cached
  });

  it('clearInspectorCache removes cached results', () => {
    const elements = { 'w:p': { children: ['w:r'] } };
    getSchema.mockReturnValue({ elements });
    expect(classifyBlockOrInline('w:p')).toBe('inline');
    clearInspectorCache(elements);
    // After clearing, still works (recomputes)
    expect(classifyBlockOrInline('w:p')).toBe('inline');
  });
});
