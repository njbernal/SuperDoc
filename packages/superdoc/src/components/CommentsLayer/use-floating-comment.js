import { ref, reactive } from 'vue';

export function useFloatingComment(params) {
  console.debug('\n\n useFloatingComment PARAMS', params, '\n\n')
  const id = params.commentId;
  const conversation = ref(params);
  const position = reactive({
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  });
  const offset = ref(0);

  return {
    id,
    conversation,
    position,
    offset,
  };
}
