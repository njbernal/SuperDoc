<script setup>
import '@harbour-enterprises/superdoc/style.css';
import { onMounted, shallowRef } from 'vue';
import { SuperDoc } from '@harbour-enterprises/superdoc';
import UploadFile from '../../shared/vue/UploadFile/UploadFile.vue';

// Default document
import sampleDocument from '../../shared/data/sample-document.docx?url';

// This is our custom node that we are creating for this example
import { myCustomNode } from './custom-node';

const superdoc = shallowRef(null);
const editor = shallowRef(null);

const init = (fileToLoad) => {
  superdoc.value = new SuperDoc({
    // Can also be a class ie: .main-editor
    selector: '#editor',

    // Enable pagination
    pagination: true,

    document: fileToLoad ? { data: fileToLoad } : sampleDocument,

    // Initialize the toolbar
    toolbar: '#toolbar',
    toolbarGroups: ['center'],

    // Pass in custom extensions
    editorExtensions: [myCustomNode],

    // Listen for ready event
    onReady,
  });
};

const handleFileUpdate = (file) => {
  // Handle file update logic here
  console.log('File updated:', file);
  superdoc.value?.destroy();

  init(file);
}

/* When SuperDoc is ready, we can store a reference to the editor instance */
const onReady = () => {
  superdoc.value?.activeEditor?.on('create', ({ editor: activeEditor }) => {
    editor.value = activeEditor;
  });
}

onMounted(() => init());
</script>

<template>
  <div class="example-container">
    <h1>SuperDoc: Create a custom node with custom command</h1>

    <p>In this example, we create a simple custom node to pass into SuperDoc.</p>

    <div id="toolbar" class="my-custom-toolbar"></div>
    <div class="editor-and-button">
      <div id="editor" class="main-editor"></div>
      <div class="editor-buttons">
        <UploadFile :update-file="handleFileUpdate" />
        <button class="custom-button" @click="editor?.commands.insertCustomNode">Insert custom node (custom command)</button>
        <button
          class="custom-button" 
          @click="editor?.commands.insertContent(`<div data-node-type='customNode' id='some-id-123'>Custom Node Content</div>`)"
        >Insert custom node (insertContent())</button>
      </div>
    </div>
  </div>
</template>

<style>
.my-custom-node-default-class {
  background-color: #1355FF;
  border-radius: 8px;
  cursor: pointer;
  color: white;
  display: inline-block;
  padding: 2px 8px;
  font-size: 12px;
}
.my-custom-node-default-class:hover {
  background-color: #0a3dff;
}
</style>
