<script setup>
import '@harbour-enterprises/superdoc/style.css';
import { onMounted, shallowRef } from 'vue';
import { SuperDoc } from '@harbour-enterprises/superdoc';

// This is our custom mark that we are creating for this example
import { CustomMark } from './custom-mark.js';

const superdoc = shallowRef(null);
const init = () => {
  superdoc.value = new SuperDoc({
    selector: '#editor', // Can also be a class ie: .main-editor

    pagination: true,

    // Initialize the toolbar
    toolbar: '#toolbar',
    toolbarGroups: ['center'],

    editorExtensions: [CustomMark],

  });
};

const insertCustomMark = () => {
  const randomId = Math.random().toString(36).substring(2, 7);
  superdoc.value?.activeEditor?.commands.setMyCustomMark(randomId);
};

onMounted(() => init());
</script>

<template>
  <div class="example-container">
    <h1>SuperDoc: Create a custom mark with custom command</h1>

    <p>In this example, we create a simple custom mark to pass into SuperDoc.</p>

    <div id="toolbar" class="my-custom-toolbar"></div>
    <div class="editor-and-button">
      <div id="editor" class="main-editor"></div>
      <div>
        <button class="insert-mark" @click="insertCustomMark">Insert custom mark</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.example-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.editor-and-button {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: center;
}
.insert-mark {
  padding: 8px 12px;
  border-radius: 8px;
  margin-left: 10px;
  outline: none;
  border: none;
  background-color: #AECEE6;
}
</style>
