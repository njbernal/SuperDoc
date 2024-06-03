<script setup>
import { computed } from 'vue';
import { NCheckbox } from 'naive-ui';

const props = defineProps({
  field: {
    type: Object,
    required: true,
  },
  isEditing: {
    type: Boolean,
    required: false,
    default: false,
  },
  optionId: {
    type: String,
    required: true,
  },
});

const getValue = computed(() => {
  const match = props.field.options.find((o) => o.annotationId.includes(props.optionId));
  return match?.checked;
});

</script>

<template>
  <div class="checkbox-container">
    <n-checkbox
      :checked="getValue"
      :disabled="!props.isEditing"></n-checkbox>
  </div>
</template>

<style scoped>
.checkbox-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: fit-content;
  margin-top: 5px;
}
</style>
