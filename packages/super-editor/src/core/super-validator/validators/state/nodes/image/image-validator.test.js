import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createImageNodeValidator } from './image-validator.js';
import * as rules from './rules/image-rid.js';

describe('createImageNodeValidator', () => {
  const mockEditor = {};
  const mockLogger = { debug: vi.fn() };
  const mockTransaction = {};

  beforeEach(() => {
    vi.spyOn(rules, 'ensureValidImageRID').mockImplementation(() => ({
      modified: false,
      results: [],
    }));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should define requiredElements with image node', () => {
    const validator = createImageNodeValidator({ editor: mockEditor, logger: mockLogger });
    expect(validator.requiredElements).toEqual({
      nodes: ['image'],
    });
  });

  it('should call ensureValidImageRID with image array', () => {
    const validator = createImageNodeValidator({ editor: mockEditor, logger: mockLogger });

    const analysis = { image: [{ attrs: { rId: 'r1' } }] };
    validator(mockTransaction, analysis);

    expect(rules.ensureValidImageRID).toHaveBeenCalledWith(analysis.image, mockEditor, mockTransaction, mockLogger);
  });

  it('should return modified = false and empty results if rule returns no issues', () => {
    const validator = createImageNodeValidator({ editor: mockEditor, logger: mockLogger });

    const result = validator(mockTransaction, { image: [] });

    expect(result).toEqual({
      modified: false,
      results: [],
    });
  });

  it('should return correct modified and results from rule', () => {
    rules.ensureValidImageRID.mockReturnValueOnce({
      modified: true,
      results: [{ message: 'Missing rId', nodePos: 5 }],
    });

    const validator = createImageNodeValidator({ editor: mockEditor, logger: mockLogger });

    const result = validator(mockTransaction, { image: [{ attrs: {} }] });

    expect(result).toEqual({
      modified: true,
      results: [{ message: 'Missing rId', nodePos: 5 }],
    });
  });

  it('should not fail if analysis.image is undefined', () => {
    const validator = createImageNodeValidator({ editor: mockEditor, logger: mockLogger });

    validator(mockTransaction, {}); // no image key

    expect(rules.ensureValidImageRID).toHaveBeenCalledWith([], mockEditor, mockTransaction, mockLogger);
  });
});
