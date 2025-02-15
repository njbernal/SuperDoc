/**
 * Adjusts pagination breaks based on editor zoom/positioning
 * 
 * @param {HTMLElement} editorElem The editor container element
 * @param {Object} editor The editor instance
 * @returns {void}
 */
export function adjustPaginationBreaks(editorElem, editor) {
  if (!editorElem.value || !editor?.value?.options?.scale) return;

  const zoom = editor.value.options.scale;
  const bounds = editorElem.value.getBoundingClientRect();
  const { pageMargins } = editor.value.getPageStyles();
  const marginLeft = pageMargins.left; 

  // Find all `.pagination-break-wrapper` nodes and adjust them
  const breakNodes = editorElem.value.querySelectorAll('.pagination-break-wrapper');

  breakNodes.forEach((node) => {
    const nodeBounds = node.getBoundingClientRect();
    const left = ((nodeBounds.left - bounds.left) / zoom) * -1 + 1;
    const minLeft = Math.min(marginLeft * -96, left)

    const inner = node.firstChild;
    if (inner.children.length >= 2) {
      const pm = inner.children[2];
      pm.style.paddingLeft = pageMargins.left * 96 + 'px';
      pm.style.paddingRight = pageMargins.right * 96 + 'px';
    };
    node.style.transform = `translateX(${minLeft}px)`;
  });
};