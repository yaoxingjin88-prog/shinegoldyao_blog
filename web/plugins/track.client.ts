export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()
  const baseURL = config.public.apiBase as string

  function sendTrack(path: string, title: string) {
    const payload = JSON.stringify({
      path,
      title,
      userAgent: navigator.userAgent,
    })
    // 优先用 sendBeacon（页面关闭也能送达），回退到 fetch keepalive
    if (navigator.sendBeacon) {
      const blob = new Blob([payload], { type: 'application/json' })
      navigator.sendBeacon(baseURL + '/track', blob)
    } else {
      $fetch(baseURL + '/track', {
        method: 'POST',
        body: payload,
        headers: { 'Content-Type': 'application/json' },
        keepalive: true,
      }).catch(() => {})
    }
  }

  const router = useRouter()

  // 首次加载
  router.isReady().then(() => {
    sendTrack(router.currentRoute.value.fullPath, document.title)
  })

  // 路由变化
  router.afterEach((to) => {
    // 用 nextTick 确保标题已更新
    nextTick(() => {
      sendTrack(to.fullPath, document.title)
    })
  })
})
