import { defineStore } from 'pinia';
import { ref, reactive, computed } from 'vue';
import { comments_module_events } from '@common/event-types.js';
import { useSuperdocStore } from '@/stores/superdoc-store';

export const useCommentsStore = defineStore('comments', () => {
  const superdocStore = useSuperdocStore();

  const commentsConfig = reactive({
    name: 'comments',
    readOnly: false,
    allowResolve: true,
    showResolved: false,
  });

  const COMMENT_EVENTS = comments_module_events;
  const hasInitializedComments = ref(false);

  const documentsWithConverations = computed(() => {
    return superdocStore.documents?.filter((d) => d.conversations.length > 0) || [];
  });

  const getConfig = computed(() => {
    return {
      ...commentsConfig,
      ...superdocStore.modules?.comments,
    }
  })
  const getCommentLocation = (selection, parent) => {
    const containerBounds = selection.getContainerLocation(parent)
    const top = containerBounds.top + selection.selectionBounds.top;
    const left = containerBounds.left + selection.selectionBounds.left;
    return {
      top: top,
      left: left,
    }
  }

  return {
    COMMENT_EVENTS,
    hasInitializedComments,
    getConfig,

    // Getters
    getConfig,
    documentsWithConverations,

    // Actions
    getCommentLocation,
  }
});