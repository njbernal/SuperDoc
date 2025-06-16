import { TextSelection } from 'prosemirror-state';
import LinkInput from './toolbar/LinkInput.vue';

/**
 * Calculates cursor position based on margin click event
 * @param {MouseEvent} event Mousedown event
 * @param {SuperEditor} editor SuperEditor instance
 */
export const onMarginClickCursorChange = (event, editor) => {
  const y = event.clientY;
  const x = event.clientX;
  const { view } = editor;
  const editorRect = view.dom.getBoundingClientRect();

  let coords = {
    left: 0,
    top: y,
  };
  let isRightMargin = false;

  if (x > editorRect.right) {
    coords.left = editorRect.left + editorRect.width - 1;
    isRightMargin = true;
  } else if (x < editorRect.left) {
    coords.left = editorRect.left;
  }

  const pos = view.posAtCoords(coords)?.pos;
  if (pos) {
    let cursorPos = pos;

    if (isRightMargin) {
      const $pos = view.state.doc.resolve(pos);
      const charOffset = $pos.textOffset;

      const node = view.state.doc.nodeAt(pos);
      const text = node?.text;
      const charAtPos = text?.charAt(charOffset);

      cursorPos = node?.isText && charAtPos !== ' ' ? pos - 1 : pos;
    }

    const transaction = view.state.tr.setSelection(
      TextSelection.create(view.state.doc, cursorPos)
    );
    view.dispatch(transaction);
    view.focus();
  }
}

/**
 * Gets the href attribute of a link mark at the current selection
 * @param {import('prosemirror-state').EditorState} state - The editor state
 * @returns {string|null} The href attribute of the link mark, or null if no link mark exists
 */
function getLinkHrefAtSelection(state) {
  const { selection, schema } = state;
  const linkMark = schema.marks.link;
  if (!linkMark) return null;

  // For a cursor selection
  if (selection.empty) {
    const marks = state.storedMarks || selection.$from.marks();
    const link = marks.find(mark => mark.type === linkMark);
    return link ? link.attrs.href : null;
  }

  // For a range selection, return the first found href
  let href = null;
  state.doc.nodesBetween(selection.from, selection.to, node => {
    const link = node.marks.find(mark => mark.type === linkMark);
    if (link) {
      href = link.attrs.href;
      return false;
    }
  });
  return href;
}

/**
 * Checks if the current selection has a parent node of a given type
 * and shows a popover with a link input if it does
 * @param {Editor} editor - The editor instance
 * @param {Object} popoverControls - The popover controls object
 */
export const checkNodeSpecificClicks = (editor, event, popoverControls) => {
  if (!editor) return;

  // Check if the selection has a parent node of a given type
  if(selectionHasNodeOrMark(editor.view.state, 'link')) {
    const href = getLinkHrefAtSelection(editor.view.state) || '';
    // Show popover with link input
    popoverControls.component = LinkInput;
    // Calculate the position of the popover relative to the editor
    popoverControls.position = {
      left: `${event.clientX - editor.element.getBoundingClientRect().left}px`,
      top: `${event.clientY - editor.element.getBoundingClientRect().top + 15}px`,
    };
    popoverControls.props = {
      showInput: true,
      href,
    };
    popoverControls.visible = true;
  }
}

/**
 * Checks if the current selection is inside a node or mark with the given name.
 * @param {EditorState} state - The ProseMirror editor state.
 * @param {string} name - The node or mark name to check for (e.g. 'paragraph', 'link').
 * @returns {boolean}
 */
export function selectionHasNodeOrMark(state, name) {
  // 1. Check for node in the parent chain
  const $from = state.selection.$from;
  for (let d = $from.depth; d > 0; d--) {
    if ($from.node(d).type.name === name) {
      return true;
    }
  }

  // 2. Check for mark at the selection
  const markType = state.schema.marks[name];
  if (markType) {
    const { from, to, empty } = state.selection;
    if (empty) {
      // Cursor: check marks at the cursor
      if (markType.isInSet(state.storedMarks || $from.marks())) {
        return true;
      }
    } else {
      // Range: check if any text in the range has the mark
      let hasMark = false;
      state.doc.nodesBetween(from, to, node => {
        if (markType.isInSet(node.marks)) {
          hasMark = true;
          return false;
        }
      });
      if (hasMark) return true;
    }
  }

  // Not found as node or mark
  return false;
}