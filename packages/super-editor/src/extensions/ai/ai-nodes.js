import { Attribute, Node } from '@core/index.js';
import { AiLoaderNodeName } from './ai-constants.js';

export const AiLoaderNode = Node.create({
  name: AiLoaderNodeName,
  
  group: 'inline',
  
  inline: true,
  
  atom: true,
  
  selectable: false,
  
  draggable: false,

  addOptions() {
    return {
      htmlAttributes: {
        class: 'sd-ai-loader',
        contentEditable: 'false',
      }
    };
  },

  parseDOM() {
    return [{ tag: 'span.sd-ai-loader' }];
  },

  renderDOM({ htmlAttributes }) {
    return ['span', Attribute.mergeAttributes(this.options.htmlAttributes, htmlAttributes), 
      ['div', {}, ''],
      ['div', {}, ''],
      ['div', {}, '']
    ];
  }
});