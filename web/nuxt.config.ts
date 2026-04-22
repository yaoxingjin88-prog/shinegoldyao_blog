export default defineNuxtConfig({
  devtools: { enabled: false },
  modules: ['@nuxtjs/tailwindcss', '@nuxtjs/color-mode', '@nuxt/image', '@nuxtjs/i18n', '@vite-pwa/nuxt'],
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
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
        { name: 'apple-mobile-web-app-title', content: 'ShineGoldYao' },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'apple-touch-icon', href: '/pwa-192x192.png' },
      ],
    },
  },
  // ─── PWA 渐进式 Web 应用 ───
  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: '姚兴金 - ShineGoldYao 技术博客',
      short_name: 'ShineGoldYao',
      description: '姚兴金的个人技术博客，专注全栈开发、前端工程化与开源项目分享',
      theme_color: '#0f172a',
      background_color: '#0f172a',
      display: 'standalone',
      orientation: 'portrait',
      scope: '/',
      start_url: '/',
      lang: 'zh-CN',
      icons: [
        {
          src: '/pwa-192x192.png',
          sizes: '192x192',
          type: 'image/png',
        },
        {
          src: '/pwa-512x512.png',
          sizes: '512x512',
          type: 'image/png',
        },
        {
          src: '/pwa-maskable-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'maskable',
        },
      ],
    },
    workbox: {
      // 预缓存：导航页面
      navigateFallback: '/',
      // 运行时缓存策略
      runtimeCaching: [
        {
          // API 请求：NetworkFirst（优先拿最新数据，离线时回退缓存）
          urlPattern: /^\/api\/.*/i,
          handler: 'NetworkFirst',
          options: {
            cacheName: 'api-cache',
            expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 },
            cacheableResponse: { statuses: [0, 200] },
          },
        },
        {
          // 文章页面：StaleWhileRevalidate（先用缓存立刻展示，后台更新）
          urlPattern: /\/articles\/.*/i,
          handler: 'StaleWhileRevalidate',
          options: {
            cacheName: 'article-pages',
            expiration: { maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 7 },
            cacheableResponse: { statuses: [0, 200] },
          },
        },
        {
          // 静态资源（JS/CSS/字体）：CacheFirst（离线可用）
          urlPattern: /\.(?:js|css|woff2?|ttf|eot)$/i,
          handler: 'CacheFirst',
          options: {
            cacheName: 'static-assets',
            expiration: { maxEntries: 80, maxAgeSeconds: 60 * 60 * 24 * 30 },
            cacheableResponse: { statuses: [0, 200] },
          },
        },
        {
          // 图片：CacheFirst（大幅减少流量）
          urlPattern: /\.(?:png|jpg|jpeg|gif|svg|webp|avif|ico)$/i,
          handler: 'CacheFirst',
          options: {
            cacheName: 'image-cache',
            expiration: { maxEntries: 120, maxAgeSeconds: 60 * 60 * 24 * 30 },
            cacheableResponse: { statuses: [0, 200] },
          },
        },
      ],
    },
    // 开发环境也启用 PWA 以便调试
    devOptions: {
      enabled: true,
      type: 'module',
    },
    client: {
      installPrompt: true,
    },
  },
  tailwindcss: { cssPath: '~/assets/css/main.css' },
  image: {
    quality: 80,
    format: ['avif', 'webp'],
    domains: ['gitee.com', 'shinegoldyao.store'],
    screens: { xs: 320, sm: 640, md: 768, lg: 1024, xl: 1280, xxl: 1536 },
  },
  compatibilityDate: '2024-04-03',
  nitro: {
    compressPublicAssets: { gzip: true, brotli: true },
  },
  // 路由级缓存策略（SWR 由 Nitro 统一处理，支持 Node/Vercel/Cloudflare 等部署）
  routeRules: {
    '/': { swr: 60 },
    '/articles': { swr: 60 },
    '/articles/**': { swr: 300 },
    '/projects': { swr: 300 },
    '/tools': { swr: 300 },
    '/about': { swr: 600 },
    '/login': { ssr: false },
    '/graph': { ssr: false },
  },
  vite: {
    build: {
      rollupOptions: {
        output: {
          // 只对首页/大多数路由都不用的"icons/i18n"做分包；
          // hljs 走动态 import 自然分包；marked 仅文章页用，交给路由级 chunk 即可
          manualChunks(id: string) {
            if (id.includes('lucide-vue-next')) return 'icons'
            if (id.includes('vue-i18n') || id.includes('@intlify')) return 'i18n'
          },
        },
      },
    },
  },
})
