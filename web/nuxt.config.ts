export default defineNuxtConfig({
  devtools: { enabled: false },
  modules: ['@nuxtjs/tailwindcss', '@nuxtjs/color-mode', '@nuxt/image', '@nuxtjs/i18n'],
  i18n: {
    locales: [
      { code: 'zh', name: '中文', file: 'zh.json' },
      { code: 'en', name: 'English', file: 'en.json' },
    ],
    defaultLocale: 'zh',
    lazy: true,
    langDir: 'locales/',
    strategy: 'no_prefix',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_locale',
      fallbackLocale: 'zh',
    },
  },
  colorMode: { classSuffix: '', preference: 'dark', fallback: 'dark' },
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:3000/api',
    },
  },
  site: {
    url: process.env.NUXT_PUBLIC_SITE_URL || 'https://shinegoldyao.store',
  },
  app: {
    head: {
      title: '姚兴金 - ShineGoldYao 个人技术博客',
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
      htmlAttrs: { lang: 'zh-CN' },
      meta: [
        { name: 'description', content: '姚兴金（ShineGoldYao）的个人技术博客，专注于全栈开发、前端工程化、后端架构与开源项目分享。' },
        { name: 'keywords', content: '姚兴金,ShineGoldYao,个人技术博客,全栈开发,前端开发,后端开发,Vue,React,NestJS,Nuxt' },
        { name: 'author', content: '姚兴金 (ShineGoldYao)' },
        { name: 'robots', content: 'index, follow' },
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: '姚兴金的个人技术博客' },
        { property: 'og:locale', content: 'zh_CN' },
        { name: 'twitter:card', content: 'summary_large_image' },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
      ],
    },
  },
  tailwindcss: { cssPath: '~/assets/css/main.css' },
  image: { quality: 80 },
  compatibilityDate: '2024-04-03',
  experimental: {
    payloadExtraction: true,
  },
  nitro: {
    compressPublicAssets: { gzip: true, brotli: true },
  },
  vite: {
    build: {
      rollupOptions: {
        output: {
          manualChunks(id: string) {
            if (id.includes('highlight.js')) return 'hljs'
            if (id.includes('marked')) return 'marked'
            if (id.includes('lucide-vue-next')) return 'icons'
            if (id.includes('vue-i18n') || id.includes('@intlify')) return 'i18n'
          },
        },
      },
    },
  },
})
