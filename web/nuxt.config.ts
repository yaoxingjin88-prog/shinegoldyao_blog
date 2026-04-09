export default defineNuxtConfig({
  devtools: { enabled: false },
  modules: ['@nuxtjs/tailwindcss', '@nuxtjs/color-mode', '@nuxt/image'],
  colorMode: { classSuffix: '', preference: 'dark', fallback: 'dark' },
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:3000/api',
    },
  },
  app: {
    head: {
      title: 'DevVoyage - 个人技术博客',
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
      meta: [
        { name: 'description', content: '专注于前沿技术分享与开源项目展示的个人技术博客' },
        { name: 'keywords', content: 'DevVoyage,技术博客,全栈开发,前端,后端' },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
      ],
    },
  },
  tailwindcss: { cssPath: '~/assets/css/main.css' },
  image: { quality: 80 },
  compatibilityDate: '2024-04-03',
})
