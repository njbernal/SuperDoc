<script setup>
import { computed } from 'vue';

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
  styleOverride: {
    type: Object,
    required: false,
    default: () => ({}),
  },
});

const getStyle = computed(() => {
  const fontSize = props.styleOverride?.originalFontSize || 120;
  return {
    fontSize: `${fontSize / 10}px`,
  };
});
</script>

<template>
  <div class="paragraph-field" :style="getStyle" v-if="field.value" v-html="field.value"></div>
  <span v-else>{{ field.placeholder || field.label }}</span>
</template>

<style scoped>
.paragraph-field {
  margin: 0;
  padding: 1px;
}
</style>
