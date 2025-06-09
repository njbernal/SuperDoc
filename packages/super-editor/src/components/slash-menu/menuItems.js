import { toolbarIcons } from '../toolbar/toolbarIcons.js';
import AIWriter from '../toolbar/AIWriter.vue';
import { serializeSelectionToClipboard, writeToClipboard, readFromClipboard } from '../../core/utilities/clipboardUtils.js';

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
        if (clipboardContent) {
          const { from, to } = state.selection;
          dispatch(state.tr.replaceWith(from, to, clipboardContent));
        }
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