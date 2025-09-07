import { describe, it, expect } from 'vitest';
import { config } from './index.js';

describe('w:tab translator config', () => {
  describe('encode', () => {
    it('encodes to a SuperDoc tab node by default', () => {
      const res = config.encode({}, undefined);
      expect(res).toEqual({ type: 'tab' });
    });

    it('includes all provided encoded attributes on the SuperDoc node', () => {
      const encodedAttrs = { custom: 'x' };
      const res = config.encode({}, encodedAttrs);
      expect(res.type).toBe('tab');
      expect(res.attrs).toEqual(encodedAttrs);
    });
  });

  describe('decode', () => {
    it('wraps <w:tab> in a <w:r> run (Google Docs compatibility)', () => {
      const res = config.decode({ node: { type: 'tab' } }, undefined);
      expect(res).toBeTruthy();
      expect(res.name).toBe('w:r');
      expect(Array.isArray(res.elements)).toBe(true);
      expect(res.elements[0]).toEqual({ name: 'w:tab' });
    });

    it('copies decoded attributes onto <w:tab>', () => {
      const decodedAttrs = { 'w:custom': 'foo' };
      const res = config.decode({ node: { type: 'tab' } }, decodedAttrs);
      expect(res.name).toBe('w:r');
      expect(res.elements[0]).toEqual({
        name: 'w:tab',
        attributes: { 'w:custom': 'foo' },
      });
    });

    it('returns undefined when params.node is missing', () => {
      const res = config.decode({}, { 'w:foo': 'bar' });
      expect(res).toBeUndefined();
    });

    it('does not require specific SuperDoc node type for decoding (guard only)', () => {
      const res = config.decode({ node: { type: 'text' } }, { 'w:foo': 'bar' });
      expect(res.name).toBe('w:r');
      expect(res.elements[0]).toEqual({
        name: 'w:tab',
        attributes: { 'w:foo': 'bar' },
      });
    });
  });

  describe('attributes mapping metadata', () => {
    it('exposes no attribute handlers', () => {
      expect(Array.isArray(config.attributes)).toBe(true);
      expect(config.attributes.length).toBe(0);
    });
  });
});
