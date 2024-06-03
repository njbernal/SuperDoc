<script>
import '@harbour-enterprises/superdoc/style.css';
import { v4 as uuidv4 } from 'uuid';
import Superdoc from '@harbour-enterprises/superdoc';

export default {
  props: {
    config: {
      type: Object,
      required: true,
    }
  },
  emits: ['comments-update'],
  data() {
    return {
      elementId: `superdoc-${uuidv4()}`,
      superdoc: null,
      modules: {},
    }
  },
  methods: {
    initializeSuperDoc() {
      const config = this.config;
      this.modules = config.modules;

      config.selector = `#${this.elementId}`;
      this.superdoc = new Superdoc(config);
      this.attachEventHandlers();
    },
    attachCommentsEventHandlers() {
      this.superdoc.on('comments-update', (eventType, comment) => emit('comments-update', eventType, comment));
    },
    attachEventHandlers() {
      const modules = Object.keys(this.modules);

      // Attach event handlers for each module
      modules.forEach((m) => {
        if (m in this.moduleEventHandlers) this.moduleEventHandlers[m]();
      })
    }
  },
  computed: {
    moduleEventHandlers() {
      return {
        comments: this.attachCommentsEventHandlers,
      }
    }
  },
  mounted() {
    this.initializeSuperDoc();
  },
};
</script>

<template>
  <div :id="elementId"></div>
</template>
