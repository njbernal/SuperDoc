import { Node, Attribute } from '@core/index.js';
import { InputRule } from '@core/InputRule.js'
import { ListHelpers } from '@helpers/list-numbering-helpers.js';
import { toggleList } from '@core/commands/index.js';

/**
 * Matches a bullet list to a dash or asterisk.
 */
const inputRegex = /^\s*([-+*])\s$/;

export const BulletList = Node.create({
  name: 'bulletList',

  group: 'block list',

  selectable: false,

  content() {
    return `${this.options.itemTypeName}+`;
  },

  addOptions() {
    return {
      itemTypeName: 'listItem',
      htmlAttributes: {
        'aria-label': 'Bullet list node'
      },
      keepMarks: true,
      keepAttributes: false,
    };
  },

  parseDOM() {
    return [{ tag: 'ul' }];
  },

  renderDOM({ htmlAttributes }) {
    const attributes = Attribute.mergeAttributes(this.options.htmlAttributes, htmlAttributes);
    return ['ul', attributes, 0];
  },

  addAttributes() {
    return {
      'list-style-type': {
        default: 'bullet',
        rendered: false,
      },

      listId: {
        rendered: false,
      },

      attributes: {
        rendered: false,
        keepOnSplit: true,
      },
    };
  },

  addCommands() {
    return {
      toggleBulletList: () => (params) => {
        return toggleList(this.type)(params)
      },
    };
  },

  addShortcuts() {
    return {
      'Mod-Shift-8': () => {
        return this.editor.commands.toggleBulletList();
      },
    };
  },

  addInputRules() {
    return [
      new InputRule({
        match: inputRegex,
        handler: ({ state, range }) => {
          const { tr } = state
          tr.delete(range.from, range.to)
  
          ListHelpers.createNewList({
            listType: this.type,
            tr,
            editor: this.editor,
          });
        }
      })
    ]
  }
});
