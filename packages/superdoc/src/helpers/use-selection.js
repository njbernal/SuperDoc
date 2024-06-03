import { ref, reactive, toRaw } from 'vue';

export default function useSelection(params) {
  const documentId = ref(params.documentId);
  const page = ref(params.page);
  const selectionBounds = reactive(params.selectionBounds);

  /* Get the ID of the container */
  const getContainerId = () => `${documentId.value}-page-${page.value}`

  /* Get the location of the container */
  const getContainerLocation = (parentContainer) => {
    const parentBounds = parentContainer.getBoundingClientRect();
    const container = document.getElementById(getContainerId());

    if (!container) return {};
    const containerBounds = container.getBoundingClientRect();
    return {
      top: containerBounds.top - parentBounds.top,
      left: containerBounds.left - parentBounds.left,
    }
  }

  const getValues = () => {
    return {
      documentId: documentId.value,
      page: page.value,
      selectionBounds: toRaw(selectionBounds),
    }
  }

  return {
    documentId,
    page,
    selectionBounds,

    // Actions
    getValues,
    getContainerId,
    getContainerLocation
  }
}