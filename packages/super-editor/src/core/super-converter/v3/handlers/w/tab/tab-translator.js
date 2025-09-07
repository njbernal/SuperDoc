// @ts-check
import { NodeTranslator } from '../../../node-translator/index.js';

/** @type {import('../../../node-translator/index.js').XmlNodeName} */
const XML_NODE_NAME = 'w:tab';

/** @type {import('../../../node-translator/index.js').SuperDocNodeOrKeyName} */
const SD_NODE_NAME = 'tab';

/**
 * Encode a <w:tab> element into a SuperDoc tab node.
 * @param {import('../../../node-translator/index.js').SCEncoderConfig} _
 * @param {import('../../../node-translator/index.js').EncodedAttributes} [encodedAttrs]
 * @returns {import('../../../node-translator/index.js').SCEncoderResult}
 */
const encode = (_, encodedAttrs) => {
  const translated = { type: 'tab' };
  if (encodedAttrs && Object.keys(encodedAttrs).length) {
    translated.attrs = { ...encodedAttrs };
  }
  return translated;
};

/**
 * Decode a SuperDoc tab node back into OOXML <w:tab>.
 * @param {import('../../../node-translator/index.js').SCDecoderConfig} params
 * @param {import('../../../node-translator/index.js').DecodedAttributes} [decodedAttrs]
 * @returns {import('../../../node-translator/index.js').SCDecoderResult}
 */
const decode = (params, decodedAttrs) => {
  const { node } = params;
  if (!node) return;

  const wTab = { name: 'w:tab' };
  if (decodedAttrs && Object.keys(decodedAttrs).length) {
    wTab.attributes = { ...decodedAttrs };
  }

  return {
    name: 'w:r',
    elements: [wTab],
  };
};

/** @type {import('../../../node-translator/index.js').NodeTranslatorConfig} */
export const config = {
  xmlName: XML_NODE_NAME,
  sdNodeOrKeyName: SD_NODE_NAME,
  type: NodeTranslator.translatorTypes.NODE,
  encode,
  decode,
  attributes: [],
};

/**
 * The NodeTranslator instance for the w:tab element.
 * @type {import('../../../node-translator/index.js').NodeTranslator}
 */
export const translator = NodeTranslator.from(config);
