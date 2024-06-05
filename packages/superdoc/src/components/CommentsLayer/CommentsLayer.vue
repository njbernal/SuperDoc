<script setup>
import { getCurrentInstance, computed, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useCommentsStore } from '@/stores/comments-store';
import { useSuperdocStore } from '@/stores/superdoc-store';
import useConversation from './use-conversation';

const superdocStore = useSuperdocStore();
const commentsStore = useCommentsStore();
const { COMMENT_EVENTS, getCommentLocation } = commentsStore;
const { documentsWithConverations, activeComment } = storeToRefs(commentsStore);
const { documents } = storeToRefs(superdocStore);
const { proxy } = getCurrentInstance();

const emit = defineEmits(['highlight-click']);
const props = defineProps({
  user: {
    type: Object,
    required: true,
  },
  parent: {
    type: Object,
    required: true,
  },
});

const addCommentEntry = (selection) => {
  const params = {
    creatorEmail: props.user.email,
    creatorName: props.user.name,
    documentId: selection.documentId,
    selection,
    isFocused: true,
  }

  const bounds = selection.selectionBounds;
  if (bounds.top > bounds.bottom) {
    const temp = bounds.top;
    bounds.top = bounds.bottom;
    bounds.bottom = temp;
  }

  if (bounds.left > bounds.right) {
    const temp = bounds.left;
    bounds.left = bounds.right;
    bounds.right = temp;
  }

  selection.selectionBounds = bounds;
  const matchedDocument = documents.value.find((c) => c.id === selection.documentId);
  const newConvo = useConversation(params);
  activeComment.value = newConvo.conversationId;

  matchedDocument.conversations.push(newConvo);
  proxy.$superdoc.broadcastComments(COMMENT_EVENTS.NEW, newConvo.getValues());
}

const getStyle = (conversation) => {
  const placement = conversation.selection.selectionBounds;
  const location = getCommentLocation(conversation.selection, props.parent);

  return {
    position: 'absolute',
    top: location.top + 'px',
    left: location.left + 'px',
    width: placement.right - placement.left + 'px',
    height: placement.bottom - placement.top + 'px',
  }
}

const handleHighlightClick = (conversation) => {
  conversation.isFocused = true;
  activeComment.value = conversation.conversationId;
  emit('highlight-click', conversation);
}

const getAllConversations = computed(() => {
  return documentsWithConverations.value.reduce((acc, doc) => {
    return acc.concat(doc.conversations);
  }, []);
});

defineExpose({
  addCommentEntry
});

</script>

<template>
  <div class="comments-container" id="commentsContainer">
    <div class="comments-layer">
      <div
          v-for="conversation in getAllConversations"
          class="comment-anchor sd-highlight"
          @click="handleHighlightClick(conversation)"
          :data-id="conversation.conversationId"
          :style="getStyle(conversation)"></div>
    </div>
  </div>
</template>

<style scoped>
.comment-doc {
  background-color: red;
  position: relative;
}
.comments-layer {
  position: relative;
}
.comment-anchor {
  position: absolute;
  cursor: pointer;
  z-index: 3;
  border-radius: 4px;
  transition: background-color 250ms ease;
  pointer-events: auto;
}
.comment-anchor:hover {
  background-color: #FFD70099;
}
.comments-container {
  pointer-events: none; 
}
</style>