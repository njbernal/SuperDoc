// @ts-check
import { getSchema } from '../children/schema.js';

// WeakMap<elementsMapObject, Map<cacheKey, 'block'|'inline'|'unknown'>>
const _CACHE = new WeakMap();

/**
 * Get the cache for a specific elements map.
 * @param {Object} map - The elements map to get the cache for.
 * @returns {Map<string, 'block'|'inline'|'unknown'>} - The cache for the elements map.
 */
function _getCache(map) {
  let m = _CACHE.get(map);
  if (!m) {
    m = new Map();
    _CACHE.set(map, m);
  }
  return m;
}

/**
 * Get the local part of a QName.
 * @param {string} qname - The qualified name.
 * @returns {string} - The local part of the QName.
 */
function _local(qname) {
  return (qname && qname.split(':').pop()) || qname || '';
}

/**
 * Classify a QName as 'block' | 'inline' | 'unknown' using the inspector map.
 * We detect "terminal signals" in the content model:
 *  - block if it (or bounded descendants) allow 'p' or 'tbl'
 *  - inline if (and only if block not found) it (or bounded descendants) allow 'r' or 't'
 *
 * @param {string} qname - e.g. "w:p", "w:r", "wp:inline"
 * @param {number} [maxDepth=2] - bounded recursion for nested content models
 * @returns {'block'|'inline'|'unknown'}
 */
export function classifyBlockOrInline(qname, maxDepth = 2) {
  const { elements: elementsMap } = getSchema();
  if (!elementsMap || !qname) return 'unknown';

  const cache = _getCache(elementsMap);
  const cacheKey = `${qname}|${maxDepth}`;
  if (cache.has(cacheKey)) return cache.get(cacheKey);

  const entry = elementsMap[qname];
  if (!entry) {
    cache.set(cacheKey, 'unknown');
    return 'unknown';
  }

  const kids = entry.children || [];
  let sawInline = false;

  // Fast path: direct children
  for (let i = 0; i < kids.length; i++) {
    const ln = _local(kids[i]);
    if (ln === 'p' || ln === 'tbl') {
      cache.set(cacheKey, 'block');
      return 'block';
    }
    if (ln === 'r' || ln === 't') {
      sawInline = true;
    }
  }

  // Look deeper (bounded)
  if (maxDepth > 0) {
    for (let i = 0; i < kids.length; i++) {
      const childQName = kids[i];
      if (!elementsMap[childQName]) continue;
      const sub = classifyBlockOrInline(childQName, maxDepth - 1);
      if (sub === 'block') {
        cache.set(cacheKey, 'block');
        return 'block';
      }
      if (sub === 'inline') {
        sawInline = true;
      }
    }
  }

  const res = sawInline ? 'inline' : 'unknown';
  cache.set(cacheKey, res);
  return res;
}

/**
 * Clear cached classifications for a specific schema map (optional).
 * @param {Object} [elementsMap] - The elements map to clear from cache. If omitted, clears all cached data.
 * @returns {void}
 */
export function clearInspectorCache(elementsMap) {
  if (elementsMap && _CACHE.has(elementsMap)) _CACHE.delete(elementsMap);
}
