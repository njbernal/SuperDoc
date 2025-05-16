import { Extensions } from '@harbour-enterprises/superdoc/super-editor';

const { Mark, Attribute } = Extensions;
export const CustomMark = Extensions.Mark.create({
  name: 'customMark',

  addOptions() {
    return {
      'data-id': this.name,
      htmlAttributes: {
        class: 'my-custom-mark-class', // This style is defined in your main app. See style.css
      },
    };
  },

  parseDOM() {
    return false;
  },

  addAttributes() {
    return {
      'data-custom-id': {
        default: null,
        parseHTML: (element) => {
          return element.getAttribute('data-custom-id') || this.options['data-id'];
        },
      }
    }
  },

  renderDOM({ htmlAttributes }) {
    return ['span', Attribute.mergeAttributes(this.options.htmlAttributes, htmlAttributes), 0];
  },

  addCommands() {
    return {
      setMyCustomMark: (id) => ({ commands, tr }) => {
        if (!id) throw new Error('id is required for my custom mark');
        
        // set Mark accepts the attributes that are defined in the addAttributes method
        commands.setMark(this.name, { 'data-custom-id': id });
      }
    };
  },

});
