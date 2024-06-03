<script setup>
import VueWrapper from './components/VueWrapper.vue'
</script>

<template>
  <div class="dev-page">
    <VueWrapper
        :config="config"    />
  </div>
</template>

<style scoped>
.dev-page {
  background-color: #3A3A3A;
  width: 100%;
  height: 100%;
}
</style>
