<script setup>
import { computed, ref } from 'vue';
import { useCommentsStore } from '@/stores/comments-store';
import { useSuperdocStore } from '@/stores/superdoc-store';
import CommentDialog from '@/components/CommentsLayer/CommentDialog.vue';

const commentsStore = useCommentsStore();
const props = defineProps({
  user: {
    type: Object,
    required: false,
  },
  data: {
    type: Object,
    required: true,
  },
  parent: {
    type: Object,
    required: true,
  },
});

const { COMMENT_EVENTS, getCommentLocation } = commentsStore;
const getSidebarCommentStyle = computed(() => {
  const topOffset = 10;
  const location = getCommentLocation(props.data.convos[0].selection, props.parent);
  if (!location) return {};

  const style = {
    top: location.top - topOffset + 'px',
  }

  if (props.data.isFocused) {
    style.backgroundColor = 'white';
    style.zIndex = 10;
  }

  return style;
});

const isExpanded = ref(false);
const getNumberOfConversations = computed(() => props.data.convos.length);
const groupIds = computed(() => props.data.convos.map((c) => c.conversationId));

const handleClick = () => isExpanded.value = !isExpanded.value;
const handleClickOutside = (e) => {

  const dialogClasses = ['group-collapsed', 'number-bubble'];
  if (dialogClasses.some((c) => e.target.classList.contains(c))) return;
  // console.debug('OUTSIDE OF GROUP', e.target.classList)
  isExpanded.value = false;
}
const handleDialogClickOutside = (id) => {
  console.debug('handleDialogClickOutside GROUP', groupIds.value, id);

  // if (!groupIds.value.includes(id)) isExpanded.value = false;
}
</script>

<template>
  <div class="comments-group"
      :style="getSidebarCommentStyle"
      @click="handleClick"
      v-if="!isExpanded">
    <div class="group-collapsed">
      <div class="number-bubble">{{ getNumberOfConversations }}</div>
      <i class="fal fa-comment comments-icon"></i>
    </div>
  </div>

  <div
      class="comments-group expanded"
      v-else
      :style="getSidebarCommentStyle"
      v-click-outside="handleClickOutside">
    <template v-for="convo in props.data.convos"> 
      <CommentDialog
          class="comment-box"
          :data-id="convo.conversationId"
          :data="convo"
          :user="props.user"
          :current-document="convo.doc"
          />
    </template>
  </div>
</template>

<style scoped>
.group-collapsed {
  position: relative;
  display: inline;
}
.comments-icon {
  font-size: 20px;
  width: 50px;
  height: 50px;
  font-weight: 400;
  background-color: #E2E9FB;
  color: #1355FF;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 250ms ease;
  user-select: none;
  pointer-events: none;
}
.number-bubble {
  background-color: #1355FF;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  position: absolute;
  right: -4px;
  top: -4px;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}
.comments-group {
  cursor: pointer;
  position: absolute;
  display: flex;
  position: absolute;
  border-radius: 12px;
  transition: background-color 250ms ease;
  z-index: 5;
}
.comments-icon:hover {
  background-color: #E2E9FB99;
}
.expanded {
  flex-direction: column;
  background-color: #EDEDED;
  /* -webkit-box-shadow: 0px 0px 2px 2px rgba(50, 50, 50, 0.15);
  -moz-box-shadow: 0px 0px 2px 2px rgba(50, 50, 50, 0.15);
  box-shadow: 0px 0px 2px 2px rgba(50, 50, 50, 0.15); */
}
</style>