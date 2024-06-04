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
  const activeComment = ref(null);

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

  function isOverlap(obj1, obj2) {
    if (!obj1.comments.length || !obj2.comments.length) return false;
    const sel1 = obj1.selection.selectionBounds;
    const sel2 = obj2.selection.selectionBounds;
  
    if (sel1.bottom <= sel2.top || sel1.top >= sel2.bottom) {
      return false;
    }
  
    return true;
  }
  
  const getAllConversations = computed(() => {
    const allConvos = [];
    let overlaps = 0;
    documentsWithConverations.value.map(doc => {
      doc.conversations.forEach((c) => {
  
        for (let index in allConvos) {
          const conv = allConvos[index];
          let currentOverlap = conv.overlap || overlaps;
  
          if (isOverlap(conv, c)) {
            conv.overlap = currentOverlap;
            c.overlap = currentOverlap;
            overlaps++;
          }
        };
  
        allConvos.push({
          ...c,
          documentId: doc.documentId,
          doc: doc,
        });
      })
    });
  
    const convosWithoutOverlaps = allConvos.filter((c) => c.overlap === undefined);
    const convosWithOverlaps = allConvos.filter((c) => c.overlap !== undefined);
    const overlapGroups = {};
    convosWithOverlaps.forEach((c) => {
      console.debug('overlapGroups', overlapGroups, c.overlap);
      if (!(c.overlap in overlapGroups)) {
        overlapGroups[c.overlap] = {
          convos: [],
          bounds: c.selection.selectionBounds,
        };
      }
  
      overlapGroups[c.overlap].convos.push(c);
      console.debug('overlapGroups', overlapGroups, c.overlap);
    });
  
    console.debug('overlapGroups', overlapGroups);
    console.debug('convosWithoutOverlaps', convosWithoutOverlaps);  
    return [convosWithoutOverlaps, overlapGroups];
  });

  const isConversationInGroup = (conversation) => {
    const [convos, groups] = getAllConversations.value;
    console.debug('isConversationInGroup', convos, groups);
    const found = Object.values(groups).find((g) => g.convos.some((c) => c.conversationId === conversation.conversationId));
    console.debug('isConversationInGroup', found);
    return found;
  }

  return {
    COMMENT_EVENTS,
    hasInitializedComments,
    getConfig,
    activeComment,

    // Getters
    getConfig,
    documentsWithConverations,
    getAllConversations,

    // Actions
    getCommentLocation,
    isConversationInGroup
  }
});