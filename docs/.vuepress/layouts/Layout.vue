<script setup>
import ParentLayout from '@vuepress/theme-default/layouts/Layout.vue';

const currentYear = new Date().getUTCFullYear();
</script>

<template>
  <ParentLayout>
    <template #page-bottom>
      <div class="docs-footer">
        <p>© {{ currentYear }} <a href="https://harbourshare.com/" target="_blank">Harbour Enterprises Inc.</a> | Licensed under <a href="/license">AGPL-3.0</a></p>
      </div>
    </template>
  </ParentLayout>
</template>

<style lang="css">
.docs-footer {
  text-align: center;
}
</style>