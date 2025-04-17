import { Node, Attribute } from '@core/index.js';
import { generateOrderedListIndex } from '@helpers/orderedListUtils.js';
import { styledListMarker as styledListMarkerPlugin } from './helpers/styledListMarkerPlugin.js';
import { findParentNode } from '@helpers/index.js';

export const ListItem = Node.create({
  name: 'listItem',

  content: 'paragraph* block*',

  defining: true,

  priority: 101, // to run listItem commands first

  addOptions() {
    return {
      htmlAttributes: {},
      bulletListTypeName: 'bulletList',
      orderedListTypeName: 'orderedList',
    };
  },

  parseDOM() {
    return [{ tag: 'li' }];
  },

  renderDOM({ htmlAttributes }) {
    return ['li', Attribute.mergeAttributes(this.options.htmlAttributes, htmlAttributes), 0];
  },

  addAttributes() {
    return {
      // Virtual attribute.
      markerType: {
        default: null,
        renderDOM: (attrs) => {
          let { listLevel, listNumberingType, lvlText } = attrs;
          let hasListLevel = !!listLevel?.length;

          if (!hasListLevel || !lvlText) {
            return {};
          }

          // MS Word has many custom ordered list options.
          // We need to generate the correct index here.
          let orderMarker = generateOrderedListIndex({
            listLevel,
            lvlText,
            listNumberingType,
          });

          if (!orderMarker) return {};

          return {
            'data-marker-type': orderMarker,
          };
        },
      },

      lvlText: {
        default: null,
        rendered: false,
      },

      listNumberingType: {
        default: null,
        rendered: false,
      },

      listLevel: {
        default: null,
        rendered: false,
      },
      
      // JC = justification. Expect left, right, center
      lvlJc: {
        default: null,
        rendered: false,
      },

      // This will contain indentation and space info.
      // ie: w:left (left indent), w:hanging (hanging indent)
      listParagraphProperties: {
        default: null,
        rendered: false,
      },

      // This will contain run properties for the list item
      listRunProperties: {
        default: null,
        rendered: false,
      },

      numId: {
        default: null,
        rendered: false,
      },

      attributes: {
        rendered: false,
      },
      
      spacing: {
        default: null,
        rendered: false,
      },

      indent: {
        default: null,
        rendered: false,
      }
    };
  },

  addCommands() {
    return {
      getCurrentListNode: () => ({ state }) => {
        return findParentNode((node) => node.type.name === this.name)(state.selection);
      },

      increaseListIndent: () => ({ commands }) => {
        if (!commands.sinkListItem(this.name)) { return false }
        commands.updateNodeStyle();
        commands.updateOrderedListStyleType();
        return true;
      },

      decreaseListIndent: () => ({ commands }) => {
        const currentList = commands.getCurrentList();
        const depth = currentList?.depth;

        if (depth === 1) return false;
        if (!commands.liftListItem(this.name)) { return true }
        if (!commands.updateNodeStyle()) { return false }

        const currentNode = commands.getCurrentListNode();
        const currentNodeIndex = currentList?.node?.children.findIndex((child) => child === currentNode.node);
        const nextNodePos = currentNode?.pos + currentNode?.node.nodeSize;
        const followingNodes = currentList?.node?.children.slice(currentNodeIndex + 1) || [];

        commands.updateOrderedListStyleType();
        commands.restartListNodes(followingNodes, nextNodePos);
        return true;
      },

      updateNodeStyle: () => ({ tr, state }) => {
        let list = findParentNode((node) => node.type.name === 'orderedList')(tr.selection);
        const current = findParentNode((node) => node.type.name === this.name)(state.selection);

        if (!list) return false;

        const firstNodeAttrs = list?.node.children[0]?.attrs;
        const newPos = tr.mapping.map(current.pos);
        tr.setNodeMarkup(newPos, undefined, {
          ...firstNodeAttrs,
        });
        return true;
      },
    }
  },

  addShortcuts() {
    return {
      Enter: () => {
        return this.editor.commands.splitListItem(this.name);
      },
      'Shift-Enter': () => {
        return this.editor.commands.first(({ commands }) => [
          () => commands.createParagraphNear(),
          () => commands.splitBlock(),
        ]);
      },
      Tab: () => {
        return this.editor.commands.increaseListIndent();
      },
      'Shift-Tab': () => {
        return this.editor.commands.decreaseListIndent();
      },
    };
  },

  addPmPlugins() {
    return [styledListMarkerPlugin()];
  },
});
