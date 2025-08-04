import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ensureValidImageRID } from './index.js';

describe('ensureValidImageRID', () => {
  let mockEditor;
  let mockTransaction;
  let mockLogger;

  beforeEach(() => {
    mockTransaction = {
      setNodeMarkup: vi.fn(),
    };

    mockLogger = {
      debug: vi.fn(),
    };

    mockEditor = {
      converter: {
        docxHelpers: {
          findRelationshipIdFromTarget: vi.fn(),
          getNewRelationshipId: vi.fn(),
        },
      },
    };
  });

  it('does nothing if image has both rId and src', () => {
    const images = [
      {
        node: { attrs: { rId: 'rId1', src: 'image.png' } },
        pos: 10,
      },
    ];

    const result = ensureValidImageRID(images, mockEditor, mockTransaction, mockLogger);

    expect(result.modified).toBe(false);
    expect(result.results).toHaveLength(0);
    expect(mockTransaction.setNodeMarkup).not.toHaveBeenCalled();
  });

  it('adds a new rId when missing and cannot find existing', () => {
    mockEditor.converter.docxHelpers.findRelationshipIdFromTarget.mockReturnValue(null);
    mockEditor.converter.docxHelpers.getNewRelationshipId.mockReturnValue('new-rId');

    const images = [
      {
        node: { attrs: { src: 'image.png' } },
        pos: 5,
      },
    ];

    const result = ensureValidImageRID(images, mockEditor, mockTransaction, mockLogger);

    expect(result.modified).toBe(true);
    expect(result.results).toEqual(['Added missing rId to image at pos 5']);
    expect(mockTransaction.setNodeMarkup).toHaveBeenCalledWith(5, undefined, {
      src: 'image.png',
      rId: 'new-rId',
    });

    expect(mockLogger.debug).toHaveBeenCalledWith('Creating new rId for image at pos:', 5, 'with src:', 'image.png');
  });

  it('reuses existing rId when found via findRelationshipIdFromTarget', () => {
    mockEditor.converter.docxHelpers.findRelationshipIdFromTarget.mockReturnValue('existing-rId');

    const images = [
      {
        node: { attrs: { src: 'img.jpg' } },
        pos: 2,
      },
    ];

    const result = ensureValidImageRID(images, mockEditor, mockTransaction, mockLogger);

    expect(result.modified).toBe(true);
    expect(result.results[0]).toMatch(/Added missing rId/);
    expect(mockTransaction.setNodeMarkup).toHaveBeenCalledWith(2, undefined, {
      src: 'img.jpg',
      rId: 'existing-rId',
    });

    expect(mockLogger.debug).toHaveBeenCalledWith('Reusing existing rId for image:', 'existing-rId', 'at pos:', 2);
  });

  it('skips image nodes with no src', () => {
    const images = [
      {
        node: { attrs: {} },
        pos: 8,
      },
    ];

    const result = ensureValidImageRID(images, mockEditor, mockTransaction, mockLogger);

    expect(result.modified).toBe(false);
    expect(result.results).toEqual([]);
    expect(mockTransaction.setNodeMarkup).not.toHaveBeenCalled();
  });

  it('handles multiple image nodes correctly', () => {
    mockEditor.converter.docxHelpers.findRelationshipIdFromTarget
      .mockReturnValueOnce(null)
      .mockReturnValueOnce('found-rId');

    mockEditor.converter.docxHelpers.getNewRelationshipId.mockReturnValue('new-rId');

    const images = [
      { node: { attrs: { src: 'one.png' } }, pos: 1 },
      { node: { attrs: { src: 'two.png' } }, pos: 2 },
    ];

    const result = ensureValidImageRID(images, mockEditor, mockTransaction, mockLogger);

    expect(result.modified).toBe(true);
    expect(result.results).toHaveLength(2);
    expect(mockTransaction.setNodeMarkup).toHaveBeenCalledTimes(2);
  });
});
