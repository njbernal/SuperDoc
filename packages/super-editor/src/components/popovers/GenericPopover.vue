
<script setup>
import { onMounted, onBeforeUnmount, ref, watch, computed } from 'vue';

const props = defineProps({
  visible: { type: Boolean, default: false },
  position: { type: Object, default: () => ({ left: '0px', top: '0px' }) },
});
const emit = defineEmits(['close']);

const popover = ref(null);

function handleClickOutside(event) {
  if (popover.value && !popover.value.contains(event.target)) {
    emit('close');
  }
}

watch(() => props.visible, (val) => {
  if (val) {
    document.addEventListener('mousedown', handleClickOutside);
  } else {
    document.removeEventListener('mousedown', handleClickOutside);
  }
});

onMounted(() => {
  if (props.visible) {
    document.addEventListener('mousedown', handleClickOutside);
  }
});
onBeforeUnmount(() => {
  document.removeEventListener('mousedown', handleClickOutside);
});

const popoverStyle = computed(() => ({
  left: props.position.left,
  top: props.position.top,
}));

</script>

<template>
  <div
    v-if="visible"
    class="generic-popover"
    :style="popoverStyle"
    ref="popover"
    @mousedown.stop
  >
    <slot />
  </div>
</template>
<style scoped>

/* @remarks - popover adds a slight shadow, this can be removed if needed */
.generic-popover {
  position: absolute;
  z-index: 1000;
  border-radius: 6px;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.05), 0px 10px 20px rgba(0, 0, 0, 0.1);
  min-width: 120px;
  min-height: 40px;
}
</style> 