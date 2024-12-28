/**
 * Pagination helper to ensure that breaks are always aligned to the editor container
 * @param {HTMLElement} editorElem The editor container element
 * @returns {MutationObserver} The observer instance
 */
export const observeDomChanges = (editorElem) => {
  if (!editorElem.value) return;

  const observer = new MutationObserver((mutationsList) => {
    for (const mutation of mutationsList) {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach((node) => {
          if (node.classList?.contains('pagination-break-wrapper')) {
            const bounds = editorElem.value.getBoundingClientRect();
            const nodeBounds = node.getBoundingClientRect();
            const left = (nodeBounds.left - bounds.left) * -1 + 'px';
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
