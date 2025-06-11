import { TextSelection } from 'prosemirror-state';
import { readFromClipboard } from '../../core/utilities/clipboardUtils.js';

/**
 * Get props by item id
 * 
 * Takes in the itemId for the menu item and passes the SlashMenu props to help
 * compute the props needed 
 * @param {string} itemId
 * @param {Object} props
 * @returns {Object}
 */
export const getPropsByItemId = (itemId, props) => {
    // Common props that are needed regardless of trigger type
    const editor = props.editor;

    const baseProps = {
        editor,

    };

    switch (itemId) {
        case 'insert-text':
            const { state } = editor.view;
            const { from, to, empty } = state.selection;
            const selectedText = !empty ? state.doc.textBetween(from, to) : '';

            return {
                ...baseProps,
                selectedText,
                handleClose: props.closePopover || (() => null),
                apiKey: editor.options?.aiApiKey,
                endpoint: editor.options?.aiEndpoint,
            };
        case 'table':
            return {
                ...baseProps,
                onSelect: ({rows, cols}) => {
                    editor.commands.insertTable({ rows, cols });
                    props.closePopover();
                },
            };
        case 'copy':
        case 'paste':
            return {
                ...baseProps,
                // These actions don't need additional props
            };

        default:
            return baseProps;
    }
}

/**
 * Move the editor cursor to the position closest to the mouse event
 * @param {MouseEvent} event
 * @param {Object} editor - The editor instance
 */
export function moveCursorToMouseEvent(event, editor) {
  const { view } = editor;
  const coords = { left: event.clientX, top: event.clientY };
  const pos = view.posAtCoords(coords)?.pos;
  if (typeof pos === 'number') {
    const tr = view.state.tr.setSelection(
      TextSelection.create(view.state.doc, pos)
    );
    view.dispatch(tr);
    view.focus();
  }
}

/**
 * Get the current editor context for menu logic
 *
 * @param {Object} editor - The editor instance
 * @param {MouseEvent} [event] - Optional mouse event (for context menu)
 * @returns {Object} context - { editor, selectedText, pos, node, event }
 */
export async function getEditorContext(editor, event) {
  const { view } = editor;
  const { state } = view;
  const { from, to, empty } = state.selection;
  const selectedText = !empty ? state.doc.textBetween(from, to) : '';

  let pos = null;
  let node = null;

  if (event) {
    const coords = { left: event.clientX, top: event.clientY };
    pos = view.posAtCoords(coords)?.pos ?? null;
    node = pos !== null ? state.doc.nodeAt(pos) : null;
  } else {
    // For slash trigger, use the selection anchor
    pos = from;
    node = state.doc.nodeAt(pos);
  }

  // We need to check if we have anything in the clipboard
  const clipboardContent = await readFromClipboard(state);

  return {
    editor,
    selectedText,
    pos,
    node,
    event,
    clipboardContent,
  };
}

/**
 * Checks if the current selection is inside a table node
 * Used to determine whether to show table-specific menu items in the slash menu
 * 
 * @param {EditorState} state - The current editor state
 * @returns {boolean} True if selection is inside a table, false otherwise
 */
export function isInsideTable(state) {
  const $from = state.selection.$from;
  for (let d = $from.depth; d > 0; d--) {
    if ($from.node(d).type.name === 'table') {
      return true;
    }
  }
  return false;
}