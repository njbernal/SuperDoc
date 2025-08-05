import { Plugin, PluginKey } from 'prosemirror-state';
import { Decoration, DecorationSet } from 'prosemirror-view';

import { getLineHeightValueString } from '@core/super-converter/helpers.js';
import { generateLinkedStyleString, getLinkedStyle } from './helpers.js';

export const LinkedStylesPluginKey = new PluginKey('linkedStyles');

export const createLinkedStylesPlugin = (editor) => {
  return new Plugin({
    key: LinkedStylesPluginKey,
    state: {
      init(_, { doc, selection }) {
        if (!editor.converter || editor.options.mode !== 'docx') return {};
        const styles = editor.converter?.linkedStyles || [];
        return {
          styles,
          decorations: generateDecorations(editor.state, styles),
        };
      },
      apply(tr, prev, oldEditorState, newEditorState) {
        if (!editor.converter || editor.options.mode !== 'docx') return { ...prev };
        let decorations = prev.decorations || DecorationSet.empty;
        if (tr.docChanged) {
          const styles = LinkedStylesPluginKey.getState(editor.state).styles;
          decorations = generateDecorations(newEditorState, styles);
        }

        return { ...prev, decorations };
      },
    },
    props: {
      decorations(state) {
        return LinkedStylesPluginKey.getState(state)?.decorations;
      },
    },
  });
};

/**
 * Generate style decorations for linked styles
 *
 * @param {Object} state Editor state
 * @param {Array[Object]} styles The linked styles
 * @returns {DecorationSet} The decorations
 */
const generateDecorations = (state, styles) => {
  const decorations = [];
  let lastStyleId = null;
  const doc = state?.doc;

  doc.descendants((node, pos) => {
    const { name } = node.type;

    // Track the current StyleId
    if (node?.attrs?.styleId) lastStyleId = node.attrs.styleId;
    if (name === 'paragraph' && !node.attrs?.styleId) lastStyleId = null;
    if (name !== 'text' && name !== 'listItem' && name !== 'orderedList') return;

    const { linkedStyle, basedOnStyle } = getLinkedStyle(lastStyleId, styles);
    if (!linkedStyle) return;

    const $pos = state.doc.resolve(pos);
    const parent = $pos.parent;

    const styleString = generateLinkedStyleString(linkedStyle, basedOnStyle, node, parent);
    if (!styleString) return;

    const decoration = Decoration.inline(pos, pos + node.nodeSize, { style: styleString });
    decorations.push(decoration);
  });
  return DecorationSet.create(doc, decorations);
};

/**
 * Get the spacing style for a given spacing object
 * @param {Object} spacing The spacing object
 * @property {Number} spacing.lineSpaceBefore The space before the line
 * @property {Number} spacing.lineSpaceAfter The space after the line
 * @property {Number} spacing.line The line height
 * @property {String} spacing.lineRule The line rule (e.g., 'auto', 'exact', 'multiple')
 * @property {Boolean} spacing.isLineHeight Whether to include line height in the style
 * @returns {Object} The spacing style object
 */
export const getSpacingStyle = (spacing) => {
  const { lineSpaceBefore, lineSpaceAfter, line, lineRule } = spacing;
  return {
    'margin-top': lineSpaceBefore + 'px',
    'margin-bottom': lineSpaceAfter + 'px',
    ...getLineHeightValueString(line, '', lineRule, true),
  };
};
