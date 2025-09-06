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

/** @typedef {import('../../v2/importer/types').NodeHandlerParams} SCEncoderConfig */
/** @typedef {import('../../v2/types').SuperDocNode} SCEncoderResult */
/** @typedef {{ node: { attrs?: any }, children?: any[] }} SCDecoderConfig */
/** @typedef {{ name: string, elements: any[] }} SCDecoderResult */

/**
 * @callback NodeTranslatorEncodeFn
 * @param {SCEncoderConfig} params
 * @param {EncodedAttributes} [encodedAttrs]
 * @returns {import('../../v2/types').SuperDocNode}
 */

/**
 * @callback NodeTranslatorDecodeFn
 * @param {SCDecoderConfig} params
 * @param {DecodedAttributes} [decodedAttrs]
 * @returns {import('../../v2/types').OpenXmlNode}
 */

/** @callback MatchesEncodeFn @param {any[]} nodes @param {any} [ctx] @returns {boolean} */
/** @callback MatchesDecodeFn @param {any} node @param {any} [ctx] @returns {boolean} */

/**
 * @typedef {Object} AttributesHandlerList
 * @property {string} xmlName - The name of the attribute in OOXML
 * @property {string} sdName - The name of the attribute in SuperDoc
 * @property {Function} [encode] - Function to encode the attribute from OOXML to SuperDoc
 * @property {Function} [decode] - Function to decode the attribute from SuperDoc to OOXML
 */

/**
 * @typedef {Object} EncodedAttributes
 */

/**
 * @typedef {Object} DecodedAttributes
 */

/**
 * @typedef {Object} NodeTranslatorConfig
 * @property {string} xmlName - The name of the node in OOXML
 * @property {string} sdNodeOrKeyName - The name of the node in SuperDoc
 * @property {TranslatorType} [type="node"] - The type of the translator.
 * @property {NodeTranslatorEncodeFn} encode - The function to encode the data.
 * @property {NodeTranslatorDecodeFn} [decode] - The function to decode the data.
 * @property {number} [priority] - The priority of the handler.
 * @property {AttributesHandlerList[]} [attributes] - Attribute handlers list.
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
  encodeFn;

  /** @type {NodeTranslatorDecodeFn} */
  decodeFn;

  /** @type {MatchesEncodeFn} */
  matchesEncode;

  /** @type {MatchesDecodeFn} */
  matchesDecode;

  /** @type {typeof TranslatorTypes} */
  static translatorTypes = TranslatorTypes;

  /** @type {AttributesHandlerList[]} */
  attributes;

  /**
   * @param {string} xmlName
   * @param {string} sdNodeOrKeyName
   * @param {NodeTranslatorEncodeFn} encode
   * @param {NodeTranslatorDecodeFn} decode
   * @param {number} [priority]
   * @param {MatchesEncodeFn} [matchesEncode]
   * @param {MatchesDecodeFn} [matchesDecode]
   * @param {AttributesHandlerList[]} [attributes]
   */
  constructor(xmlName, sdNodeOrKeyName, encode, decode, priority, matchesEncode, matchesDecode, attributes) {
    this.xmlName = xmlName;
    this.sdNodeOrKeyName = sdNodeOrKeyName;

    this.encodeFn = encode;
    this.decodeFn = decode;
    this.attributes = attributes || [];

    this.matchesEncode = typeof matchesEncode === 'function' ? matchesEncode : () => true;
    this.matchesDecode = typeof matchesDecode === 'function' ? matchesDecode : () => true;
  }

  /**
   * Encode the attributes for the node.
   * @param {SCEncoderConfig} params
   * @returns {Object} Encoded attributes object.
   */
  encodeAttributes(params) {
    const { nodes } = params || {};
    const node = nodes[0];
    const { attributes = {} } = node || {};

    const encodedAttrs = {};
    this.attributes.forEach(({ sdName, encode }) => {
      if (!encode) return;

      const encodedAttr = encode(attributes);
      if (encodedAttr) {
        encodedAttrs[sdName] = encodedAttr;
      }
    });

    return encodedAttrs;
  }

  /**
   * Decode the attributes for the node.
   * @param {SCDecoderConfig} params
   * @returns {Object} Decoded attributes object.
   */
  decodeAttributes(params) {
    const { node } = params || {};
    const { attrs = {} } = node || {};

    const decodedAttrs = {};
    this.attributes.forEach(({ xmlName, decode }) => {
      if (!decode) return;

      const decodedAttr = decode(attrs);
      if (decodedAttr) {
        decodedAttrs[xmlName] = decodedAttr;
      }
    });

    return decodedAttrs;
  }

  /**
   * Decode the attributes for the node.
   * @param {SCDecoderConfig} params
   * @returns {Object} Decoded attributes object.
   */
  decode(params) {
    const decodedAttrs = this.decodeAttributes(params);
    return this.decodeFn ? this.decodeFn(params, decodedAttrs) : undefined;
  }

  /**
   * Encode the attributes for the node.
   * @param {SCEncoderConfig} params
   * @returns {Object} Encoded attributes object.
   */
  encode(params) {
    const encodedAttrs = this.encodeAttributes(params);
    return this.encodeFn ? this.encodeFn(params, encodedAttrs) : undefined;
  }

  /**
   * Create a new NodeTranslator instance from a configuration object.
   * @param {NodeTranslatorConfig} config - The configuration object.
   * @returns {NodeTranslator} The created NodeTranslator instance.
   */
  static from(config) {
    const { xmlName, sdNodeOrKeyName, encode, decode, priority = 0, matchesEncode, matchesDecode, attributes } = config;
    if (typeof encode !== 'function' || (!!decode && typeof decode !== 'function')) {
      throw new TypeError(`${xmlName}: encode/decode must be functions`);
    }
    const inst = new NodeTranslator(
      xmlName,
      sdNodeOrKeyName,
      encode,
      decode,
      priority,
      matchesEncode,
      matchesDecode,
      attributes,
    );
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
