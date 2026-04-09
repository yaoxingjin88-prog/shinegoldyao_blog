export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()
  const baseURL = config.public.apiBase as string

  function sendTrack(path: string, title: string) {
    try {
      $fetch(baseURL + '/track', {
        method: 'POST',
        body: {
          path,
          title,
          userAgent: navigator.userAgent,
        },
      }).catch(() => {})
    } catch {
      // 静默失败，不影响用户体验
    }
  }

  const router = useRouter()

  // 首次加载
  router.isReady().then(() => {
    sendTrack(router.currentRoute.value.fullPath, document.title)
  })

  // 路由变化
  router.afterEach((to) => {
    setTimeout(() => {
      sendTrack(to.fullPath, document.title)
    }, 100)
  })
})
