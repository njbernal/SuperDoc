// @ts-check
import { NodeTranslator } from '../../../node-translator/index.js';

/** @type {import('../../../node-translator/index.js').XmlNodeName} */
const XML_NODE_NAME = 'w:hyperlink';

/** @type {import('../../../node-translator/index.js').SuperDocNodeOrKeyName} */
const SD_NODE_NAME = 'hyperlink';

/**
 * The attributes that can be mapped between OOXML and SuperDoc.
 * @type {import('../../../node-translator/index.js').AttributesHandlerList[]}
 */
const attributes = [
  { xmlName: 'r:id', sdName: 'rId', encode: (attrs) => attrs['r:id'], decode: (attrs) => attrs.rId },
  { xmlName: 'w:anchor', sdName: 'anchor', encode: (attrs) => attrs['w:anchor'], decode: (attrs) => attrs.anchor },
  { xmlName: 'w:history', sdName: 'history', encode: (attrs) => attrs['w:history'], decode: (attrs) => attrs.history },
];

/**
 * Encode a <w:hyperlink> element into a SuperDoc hyperlink node.
 * @param {import('../../../node-translator/index.js').SCEncoderConfig} params
 * @param {import('../../../node-translator/index.js').EncodedAttributes} [encodedAttrs]
 * @returns {import('../../../node-translator/index.js').SCEncoderResult}
 */
const encode = (params, encodedAttrs) => {
  const { nodes, nodeListHandler } = params;
  const node = nodes[0];
  const children = node?.elements || [];
  const content = nodeListHandler ? nodeListHandler.handler({ ...params, nodes: children }) : [];

  const translated = { type: 'hyperlink', content };
  if (encodedAttrs && Object.keys(encodedAttrs).length) {
    translated.attrs = { ...encodedAttrs };
  }
  return translated;
};

/**
 * Decode a SuperDoc hyperlink node back into OOXML <w:hyperlink>.
 * @param {import('../../../node-translator/index.js').SCDecoderConfig} params
 * @param {import('../../../node-translator/index.js').DecodedAttributes} [decodedAttrs]
 * @returns {import('../../../node-translator/index.js').SCDecoderResult}
 */
const decode = (params, decodedAttrs) => {
  const { node, children } = params;
  if (!node) return;

  const wHyperlink = { name: 'w:hyperlink' };
  if (decodedAttrs && Object.keys(decodedAttrs).length) {
    wHyperlink.attributes = { ...decodedAttrs };
  }
  if (children && Array.isArray(children) && children.length) {
    wHyperlink.elements = children;
  }
  return wHyperlink;
};

/** @type {import('../../../node-translator/index.js').NodeTranslatorConfig} */
export const config = {
  xmlName: XML_NODE_NAME,
  sdNodeOrKeyName: SD_NODE_NAME,
  type: NodeTranslator.translatorTypes.NODE,
  encode,
  decode,
  attributes,
};

/**
 * The NodeTranslator instance for the w:hyperlink element.
 * @type {import('../../../node-translator/index.js').NodeTranslator}
 */
export const translator = NodeTranslator.from(config);
