import { toolbarIcons } from '../toolbar/toolbarIcons.js';
import AIWriter from '../toolbar/AIWriter.vue';

/**
 * Get menu items based on context (trigger, selection, node, etc)
 * @param {Object} context - { editor, selectedText, pos, node, event, trigger }
 * @returns {Array<{
 *   id: string,
 *   label: string,
 *   icon?: string,
 *   component?: Component,
 *   action?: (editor: Editor) => void,
 *   allowedTriggers: Array<'slash'|'click'>
 * }>} Array of menu items
 */
export function getItems(context) {
  const { selectedText, node, event, trigger } = context;

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
      allowedTriggers: ['slash', 'click']
    },
    {
      id: 'cut',
      label: 'Cut',
      icon: toolbarIcons.cut,
      action: (view) => {
        const { state } = view;
        const { from, to } = state.selection;
        state.tr.delete(from, to);
      },
      allowedTriggers: ['click'],
      requiresSelection: true
    },
    {
      id: 'copy',
      label: 'Copy',
      icon: toolbarIcons.copy,
      action: (view) => {
        const { state } = view;
        const { from, to } = state.selection;
        const text = state.doc.textBetween(from, to);
        navigator.clipboard.writeText(text);
      },
      allowedTriggers: ['click'],
      requiresSelection: true
    },
    {
      id: 'paste',
      label: 'Paste',
      icon: toolbarIcons.paste,
      action: async (view) => {
        const text = await navigator.clipboard.readText();
        const { state, dispatch } = view;
        const { from, to } = state.selection;
        dispatch(state.tr.replaceWith(from, to, state.schema.text(text)));
      },
      allowedTriggers: ['click'],
    }
  ];

  // Filter - can be extended to include more context-based filtering
  return items.filter(item => {
    if (item.requiresSelection && !selectedText) return false;
    return true;
  });
}