<script setup>
import { storeToRefs } from 'pinia';
import { ref, onMounted, computed } from 'vue';
import { useHrbrFieldsStore } from '@/stores/hrbr-fields-store';
import { useSuperdocStore } from '@/stores/superdoc-store';

const superdocStore = useSuperdocStore();
const hrbrFieldsStore = useHrbrFieldsStore();
const { getAnnotations } = storeToRefs(hrbrFieldsStore);
const { fieldComponentsMap, getField } = hrbrFieldsStore;

const props = defineProps({
  fields: {
    type: Object,
    required: true,
  },
});

const getStyle = computed(() => (entry) => {
  const { coordinates, field } = entry;
  return {
    position: 'absolute',
    field,
    ...coordinates,
  }
});

const getAnnotationWithField = computed(() => {
  const annotationsWithFields = [];

  getAnnotations.value.forEach((annotation) => {
    const field = getField(annotation.documentId, annotation.fieldId);
    if (!field) return;
    annotationsWithFields.push({ ...annotation, field });
  });

  return annotationsWithFields;
});

</script>

<template>
  <div>
    <div v-for="entry in getAnnotationWithField" :style="getStyle(entry)">
      <component
          class="field-container"
          :is="fieldComponentsMap[entry.field.fieldType]"
          :field="entry.field"
          :style-override="entry.style"
          :option-id="entry.originalAnnotationId"
          :is-editing="false" />
    </div>
  </div>
</template>

<style scoped>
.field-container {
  border-radius: 2px;
  background-color: #EFD0F0;
  border: 2px solid #B015B3;
}
</style>