<template>
  <Transition name="pwa-slide">
    <div v-if="showBanner" class="pwa-install-banner">
      <div class="pwa-install-content">
        <div class="pwa-install-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36">
            <defs>
              <linearGradient id="pg" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#3b82f6" />
                <stop offset="100%" style="stop-color:#38bdf8" />
              </linearGradient>
            </defs>
            <rect width="36" height="36" rx="8" fill="#0f172a" />
            <path
              d="M18 5C18.6 13.5 22.5 17.4 31 18C22.5 18.6 18.6 22.5 18 31C17.4 22.5 13.5 18.6 5 18C13.5 17.4 17.4 13.5 18 5Z"
              fill="url(#pg)"
            />
          </svg>
        </div>
        <div class="pwa-install-text">
          <p class="pwa-install-title">添加到主屏幕</p>
          <p class="pwa-install-desc">
            <template v-if="isIosSafari()">点击 Safari 底部分享按钮，选择「添加到主屏幕」</template>
            <template v-else>安装为 App，离线也能阅读文章</template>
          </p>
        </div>
      </div>
      <div class="pwa-install-actions">
        <button v-if="deferredPrompt" class="pwa-btn pwa-btn-install" @click="handleInstall">安装</button>
        <button v-else-if="isIosSafari()" class="pwa-btn pwa-btn-install" @click="handleDismiss">知道了</button>
        <button class="pwa-btn pwa-btn-dismiss" @click="handleDismiss">以后再说</button>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'

const showBanner = ref(false)
let deferredPrompt: any = null

/** 检测是否是 iOS Safari（不支持 beforeinstallprompt） */
function isIosSafari() {
  const ua = navigator.userAgent
  return /iPad|iPhone|iPod/.test(ua) && /Safari/.test(ua) && !/CriOS/.test(ua)
}

/** 检测是否已经以 standalone 模式运行（已安装） */
function isStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches
    || (navigator as any).standalone === true
}

function onBeforeInstall(e: Event) {
  e.preventDefault()
  deferredPrompt = e
  // 如果用户 7 天内关闭过，不再弹出
  const dismissed = localStorage.getItem('pwa_dismissed')
  if (dismissed && Date.now() - Number(dismissed) < 7 * 24 * 60 * 60 * 1000) return
  showBanner.value = true
}

async function handleInstall() {
  if (!deferredPrompt) return
  deferredPrompt.prompt()
  const { outcome } = await deferredPrompt.userChoice
  if (outcome === 'accepted') {
    showBanner.value = false
  }
  deferredPrompt = null
}

function handleDismiss() {
  showBanner.value = false
  localStorage.setItem('pwa_dismissed', String(Date.now()))
}

onMounted(() => {
  // 已安装则不显示
  if (isStandalone()) return

  // Android/Chrome：监听 beforeinstallprompt
  window.addEventListener('beforeinstallprompt', onBeforeInstall)

  // iOS Safari：不支持 beforeinstallprompt，直接显示引导
  if (isIosSafari()) {
    const dismissed = localStorage.getItem('pwa_dismissed')
    if (!dismissed || Date.now() - Number(dismissed) > 7 * 24 * 60 * 60 * 1000) {
      showBanner.value = true
    }
  }

  window.addEventListener('appinstalled', () => {
    showBanner.value = false
    deferredPrompt = null
  })
})

onBeforeUnmount(() => {
  window.removeEventListener('beforeinstallprompt', onBeforeInstall)
})
</script>

<style scoped>
.pwa-install-banner {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 20px;
  background: rgba(15, 23, 42, 0.95);
  backdrop-filter: blur(12px);
  border-top: 1px solid rgba(59, 130, 246, 0.3);
  box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.3);
}

.pwa-install-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.pwa-install-icon {
  flex-shrink: 0;
}

.pwa-install-title {
  font-size: 15px;
  font-weight: 600;
  color: #f1f5f9;
  margin: 0;
}

.pwa-install-desc {
  font-size: 12px;
  color: #94a3b8;
  margin: 2px 0 0;
}

.pwa-install-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.pwa-btn {
  padding: 8px 18px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
  white-space: nowrap;
}

.pwa-btn-install {
  background: linear-gradient(135deg, #3b82f6, #38bdf8);
  color: #fff;
}
.pwa-btn-install:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

.pwa-btn-dismiss {
  background: transparent;
  color: #94a3b8;
  border: 1px solid #334155;
}
.pwa-btn-dismiss:hover {
  color: #f1f5f9;
  border-color: #64748b;
}

/* Transition */
.pwa-slide-enter-active,
.pwa-slide-leave-active {
  transition: transform 0.35s ease, opacity 0.35s ease;
}
.pwa-slide-enter-from,
.pwa-slide-leave-to {
  transform: translateY(100%);
  opacity: 0;
}

@media (max-width: 480px) {
  .pwa-install-banner {
    flex-direction: column;
    padding: 16px;
    gap: 12px;
  }
  .pwa-install-actions {
    width: 100%;
  }
  .pwa-btn {
    flex: 1;
    text-align: center;
  }
}
</style>
