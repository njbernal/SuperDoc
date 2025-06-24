import TableGrid from '../toolbar/TableGrid.vue';
import AIWriter from '../toolbar/AIWriter.vue';
import TableActions from '../toolbar/TableActions.vue';
import LinkInput from '../toolbar/LinkInput.vue';
import { selectionHasNodeOrMark } from '../cursor-helpers.js';
import { serializeSelectionToClipboard, writeToClipboard } from '@/core/utilities/clipboardUtils.js';
import { TEXTS, ICONS, TRIGGERS } from './constants.js';

/**
 * Check if a module is enabled based on editor options
 * This is used for hiding menu items based on module availability
 * 
 * @param {Object} editorOptions - Editor options
 * @param {string} moduleName - Name of the module to check (e.g. 'ai')
 * @returns {boolean} Whether the module is enabled
 */
const isModuleEnabled = (editorOptions, moduleName) => {
  switch (moduleName) {
    case 'ai':
      // isAiEnabled is a boolean set in SuperDoc.vue that passes whether or not the ai key is present on the config object
      // For example:
      // isAiEnabled: proxy.$superdoc.config.modules?.ai,
      return !!editorOptions?.isAiEnabled;
    // Example for future use cases
    // case 'comments':
    // return !!editorOptions?.isCommentsEnabled;
    default:
      return true;
  }
};

/**
 * Get menu sections based on context (trigger, selection, node, etc)
 * @param {Object} context - { editor, selectedText, pos, node, event, trigger }
 * @returns {Array<{
 *   id: string,
 *   items: Array<{
 *     id: string,
 *     label: string,
 *     icon?: string,
 *     component?: Component,
 *     action?: (editor: Editor) => void,
 *     allowedTriggers: Array<'slash'|'click'>,
 *     requiresSelection?: boolean,
 *     requiresClipboard?: boolean
 *     requiresTableParent?: boolean
 *     requiresModule?: string
 *   }>
 * }>} Array of menu sections
 */
export function getItems(context) {
  const { editor, selectedText, trigger, clipboardContent } = context;

  const isInTable = selectionHasNodeOrMark(editor.view.state, 'table', { requireEnds: true });

  const sections = [
    {
      id: 'ai-content',
      items: [
        {
          id: 'insert-text',
          label: selectedText ? TEXTS.replaceText : TEXTS.insertText,
          icon: ICONS.ai,
          component: AIWriter,
          action: (editor) => {
            // Add AI highlight when menu item is triggered
            if (editor?.commands && typeof editor.commands?.insertAiMark === 'function') {
              editor.commands.insertAiMark();
            }
          },
          allowedTriggers: [TRIGGERS.slash, TRIGGERS.click],
          requiresModule: 'ai',
        }
      ]
    },
    {
      id: 'general',
      items: [
        {
          id: 'insert-link',
          label: TEXTS.insertLink,
          icon: ICONS.link,
          component: LinkInput,
          allowedTriggers: [TRIGGERS.click],
        },
        {
          id: 'insert-table',
          label: TEXTS.insertTable,
          icon: ICONS.table,
          component: TableGrid,
          allowedTriggers: [TRIGGERS.slash, TRIGGERS.click],
        },
        {
          id: 'edit-table',
          label: TEXTS.editTable,
          icon: ICONS.table,
          component: TableActions,
          allowedTriggers: [TRIGGERS.slash, TRIGGERS.click],
          requiresTableParent: true,
        }
      ]
    },
    {
      id: 'clipboard',
      items: [
        {
          id: 'cut',
          label: TEXTS.cut,
          icon: ICONS.cut,
          action: async (editor) => {
            const { state, dispatch } = editor.view;
            const { htmlString, text } = serializeSelectionToClipboard(state);
            await writeToClipboard({ htmlString, text });
            const { from, to } = state.selection;
            dispatch(state.tr.delete(from, to));
          },
          allowedTriggers: [TRIGGERS.click],
          requiresSelection: true
        },
        {
          id: 'copy',
          label: TEXTS.copy,
          icon: ICONS.copy,
          action: async (editor) => {
            const { state } = editor.view;
            const { htmlString, text } = serializeSelectionToClipboard(state);
            await writeToClipboard({ htmlString, text });
          },
          allowedTriggers: [TRIGGERS.click],
          requiresSelection: true
        },
        {
          id: 'paste',
          label: TEXTS.paste,
          icon: ICONS.paste,
          action: async (editor) => {
            try {
              // Use the browser's clipboard API directly
              const clipboardData = await navigator.clipboard.read();
              // Let ProseMirror handle the paste event
              const event = new ClipboardEvent('paste', {
                clipboardData: new DataTransfer(),
                bubbles: true,
                cancelable: true
              });
              // Add the clipboard data to the event
              for (const item of clipboardData) {
                for (const type of item.types) {
                  const blob = await item.getType(type);
                  event.clipboardData.setData(type, await blob.text());
                }
              }
              // Dispatch the paste event to ProseMirror
              editor.view.dom.dispatchEvent(event);
            } catch (error) {
              console.warn('Failed to paste:', error);
            }
          },
          allowedTriggers: [TRIGGERS.click, TRIGGERS.slash],
          requiresClipboard: true
        }
      ]
    }
  ];

  // Filter sections and their items
  const filteredSections = sections.map(section => {
    const filteredItems = section.items.filter(item => {
      // If the item requires a specific module and that module is not enabled, return false
      if (item.requiresModule && !isModuleEnabled(editor?.options, item.requiresModule)) return false;
      // If the item requires a selection and there is no selection, return false
      if (item.requiresSelection && !selectedText) return false;
      // If the item is not allowed to be triggered with the current trigger, return false
      if (!item.allowedTriggers.includes(trigger)) return false;
      // If the item requires clipboard content and there is no clipboard content, return false
      if (item.requiresClipboard && !clipboardContent) return false;
      // If the item requires a table parent and there is no table parent, return false
      // Or if we are in a table, do not show 'insert table'
      if ((item.requiresTableParent && !isInTable) || (item.id === 'insert-table' && isInTable)) return false;
      return true;
    });

    return {
      ...section,
      items: filteredItems
    };
  }).filter(section => section.items.length > 0);

  return filteredSections;
}