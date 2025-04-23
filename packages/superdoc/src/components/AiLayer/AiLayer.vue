<script setup>
import { defineProps, defineExpose, ref } from 'vue';
import { useSuperdocStore } from '@superdoc/stores/superdoc-store';

const props = defineProps({
  editor: {
    type: Object,
    required: false,
    default: null
  }
});

const superdocStore = useSuperdocStore();

// Create a ref for the highlight layer
const highlightLayer = ref(null);

const getStyle = () => {
  const placement = superdocStore.activeSelection.selectionBounds;

  return {
    position: 'absolute',
    top: parseFloat(placement.top) + 'px',
    left: placement.left + 'px',
    width: placement.right - placement.left + 'px',
    height: placement.bottom - placement.top + 'px',
    backgroundColor: '#6366f1' + '33',
    pointerEvents: 'none',
  };
};

const addAiHighlight = () => {
  // Add the AI mark using the editor if available
  if (props.editor && !props.editor.isDestroyed) {
    props.editor.commands.insertAiMark();
  } else {
    // Fallback to DOM method if editor is not available
    // Only add if there isn't already a highlight
    if (highlightLayer.value && !highlightLayer.value.hasChildNodes()) {
      const highlightDiv = document.createElement('div');
      highlightDiv.className = 'ai-highlight-anchor sd-highlight';
      Object.assign(highlightDiv.style, getStyle());
      highlightLayer.value.appendChild(highlightDiv);
    }
  }
};

const removeAiHighlight = () => {
  // Remove the AI mark using the editor if available
  if (props.editor && !props.editor.isDestroyed) {
    props.editor.commands.removeAiMark();
  } 
  
  // Always clear the DOM layer as a safety measure
  if (highlightLayer.value) {
    highlightLayer.value.innerHTML = '';
  }
};

defineExpose({
  addAiHighlight,
  removeAiHighlight,
});
</script>

<template>
  <div class="ai-highlight-container" id="aiHighlightContainer">
    <div class="ai-highlight-layer" ref="highlightLayer"></div>
  </div>
</template>


<style scoped>
.ai-highlight-layer {
  position: relative;
}
.ai-highlight-anchor {
  position: absolute;
  cursor: pointer;
  z-index: 3;
  border-radius: 4px;
  transition: background-color 250ms ease;
}
.bypass {
  display: none;
}
</style>
