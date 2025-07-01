import { TextSelection } from 'prosemirror-state';
import { findParentNode } from '@helpers/index.js';

/**
 * Delete the current list item.
 * If the list item is empty, the entire list will be removed.
 * If it has content, the list will be replaced with a paragraph containing that content.
 * Only triggers when cursor is at the beginning of a list item (parentOffset === 0).
 * @returns {Function} A ProseMirror command function.
 */
export const deleteListItem = () => (props) => {
  const { tr, state } = props
  const { selection } = state
  tr.setMeta('updateListSync', true)

  // --- MULTI‐NODE DELETE HANDLER ---
  if (!selection.empty) {
    const { from, to } = selection
    const fullySelectedBlocks = []

    // collect every block‐level node fully inside [from, to)
    state.doc.nodesBetween(from, to, (node, pos) => {
      if (
        node.isBlock &&
        pos >= from &&
        pos + node.nodeSize <= to
      ) {
        fullySelectedBlocks.push({ pos, size: node.nodeSize })
      }
    })

    if (fullySelectedBlocks.length) {
      // delete from the end backwards so earlier deletions
      // don’t shift the positions of later ones
      fullySelectedBlocks
        .sort((a, b) => b.pos - a.pos)
        .forEach(({ pos, size }) => {
          tr.delete(pos, pos + size)
        })

      // move the cursor to where the first deleted block was
      const $new = tr.doc.resolve(from)
      tr.setSelection(TextSelection.near($new))

      return true
    }

    // no full blocks found → let other commands handle it
    return false
  }

  // --- SINGLE‐ITEM BACKSPACE AT START
  const { $from } = state.selection
  // only run when at start of node
  if ($from.parentOffset !== 0) return false

  // find the list‐item and its parent list
  const currentListItem = findParentNode(n => n.type.name === 'listItem')(state.selection)
  if (!currentListItem) return false

  const listTypes = ['orderedList', 'bulletList']
  const parentList = findParentNode(n => listTypes.includes(n.type.name))(state.selection)
  if (!parentList) return false

  const currentParagraphNode = findParentNode(n => n.type.name === 'paragraph')(state.selection)
  const paragraphNode = currentListItem.node.content.firstChild
  if (paragraphNode !== currentParagraphNode.node) return false

  const listFrom = parentList.pos
  const listTo = listFrom + parentList.node.nodeSize

  // Case 1: empty list item → remove whole list
  if (!paragraphNode || paragraphNode.content.size === 0) {
    tr.delete(listFrom, listTo)
    return true
  }

  // Case 2: non‐empty list item → replace list with a paragraph
  const standalone = state.schema.nodes.paragraph.create(
    paragraphNode.attrs,
    paragraphNode.content,
    paragraphNode.marks
  )
  tr.replaceWith(listFrom, listTo, standalone)

  // set cursor inside the new paragraph
  const $pos = tr.doc.resolve(listFrom + 1)
  tr.setSelection(TextSelection.near($pos))

  return true
}