// @ts-check

/**
 * @enum {string}
 */
export const TranslatorTypes = Object.freeze({
  NODE: 'node',
  ATTRIBUTE: 'attribute',
});

/**
 * @typedef {keyof typeof TranslatorTypes} TranslatorTypeKey
 * @typedef {typeof TranslatorTypes[TranslatorTypeKey]} TranslatorType
 * @typedef {string} XmlNodeName
 * @typedef {string} SuperDocNodeOrKeyName
 */

/** @typedef {import('../../importer/types').NodeHandlerParams} SCEncoderConfig */
/** @typedef {import('../../types').SuperDocNode} SCEncoderResult */
/** @typedef {{ node: { attrs?: any }, children?: any[] }} SCDecoderConfig */
/** @typedef {{ name: string, elements: any[] }} SCDecoderResult */

/**
 * @callback NodeTranslatorEncodeFn
 * @param {SCEncoderConfig} params
 * @returns {import('../../types').SuperDocNode}
 */

/**
 * @callback NodeTranslatorDecodeFn
 * @param {SCDecoderConfig} params
 * @returns {import('../../types').OpenXmlNode}
 */

/** @callback MatchesEncodeFn @param {any[]} nodes @param {any} [ctx] @returns {boolean} */
/** @callback MatchesDecodeFn @param {any} node @param {any} [ctx] @returns {boolean} */

/**
 * @typedef {Object} NodeTranslatorConfig
 * @property {string} xmlName - The name of the node in OOXML
 * @property {string} sdNodeOrKeyName - The name of the node in SuperDoc
 * @property {TranslatorType} [type="node"] - The type of the translator.
 * @property {NodeTranslatorEncodeFn} encode - The function to encode the data.
 * @property {NodeTranslatorDecodeFn} [decode] - The function to decode the data.
 * @property {number} [priority] - The priority of the handler.
 * @property {MatchesEncodeFn} [matchesEncode] - The function to check if the handler can encode the data.
 * @property {MatchesDecodeFn} [matchesDecode] - The function to check if the handler can decode the data.
 */

export class NodeTranslator {
  /** @type {string} */
  xmlName;

  /** @type {string} */
  sdNodeOrKeyName;

  /** @type {number} */
  priority;

  /** @type {NodeTranslatorEncodeFn} */
  encode;

  /** @type {NodeTranslatorDecodeFn} */
  decode;

  /** @type {MatchesEncodeFn} */
  matchesEncode;

  /** @type {MatchesDecodeFn} */
  matchesDecode;

  /** @type {typeof TranslatorTypes} */
  static translatorTypes = TranslatorTypes;

  /**
   * @param {string} xmlName
   * @param {string} sdNodeOrKeyName
   * @param {NodeTranslatorEncodeFn} encode
   * @param {NodeTranslatorDecodeFn} decode
   * @param {number} [priority]
   * @param {MatchesEncodeFn} [matchesEncode]
   * @param {MatchesDecodeFn} [matchesDecode]
   */
  constructor(xmlName, sdNodeOrKeyName, encode, decode, priority, matchesEncode, matchesDecode) {
    this.xmlName = xmlName;
    this.sdNodeOrKeyName = sdNodeOrKeyName;

    this.encode = encode;
    this.decode = decode;

    this.matchesEncode = typeof matchesEncode === 'function' ? matchesEncode : () => true;
    this.matchesDecode = typeof matchesDecode === 'function' ? matchesDecode : () => true;
    // this.priority = priority;
  }

  /**
   * Create a new NodeTranslator instance from a configuration object.
   * @param {NodeTranslatorConfig} config - The configuration object.
   * @returns {NodeTranslator} The created NodeTranslator instance.
   */
  static from(config) {
    const { xmlName, sdNodeOrKeyName, encode, decode, priority = 0, matchesEncode, matchesDecode } = config;
    if (typeof encode !== 'function' || (!!decode && typeof decode !== 'function')) {
      throw new TypeError(`${xmlName}: encode/decode must be functions`);
    }
    const inst = new NodeTranslator(xmlName, sdNodeOrKeyName, encode, decode, priority, matchesEncode, matchesDecode);
    return Object.freeze(inst);
  }

  /**
   * Convert the NodeTranslator instance to a string representation.
   * @returns {string} - The string representation of the NodeTranslator instance.
   */
  toString() {
    return `NodeTranslator(${this.xmlName}, priority=${this.priority})`;
  }
}
