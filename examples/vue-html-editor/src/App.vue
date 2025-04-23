<script setup>
import { onMounted } from 'vue';
import { Editor } from '@harbour-enterprises/superdoc/super-editor';

const init = () => {

  const config = {
    selector: '#editor',
    mode: 'text',
    content: '<p>test</p>'
  };

  // Initialize the editor
  const myEditor = new Editor(config);
};

onMounted(() => init());
</script>

<template>
  <div>
    <h1>SuperDoc: Rich-text editing with SuperEditor and Vue</h1>

    <div id="toolbar"></div>
    <div id="editor" class="main-editor"></div>
  </div>
</template>

<style scoped>
.main-editor {
  background-color: red;
}
</style>
