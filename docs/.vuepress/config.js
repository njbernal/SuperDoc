import { viteBundler } from '@vuepress/bundler-vite'
import { defaultTheme } from '@vuepress/theme-default'
import { defineUserConfig } from 'vuepress'

export default defineUserConfig({
  base: '/SuperDoc/',
  bundler: viteBundler(),
  theme: defaultTheme({}),

  lang: 'en-US',
  title: 'SuperDoc',
  description: 'The modern collaborative document editor for the web',
})
