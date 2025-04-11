<template>
  <div class="document-editor">
    <div :key="documentKey" class="editor-container">
      <div id="superdoc-toolbar" class="toolbar"></div>
      <div id="superdoc" class="editor"></div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref, shallowRef, watch } from 'vue';
import { SuperDoc } from '@harbour-enterprises/superdoc';
import '@harbour-enterprises/superdoc/style.css';

// Import our custom node plugin
import { myCustomNode } from '../plugins/MyCustomNodePlugin';

const props = defineProps({
  documentId: {
    type: String,
    required: true
  },
  initialData: {
    type: File,
    default: null
  },
  readOnly: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['editor-ready', 'editor-error']);

// Use ref to track the editor instance
const editor = shallowRef(null);
const documentKey = ref(0);

// Function to safely destroy editor
const destroyEditor = () => {
  if (editor.value) {
    editor.value = null;
  }
};

// Function to initialize editor
const initializeEditor = async () => {
  if (props.initialData) {
    // If initialData is provided, load the document
    await initializeLoadedFile();
  } else {
    // Otherwise, create a blank document
    await initializeBlankDocument();
  }
};

const hooks = {
  onFocus: () => {
    console.log('Editor focused');
  },
  onBlur: () => {
    console.log('Editor lost focus');
  },
  onReady: () => {
    emit('editor-ready', editor.value);

    // Let's insert our custom node into the document after the editor is ready
    editor.value?.activeEditor.commands.insertContent(`
      <div data-node-type='customNode' id='some-id-123'>Custom Node Content</div>
    `);

    // Now instead of using the generic insertContent, we can use our custom node command
    editor.value.activeEditor.commands.insertCustomNode({
      id: 'second-node-id',
      content: 'Display this text!',
    })

    // Let's check our current HTML
    const html = editor.value?.activeEditor.getHTML();
    console.debug('Editor HTML:', html);
  },
  onError: (error) => {
    emit('editor-error', error);
  },
};

// Configuration modules: We can customize the toolbar here
const modules = {
  toolbar: {
    selector: 'superdoc-toolbar',
    toolbarGroups: ['center'],
    excludeItems: ['underline'],
  }
};

const initializeBlankDocument = async () => {
  editor.value = new SuperDoc({
    selector: '#superdoc',
    toolbar: 'superdoc-toolbar',
    format: 'docx',
    documentMode: props.readOnly ? 'viewing' : 'editing',

    // Listen for various editor events
    ...hooks,

    // Include customized modules
    modules: {
      ...modules,
    },

    // Register our custom node here
    editorExtensions: [myCustomNode],
  });
};

const initializeLoadedFile = async () => {
  try {
    // Ensure cleanup of previous instance
    destroyEditor();

    // Create new editor instance
    editor.value = new SuperDoc({
      selector: '#superdoc',
      toolbar: 'superdoc-toolbar',
      documentMode: props.readOnly ? 'viewing' : 'editing',
      documents: [{
        id: props.documentId,
        type: 'docx',
        data: props.initialData
      }],

    // Listen for various editor events
    ...hooks,

    // Include customized modules
    ...modules,

      // Register our custom node here
      editorExtensions: [myCustomNode],
    });
  } catch (error) {
    console.error('Failed to initialize editor:', error);
    emit('editor-error', error);
  }
};

// Watch for changes in props that should trigger re-initialization
watch(
  () => [props.documentId, props.initialData, props.readOnly],
  () => {
    initializeEditor();
  }
);

onMounted(() => {
  initializeEditor();
});

onUnmounted(() => {
  destroyEditor();
});
</script>

<style>
/** Adding global style for our custom node class here, but more commonly you'd place this in your main style.css */
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

<style scoped>
.editor-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.document-editor {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
}

.toolbar {
  flex: 0 0 auto;
  border-bottom: 1px solid #eee;
  min-height: 40px; /* Ensure toolbar has minimum height */
}

.editor {
  flex: 1 1 auto;
  overflow: auto;
  margin-top: 10px;
  min-height: 400px; /* Ensure editor has minimum height */
}
</style>