import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { io, Socket } from 'socket.io-client'
import { ElNotification } from 'element-plus'
import { useAuthStore } from './auth'

/**
 * 管理端 WebSocket 通知中心
 *
 * - 基于 socket.io-client 连接 NestJS /admin 命名空间
 * - 登录时自动建连，注销/失效时自动断开
 * - 收到的事件统一追加到 notifications 列表，弹出右上角 Toast
 * - 支持批量清空、未读计数、最多缓存 N 条
 */

export interface AdminNotification {
  id: string
  type: 'visit' | 'like' | 'comment' | 'message' | 'rage_click' | 'article_published' | string
  title: string
  content: string
  level: 'info' | 'success' | 'warning' | 'danger'
  meta?: Record<string, any>
  time: number
  read: boolean
}

const MAX_CACHE = 50

// 从 VITE_API_BASE_URL 推导 WebSocket 地址：去掉末尾 /api
function getWsBase() {
  const api = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'
  return api.replace(/\/api\/?$/, '')
}

export const useNotificationStore = defineStore('notifications', () => {
  const notifications = ref<AdminNotification[]>([])
  const connected = ref(false)
  const panelOpen = ref(false)
  let socket: Socket | null = null
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null

  const unreadCount = computed(() => notifications.value.filter((n) => !n.read).length)

  function connect() {
    const auth = useAuthStore()
    if (!auth.accessToken) return
    if (socket?.connected) return

    const url = `${getWsBase()}/admin`
    socket = io(url, {
      auth: { token: auth.accessToken },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 2000,
      reconnectionDelayMax: 10000,
    })

    socket.on('connect', () => {
      connected.value = true
      // eslint-disable-next-line no-console
      console.log('[WS] admin connected', socket?.id)
    })

    socket.on('disconnect', () => {
      connected.value = false
    })

    socket.on('unauthorized', (payload: any) => {
      // eslint-disable-next-line no-console
      console.warn('[WS] unauthorized', payload)
      ElNotification({
        title: '实时通道鉴权失败',
        message: payload?.message || '请重新登录',
        type: 'warning',
        duration: 4000,
      })
      disconnect()
    })

    socket.on('notify', (payload: Omit<AdminNotification, 'read'>) => {
      pushNotification(payload)
    })
  }

  function disconnect() {
    if (reconnectTimer) {
      clearTimeout(reconnectTimer)
      reconnectTimer = null
    }
    if (socket) {
      socket.removeAllListeners()
      socket.disconnect()
      socket = null
    }
    connected.value = false
  }

  function pushNotification(payload: Omit<AdminNotification, 'read'>) {
    const item: AdminNotification = { ...payload, read: false }
    notifications.value.unshift(item)
    if (notifications.value.length > MAX_CACHE) {
      notifications.value.length = MAX_CACHE
    }

    // 右上角 Toast 弹窗（除 visit 外避免刷屏，visit 使用更短时长）
    const duration = item.type === 'visit' ? 2500 : 4500
    ElNotification({
      title: item.title,
      message: item.content,
      type:
        item.level === 'danger'
          ? 'error'
          : item.level === 'success'
            ? 'success'
            : item.level === 'warning'
              ? 'warning'
              : 'info',
      duration,
      position: 'top-right',
    })

    // 可选：播放轻量提示音（非 visit 事件）
    if (item.type !== 'visit') {
      tryPlayBeep()
    }
  }

  function markAllRead() {
    notifications.value.forEach((n) => (n.read = true))
  }

  function clear() {
    notifications.value = []
  }

  function togglePanel(v?: boolean) {
    panelOpen.value = typeof v === 'boolean' ? v : !panelOpen.value
    if (panelOpen.value) markAllRead()
  }

  // 登录态变化自动连/断
  const auth = useAuthStore()
  watch(
    () => auth.isLoggedIn,
    (v) => {
      if (v) connect()
      else disconnect()
    },
    { immediate: true },
  )

  return {
    notifications,
    connected,
    panelOpen,
    unreadCount,
    connect,
    disconnect,
    markAllRead,
    clear,
    togglePanel,
  }
})

/** 极简蜂鸣提示音：Web Audio API 合成，无需额外资源 */
let audioCtx: AudioContext | null = null
function tryPlayBeep() {
  try {
    audioCtx = audioCtx || new (window.AudioContext || (window as any).webkitAudioContext)()
    const ctx = audioCtx
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.type = 'sine'
    osc.frequency.setValueAtTime(880, ctx.currentTime)
    gain.gain.setValueAtTime(0, ctx.currentTime)
    gain.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.25)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.26)
  } catch {
    /* noop */
  }
}
