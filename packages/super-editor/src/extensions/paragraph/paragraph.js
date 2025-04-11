import { Node, Attribute } from '@core/index.js';
import { getSpacingStyleString } from '@extensions/linked-styles/index.js';

export const Paragraph = Node.create({
  name: 'paragraph',

  priority: 1000,

  group: 'block',

  content: 'inline*',

  inline: false,

  addOptions() {
    return {
      htmlAttributes: {},
    };
  },

  addAttributes() {
    return {
      spacing: {
        renderDOM: (attrs) => {
          const { spacing } = attrs;
          if (!spacing) return {};

          const style = getSpacingStyleString(spacing);
          if (style) return { style };
          return {};
        },
      },
      extraAttrs: {
        default: {},
        parseHTML: (element) => {
          const knownAttributes = ['spacing', 'indent', 'class'];
          const extra = {};
          console.debug('--ELEMENT--', element);
          Array.from(element.attributes).forEach((attr) => {
            if (!knownAttributes.includes(attr.name)) {
              extra[attr.name] = attr.value;
            }
          });
          return extra;
        },
        renderDOM: (attributes) => {
          return attributes.extraAttrs || {};
        },
      },
      indent: {
        renderDOM: ({ indent }) => {
          if (!indent) return {};
          const { left, right, firstLine } = indent;

          let style = '';
          if (left) style += `margin-left: ${left}px;`;
          if (right) style += `margin-right: ${right}px;`;
          if (firstLine) style += `text-indent: ${firstLine}px;`;

          return { style };
        },
      },
      styleId: { rendered: false },
      attributes: {
        rendered: false,
      },
      filename: { rendered: false },
      rsidRDefault: { rendered: false },
    };
  },

  parseDOM() {
    return [{
      tag: 'p',
      getAttrs: (node) => {
        const knownAttributes = ['spacing', 'indent', 'class'];
        let extra = {};
        Array.from(node.attributes).forEach((attr) => {
          if (!knownAttributes.includes(attr.name)) {
            extra[attr.name] = attr.value;
          }
        });
        return { extraAttrs: extra };
      },
    }];
  },

  renderDOM({ htmlAttributes }) {
    return ['p', Attribute.mergeAttributes(this.options.htmlAttributes, htmlAttributes), 0];
  },
});
