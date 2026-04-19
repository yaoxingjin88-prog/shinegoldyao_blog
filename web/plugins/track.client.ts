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

  // ====== 点击热力图埋点（批量上报）======
  interface ClickPoint { x: number; y: number; w: number; h: number; tag?: string }
  let buffer: ClickPoint[] = []
  let flushTimer: any = null
  let currentPath = router.currentRoute.value.fullPath

  router.afterEach((to) => {
    // 路由切换前先把当前 buffer 冲一次
    flushClicks()
    currentPath = to.fullPath
  })

  function flushClicks() {
    if (!buffer.length) return
    const payload = JSON.stringify({ path: currentPath, clicks: buffer.slice(0, 50) })
    buffer = []
    if (navigator.sendBeacon) {
      const blob = new Blob([payload], { type: 'application/json' })
      navigator.sendBeacon(baseURL + '/track/click', blob)
    } else {
      $fetch(baseURL + '/track/click', {
        method: 'POST',
        body: payload,
        headers: { 'Content-Type': 'application/json' },
        keepalive: true,
      }).catch(() => {})
    }
  }

  function scheduleFlush() {
    if (flushTimer) return
    flushTimer = setTimeout(() => {
      flushTimer = null
      flushClicks()
    }, 3000)
  }

  // ====== Rage Click 检测：1.2s 内同一半径 40px 区域连续 ≥4 次点击 ======
  interface RageRecord { x: number; y: number; t: number }
  let rageWindow: RageRecord[] = []
  let lastRageReportAt = 0
  const RAGE_WINDOW_MS = 1200
  const RAGE_RADIUS_PX = 40
  const RAGE_THRESHOLD = 4
  const RAGE_COOLDOWN_MS = 10_000

  function reportRageClick(path: string, count: number, x: number, y: number, tag: string) {
    const payload = JSON.stringify({ path, count, x, y, tag })
    if (navigator.sendBeacon) {
      const blob = new Blob([payload], { type: 'application/json' })
      navigator.sendBeacon(baseURL + '/track/rage-click', blob)
    } else {
      $fetch(baseURL + '/track/rage-click', {
        method: 'POST',
        body: payload,
        headers: { 'Content-Type': 'application/json' },
        keepalive: true,
      }).catch(() => {})
    }
  }

  function detectRageClick(e: MouseEvent, tag: string) {
    const now = Date.now()
    // 清理过期窗口
    rageWindow = rageWindow.filter((r) => now - r.t <= RAGE_WINDOW_MS)
    rageWindow.push({ x: e.clientX, y: e.clientY, t: now })
    // 统计同一半径内的点击数
    const cluster = rageWindow.filter((r) => {
      const dx = r.x - e.clientX
      const dy = r.y - e.clientY
      return dx * dx + dy * dy <= RAGE_RADIUS_PX * RAGE_RADIUS_PX
    })
    if (cluster.length >= RAGE_THRESHOLD && now - lastRageReportAt > RAGE_COOLDOWN_MS) {
      lastRageReportAt = now
      const vw = window.innerWidth || 1
      const vh = window.innerHeight || 1
      reportRageClick(
        currentPath,
        cluster.length,
        Math.max(0, Math.min(1, e.clientX / vw)),
        Math.max(0, Math.min(1, e.clientY / vh)),
        tag,
      )
      rageWindow = []
    }
  }

  document.addEventListener('click', (e: MouseEvent) => {
    // 排除非左键、合成事件
    if (e.button !== 0) return
    const vw = window.innerWidth
    const vh = window.innerHeight
    if (!vw || !vh) return
    const target = e.target as HTMLElement | null
    const tag = target?.tagName?.toLowerCase() || ''
    buffer.push({
      x: Math.max(0, Math.min(1, e.clientX / vw)),
      y: Math.max(0, Math.min(1, e.clientY / vh)),
      w: vw,
      h: vh,
      tag,
    })
    if (buffer.length >= 20) flushClicks()
    else scheduleFlush()
    // 愤怒点击检测
    detectRageClick(e, tag)
  }, { passive: true })

  // 页面卸载兜底
  window.addEventListener('beforeunload', flushClicks)
  window.addEventListener('pagehide', flushClicks)
})
