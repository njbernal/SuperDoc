<script setup>
import { computed, toRefs, ref, getCurrentInstance, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useCommentsStore } from '@/stores/comments-store';
import { useSuperdocStore } from '@/stores/superdoc-store';
import useComment from '@/components/CommentsLayer/use-comment';
import Avatar from '@/components/general/Avatar.vue';

const superdocStore = useSuperdocStore();
const commentsStore = useCommentsStore();
const { COMMENT_EVENTS, getCommentLocation } = commentsStore;
const { getConfig } = storeToRefs(commentsStore);
const { areDocumentsReady } = superdocStore;
const { proxy } = getCurrentInstance();

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
  currentDocument: {
    type: Object,
    required: true,
  }
});

const inputIsFocused = ref(false);
const input = ref(null);
const addComment = () => {
  if (!input.value?.value) return;

  const comment = useComment({
    user: {
      email: props.user.email,
      name: props.user.name,
    },
    timestamp: new Date(),
    comment: input.value.value,
  });

  props.data.comments.push(comment);
  input.value.value = '';
  proxy.$superdoc.broadcastComments(COMMENT_EVENTS.ADD, props.data.getValues());
}

function formatDate(timestamp) {
  const date = new Date(timestamp);
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const meridiem = hours >= 12 ? 'PM' : 'AM';
  const formattedHours = hours % 12 || 12;
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = monthNames[date.getMonth()];
  const day = date.getDate();
  const formattedTime = `${formattedHours}:${minutes.toString().padStart(2, '0')}${meridiem}`;
  const formattedDate = `${formattedTime} ${month} ${day}`;
  return formattedDate;
}

const handleKeyUp = () => {
  addComment();
}

const getSidebarCommentStyle = computed(() => {
  const topOffset = 10;
  const location = getCommentLocation(props.data.selection, props.parent);
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

const cleanConversations = () => {
  if (props.data.comments.length) return;
  const id = props.data.conversationId;
  props.currentDocument.removeConversation(id);
  proxy.$superdoc.broadcastComments(COMMENT_EVENTS.DELETED, id);
}

const handleClickOutside = (e) => {
  if (e.target.dataset.id === props.data.conversationId) return;
  cleanConversations();
  setFocus(false);
}

const setFocus = (state) => {
  props.data.isFocused = state;
}

const markDone = () => {
  const convo = props.currentDocument.conversations.find((c) => c.conversationId === props.data.conversationId);
  convo.markDone(props.user.email, props.user.name);
  props.currentDocument.removeConversation(convo.conversationId);
  proxy.$superdoc.broadcastComments(COMMENT_EVENTS.RESOLVED, convo.getValues());
}


</script>

<template>
  <div
      v-if="areDocumentsReady"
      class="comments-dialog"
      @click="setFocus(true)"
      v-click-outside="handleClickOutside"
      :style="getSidebarCommentStyle">

    <div v-for="(item, index) in data.comments">
      <div class="card-section comment-header">
        <div class="comment-header">
          <div class="avatar">
            <Avatar :user="item.user" />
          </div>
          <div class="user-info">
            <div class="user-name">{{ item.user.name }}</div>
            <div class="user-timestamp">{{ formatDate(item.timestamp) }}</div>
          </div>
        </div>
        <div class="overflow-menu">
          <i
              v-if="index === 0 && getConfig.allowResolve"
              class="fal fa-check"
              @click.stop.prevent="markDone"
              title="Mark done and hide comment thread">
          </i>
        </div>
      </div>
      <div class="card-section comment-body">
        <div class="comment">
          {{ item.comment }}
        </div>
      </div>
    </div>

    <div class="card-section input-section" v-if="!getConfig.readOnly && props.data.isFocused && !props.data.markedDone">
      <div class="comment-entry">
        <input
            ref="input"
            type="text"
            placeholder="Add a comment..."
            @keyup.enter="handleKeyUp"
            @focus="inputIsFocused = true;" />
      </div>
    </div>

    <div class="card-section comment-footer" v-if="!getConfig.readOnly && props.data.isFocused && !props.data.markedDone">
      <button class="sd-button primary" @click="addComment">Comment</button>
      <button class="sd-button">Cancel</button>
    </div>
  </div>
</template>

<style scoped>
.comments-dialog {
  position: absolute;
  display: flex;
  flex-direction: column;
  position: absolute;
  padding: 16px;
  border-radius: 12px;
  background-color: #EDEDED;
  transition: background-color 250ms ease;
  -webkit-box-shadow: 0px 0px 2px 2px rgba(50, 50, 50, 0.15);
  -moz-box-shadow: 0px 0px 2px 2px rgba(50, 50, 50, 0.15);
  box-shadow: 0px 0px 2px 2px rgba(50, 50, 50, 0.15);
  z-index: 5;
}
.overflow-menu {
  flex-shrink: 1;
  display: flex;
}
.overflow-menu i {
  width: 20px;
  height: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  cursor: pointer;
  transition: all 250ms ease;
  margin-left: 2px;
  cursor: pointer;
}
.overflow-menu i:hover {
  background-color: #DBDBDB;
}
.card-section {
  margin: 5px 0;
}

.comment-entry {
  flex-grow: 1;
}
.comment-entry input {
  border-radius: 12px;
  padding: 10px 14px;
  outline: none;
  border: 1px solid #DBDBDB;
  width: 100%;
}

.comment-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.avatar {
  margin-right: 10px;
}
.user-info {
  display: flex;
  flex-direction: column;
  font-size: 12px;
}
.user-name {
  font-weight: 600;
}
.user-timestamp {
  font-size: 12px;
  color: #999;
}
.sd-button {
  margin-right: 5px;
}
.comment {
  font-size: 14px;
  margin: 10px 0;
}
.conversation-item {
  border-bottom: 1px solid #DBDBDB;
  padding-bottom: 10px;
}
</style>