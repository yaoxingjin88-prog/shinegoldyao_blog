<template>
  <el-popover
    :visible="store.panelOpen"
    placement="bottom-end"
    :width="380"
    trigger="manual"
    popper-class="notify-popover"
    @hide="store.togglePanel(false)"
  >
    <template #reference>
      <div class="bell-wrap" @click="store.togglePanel()">
        <el-badge :value="store.unreadCount" :max="99" :hidden="store.unreadCount === 0" class="bell-badge">
          <el-icon :size="20" class="bell-icon" :class="{ ringing: store.unreadCount > 0 }">
            <Bell />
          </el-icon>
        </el-badge>
        <span class="status-dot" :class="{ online: store.connected }" :title="store.connected ? '实时通道已连接' : '实时通道未连接'"></span>
      </div>
    </template>

    <div class="notify-head">
      <div class="notify-title">
        <el-icon><Bell /></el-icon>
        <span>实时通知</span>
        <el-tag size="small" :type="store.connected ? 'success' : 'info'" effect="plain">
          {{ store.connected ? 'LIVE' : 'OFFLINE' }}
        </el-tag>
      </div>
      <div class="notify-actions">
        <el-button text size="small" @click="store.markAllRead()">全部已读</el-button>
        <el-button text size="small" @click="store.clear()" style="color:#ef4444">清空</el-button>
      </div>
    </div>

    <div class="notify-list" v-if="store.notifications.length">
      <div
        v-for="n in store.notifications"
        :key="n.id"
        class="notify-item clickable"
        :class="[`level-${n.level}`, { unread: !n.read }]"
        @click="handleClick(n)"
      >
        <div class="notify-icon" :class="`icon-${n.level}`">
          <el-icon v-if="n.type === 'visit'"><View /></el-icon>
          <el-icon v-else-if="n.type === 'like'"><Star /></el-icon>
          <el-icon v-else-if="n.type === 'comment'"><ChatDotRound /></el-icon>
          <el-icon v-else-if="n.type === 'message'"><Message /></el-icon>
          <el-icon v-else-if="n.type === 'rage_click'"><Warning /></el-icon>
          <el-icon v-else><Bell /></el-icon>
        </div>
        <div class="notify-main">
          <div class="notify-item-title">{{ n.title }}</div>
          <div class="notify-item-content">{{ n.content }}</div>
          <div class="notify-item-time">{{ formatTime(n.time) }}</div>
        </div>
      </div>
    </div>
    <div v-else class="notify-empty">
      <el-icon :size="36" color="#d1d5db"><BellFilled /></el-icon>
      <p>暂无通知</p>
      <span>有新访客/点赞/评论时将在这里实时推送</span>
    </div>
  </el-popover>
</template>

<script setup lang="ts">
import { Bell, BellFilled, View, Star, ChatDotRound, Message, Warning } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { useNotificationStore, type AdminNotification } from '../stores/notifications'

const store = useNotificationStore()
const router = useRouter()

/**
 * 通知点击路由映射：
 *   - visit       → /track      访问统计日志
 *   - like        → /article    文章管理列表
 *   - comment     → /article    文章管理（评论从属于文章）
 *   - message     → /message    留言管理
 *   - rage_click  → /heatmap    点击热力图分析
 * 其它类型回落到仪表盘。
 */
function resolveRoute(n: AdminNotification): string {
  switch (n.type) {
    case 'visit':
      return '/track'
    case 'like':
    case 'comment':
      return '/article'
    case 'message':
      return '/message'
    case 'rage_click':
      return '/heatmap'
    case 'article_published':
      return '/article'
    default:
      return '/dashboard'
  }
}

function handleClick(n: AdminNotification) {
  n.read = true
  const to = resolveRoute(n)
  store.togglePanel(false)
  // 避免重复导航报错
  if (router.currentRoute.value.path !== to) {
    router.push(to)
  }
}

function formatTime(ts: number) {
  const diff = Date.now() - ts
  if (diff < 60_000) return '刚刚'
  if (diff < 3600_000) return `${Math.floor(diff / 60_000)} 分钟前`
  if (diff < 86400_000) return `${Math.floor(diff / 3600_000)} 小时前`
  const d = new Date(ts)
  return `${d.getMonth() + 1}-${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

// 点击外部关闭面板
function onDocClick(e: MouseEvent) {
  if (!store.panelOpen) return
  const target = e.target as HTMLElement
  if (!target.closest('.bell-wrap') && !target.closest('.notify-popover')) {
    store.togglePanel(false)
  }
}
if (typeof document !== 'undefined') {
  document.addEventListener('click', onDocClick)
}
</script>

<style scoped>
.bell-wrap {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.2s;
}
.bell-wrap:hover { background: #f3f4f6; }
.bell-icon { color: #4b5563; }
.bell-icon.ringing {
  animation: ringing 1.4s ease-in-out infinite;
  color: #6366f1;
}
@keyframes ringing {
  0%, 100% { transform: rotate(0deg); }
  15% { transform: rotate(14deg); }
  30% { transform: rotate(-12deg); }
  45% { transform: rotate(10deg); }
  60% { transform: rotate(-8deg); }
  75% { transform: rotate(4deg); }
}
.bell-badge :deep(.el-badge__content) {
  background: #ef4444;
  border: 2px solid #fff;
  font-weight: 700;
}
.status-dot {
  position: absolute;
  bottom: 6px;
  right: 6px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #d1d5db;
  border: 1.5px solid #fff;
}
.status-dot.online {
  background: #10b981;
  box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.6);
  animation: pulse 2s infinite;
}
@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.6); }
  70% { box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); }
  100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
}

.notify-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 4px 10px;
  border-bottom: 1px solid #f3f4f6;
  margin-bottom: 8px;
}
.notify-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #1f2937;
  font-size: 14px;
}
.notify-actions { display: flex; gap: 4px; }

.notify-list {
  max-height: 420px;
  overflow-y: auto;
  padding-right: 4px;
}
.notify-list::-webkit-scrollbar { width: 4px; }
.notify-list::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 4px; }

.notify-item {
  display: flex;
  gap: 12px;
  padding: 10px 8px;
  border-radius: 10px;
  transition: background 0.2s;
  position: relative;
}
.notify-item:hover { background: #f9fafb; }
.notify-item.clickable { cursor: pointer; }
.notify-item.clickable:hover { background: #eef2ff; transform: translateX(2px); }
.notify-item.clickable { transition: background 0.2s, transform 0.2s; }
.notify-item.unread::before {
  content: '';
  position: absolute;
  left: 2px;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 28px;
  background: #6366f1;
  border-radius: 2px;
}
.notify-icon {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: #fff;
}
.icon-info { background: linear-gradient(135deg, #60a5fa, #3b82f6); }
.icon-success { background: linear-gradient(135deg, #34d399, #10b981); }
.icon-warning { background: linear-gradient(135deg, #fbbf24, #f59e0b); }
.icon-danger { background: linear-gradient(135deg, #f87171, #ef4444); }

.notify-main { flex: 1; min-width: 0; }
.notify-item-title {
  font-size: 13px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 2px;
}
.notify-item-content {
  font-size: 12px;
  color: #6b7280;
  line-height: 1.5;
  word-break: break-all;
}
.notify-item-time {
  font-size: 11px;
  color: #9ca3af;
  margin-top: 4px;
}

.notify-empty {
  padding: 30px 0;
  text-align: center;
  color: #9ca3af;
}
.notify-empty p {
  margin: 10px 0 4px;
  font-size: 14px;
  color: #6b7280;
  font-weight: 500;
}
.notify-empty span {
  font-size: 12px;
  color: #9ca3af;
}
</style>
