import { ref, reactive, toRaw } from 'vue';

export default function useComment(params) {
  const comment = ref(params.comment);
  const user = reactive({
    name: params.user.name,
    email: params.user.email,
  });
  const timestamp = new Date(params.timestamp);

  const getValues = () => {
    return {
      comment: comment.value,
      user: toRaw(user),
      timestamp,
    }
  }
  return {
    comment,
    user,
    timestamp,
    getValues,
  }
}