/**
 * Pagination helper to ensure that breaks are always aligned to the editor container
 * @param {HTMLElement} editorElem The editor container element
 * @returns {MutationObserver} The observer instance
 */
export const observeDomChanges = (editorElem, editor) => {
  if (!editorElem.value) return;

  const zoom = editor.options.scale;
  if (!zoom) return;

  const observer = new MutationObserver((mutationsList) => {
    for (const mutation of mutationsList) {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach((node) => {
          if (node.classList?.contains('pagination-break-wrapper')) {
            const bounds = editorElem.value.getBoundingClientRect();
            const nodeBounds = node.getBoundingClientRect();

            // Adjust the position taking zoom into account
            const left = ((nodeBounds.left - bounds.left) / zoom) * -1 + 'px';
            node.style.transform = `translateX(${left})`;
          }
        });
      }
    }
  });

  observer.observe(editorElem.value, {
    childList: true,
    subtree: true,
  });

  return observer;
};
