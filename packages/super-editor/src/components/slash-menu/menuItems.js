import { toolbarIcons } from '../toolbar/toolbarIcons.js';
import AIWriter from '../toolbar/AIWriter.vue';
import { serializeSelectionToClipboard, writeToClipboard, isBlockContent, extractText } from '../../core/utilities/clipboardUtils.js';

/**
 * Get menu items based on context (trigger, selection, node, etc)
 * @param {Object} context - { editor, selectedText, pos, node, event, trigger }
 * @returns {Array<{
 *   id: string,
 *   label: string,
 *   icon?: string,
 *   component?: Component,
 *   action?: (editor: Editor) => void,
 *   allowedTriggers: Array<'slash'|'click'>,
 *   requiresSelection?: boolean,
 *   requiresClipboard?: boolean
 * }>} Array of menu items
 */
export function getItems(context) {
  const { selectedText, node, event, trigger, clipboardContent } = context;

  const items = [
    {
      id: 'insert-text',
      label: selectedText ? 'Replace Text' : 'Generate Text',
      icon: toolbarIcons.ai,
      component: AIWriter,
      action: (editor) => {
        // Add AI highlight when menu item is triggered
        if (editor?.commands && typeof editor.commands?.insertAiMark === 'function') {
          editor.commands.insertAiMark();
        }
      },
      allowedTriggers: ['slash', 'click'],
    },
    {
      id: 'cut',
      label: 'Cut',
      icon: toolbarIcons.cut,
      action: async (editor) => {
        const { state, dispatch } = editor.view;
        const { htmlString, text } = serializeSelectionToClipboard(state);
        await writeToClipboard({ htmlString, text });
        const { from, to } = state.selection;
        dispatch(state.tr.delete(from, to));
      },
      allowedTriggers: ['click'],
      requiresSelection: true
    },
    {
      id: 'copy',
      label: 'Copy',
      icon: toolbarIcons.copy,
      action: async (editor) => {
        const { state } = editor.view;
        const { htmlString, text } = serializeSelectionToClipboard(state);
        await writeToClipboard({ htmlString, text });
      },
      allowedTriggers: ['click'],
      requiresSelection: true
    },
    {
      id: 'paste',
      label: 'Paste',
      icon: toolbarIcons.paste,
      action: async (editor) => {
        const { state, dispatch } = editor.view;
        if (!clipboardContent) return;
        const selection = state.selection;
        const schema = state.schema;
        // If selection is inside a textblock (paragraph, heading, etc)
        const $from = selection.$from;
        const parent = $from.parent;
        const isInlineContext = parent.isTextblock && $from.parentOffset !== 0;
        // If clipboard content is block and we're in inline context, paste as text
        if (isBlockContent(clipboardContent) && isInlineContext) {
          const text = extractText(clipboardContent);
          if (text) {
            const textNode = schema.text(text);
            dispatch(state.tr.replaceSelectionWith(textNode, false));
          }
          return;
        }
        // If clipboard content is inline or we're at block level, paste as-is
        // Fix for pasting at end of doc: if selection is at end, use insert instead of replaceSelectionWith
        const atEnd = selection.$to.pos === state.doc.content.size;
        if (atEnd && isBlockContent(clipboardContent)) {
          // Insert at end
          let tr = state.tr.insert(state.doc.content.size, clipboardContent);
          dispatch(tr.scrollIntoView());
          return;
        }
        // Default: replace selection with clipboard content
        dispatch(state.tr.replaceSelectionWith(clipboardContent, false));
      },
      allowedTriggers: ['click'],
      requiresClipboard: true
    }
  ];

  // Filter - can be extended to include more context-based filtering
  return items.filter(item => {
    // If the item requires a selection and there is no selection, return false
    if (item.requiresSelection && !selectedText) return false;
    // If the item is not allowed to be triggered with the current trigger, return false
    if (!item.allowedTriggers.includes(trigger)) return false;
    // If the item requires clipboard content and there is no clipboard content, return false
    if (item.requiresClipboard && !clipboardContent) return false;
    return true;
  });
}