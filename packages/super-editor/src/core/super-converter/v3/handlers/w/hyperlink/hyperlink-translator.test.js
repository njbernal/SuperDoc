import { describe, it, expect, vi } from 'vitest';
import { config } from './index.js';

describe('w:hyperlink translator config', () => {
  describe('encode', () => {
    it('encodes children with nodeListHandler and returns a SuperDoc hyperlink node', () => {
      const child = { name: 'w:r' };
      const processed = [{ type: 'text', text: 'hello' }];
      const nodeListHandler = { handler: vi.fn().mockReturnValue(processed) };
      const params = { nodes: [{ name: 'w:hyperlink', elements: [child] }], nodeListHandler };
      const res = config.encode(params, undefined);
      expect(nodeListHandler.handler).toHaveBeenCalledTimes(1);
      expect(nodeListHandler.handler).toHaveBeenCalledWith({ ...params, nodes: [child] });
      expect(res).toEqual({ type: 'hyperlink', content: processed });
    });

    it('includes all provided encoded attributes on the SuperDoc node', () => {
      const encodedAttrs = { rId: 'rId5', anchor: 'a1', history: '1' };
      const nodeListHandler = { handler: vi.fn().mockReturnValue([]) };
      const params = { nodes: [{ name: 'w:hyperlink', elements: [] }], nodeListHandler };
      const res = config.encode(params, encodedAttrs);
      expect(res.type).toBe('hyperlink');
      expect(res.attrs).toEqual(encodedAttrs);
      expect(res.content).toEqual([]);
    });
  });

  describe('decode', () => {
    it('decodes to <w:hyperlink> with children and attributes', () => {
      const children = [{ name: 'w:r' }];
      const decodedAttrs = { 'r:id': 'rId5', 'w:anchor': 'a1' };
      const res = config.decode({ node: { type: 'hyperlink', content: children }, children }, decodedAttrs);
      expect(res).toEqual({ name: 'w:hyperlink', attributes: decodedAttrs, elements: children });
    });

    it('returns undefined when params.node is missing', () => {
      const res = config.decode({ children: [] }, { 'r:id': 'rId5' });
      expect(res).toBeUndefined();
    });
  });

  describe('attributes mapping metadata', () => {
    it('exposes expected attribute handlers', () => {
      const attrMap = config.attributes;
      const names = attrMap.map((a) => [a.xmlName, a.sdName]);
      expect(names).toContainEqual(['r:id', 'rId']);
      expect(names).toContainEqual(['w:anchor', 'anchor']);
      expect(names).toContainEqual(['w:history', 'history']);
    });
  });
});
