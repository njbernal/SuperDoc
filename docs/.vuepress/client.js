import { defineClientConfig } from 'vuepress/client'
import Layout from './layouts/Layout.vue'

/**
 * Used to customize the theme. ie: Adding our footer.
 */
export default defineClientConfig({
  layouts: {
    Layout,
  },
})