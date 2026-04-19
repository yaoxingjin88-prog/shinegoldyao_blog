<!--
  无障碍辅助组件 AppA11yWidget
  ====================================================================
  功能：
    1. 字体大小缩放（100% / 115% / 130% / 150%）
    2. 高对比度模式（黑底黄字，视障友好）
    3. 护眼模式（柔和的米黄滤镜）
    4. 减少动效（关闭动画，尊重 prefers-reduced-motion）
    5. 阅读链接高亮（所有链接加下划线 + 背景色）
    6. 配置持久化到 localStorage
  设计原则：遵循 WCAG 2.1 AA 标准
  ====================================================================
-->
<template>
  <ClientOnly>
    <div class="a11y-widget">
      <!-- 触发按钮：轮椅图标（国际通用无障碍标识） -->
      <button
        class="a11y-trigger"
        :class="{ active: isOpen }"
        :aria-label="isOpen ? '关闭无障碍工具' : '打开无障碍工具'"
        :aria-expanded="isOpen"
        @click="isOpen = !isOpen"
      >
        <Accessibility class="w-5 h-5" />
      </button>

      <!-- 面板 -->
      <Transition name="panel">
        <div v-if="isOpen" class="a11y-panel" role="dialog" aria-label="无障碍工具面板">
          <div class="panel-header">
            <div class="flex items-center gap-2">
              <Accessibility class="w-4 h-4 text-blue-500" />
              <h3 class="text-sm font-bold text-gray-800 dark:text-gray-100">无障碍辅助</h3>
            </div>
            <button class="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800" @click="isOpen = false" aria-label="关闭">
              <X class="w-4 h-4 text-gray-500" />
            </button>
          </div>

          <div class="panel-body">
            <!-- 字体大小 -->
            <div class="a11y-group">
              <div class="a11y-label">
                <Type class="w-3.5 h-3.5" />
                <span>字体大小</span>
                <span class="ml-auto text-xs text-gray-400">{{ fontSize }}%</span>
              </div>
              <div class="font-size-row">
                <button
                  v-for="opt in fontSizeOptions"
                  :key="opt.value"
                  class="font-size-btn"
                  :class="{ active: fontSize === opt.value }"
                  :style="{ fontSize: opt.fontSize }"
                  @click="setFontSize(opt.value)"
                  :aria-pressed="fontSize === opt.value"
                >
                  A
                </button>
              </div>
            </div>

            <!-- 高对比度 -->
            <div class="a11y-group">
              <label class="a11y-switch">
                <div class="switch-label">
                  <Contrast class="w-3.5 h-3.5" />
                  <div>
                    <div class="text-sm font-medium">高对比度</div>
                    <div class="text-xs text-gray-500">黑底黄字，视障友好</div>
                  </div>
                </div>
                <input type="checkbox" v-model="highContrast" class="sr-only" />
                <span class="switch-slider" :class="{ on: highContrast }">
                  <span class="switch-dot" />
                </span>
              </label>
            </div>

            <!-- 护眼模式 -->
            <div class="a11y-group">
              <label class="a11y-switch">
                <div class="switch-label">
                  <Eye class="w-3.5 h-3.5" />
                  <div>
                    <div class="text-sm font-medium">护眼模式</div>
                    <div class="text-xs text-gray-500">柔和米黄滤镜</div>
                  </div>
                </div>
                <input type="checkbox" v-model="sepiaMode" class="sr-only" />
                <span class="switch-slider" :class="{ on: sepiaMode }">
                  <span class="switch-dot" />
                </span>
              </label>
            </div>

            <!-- 减少动效 -->
            <div class="a11y-group">
              <label class="a11y-switch">
                <div class="switch-label">
                  <Zap class="w-3.5 h-3.5" />
                  <div>
                    <div class="text-sm font-medium">减少动效</div>
                    <div class="text-xs text-gray-500">关闭动画过渡</div>
                  </div>
                </div>
                <input type="checkbox" v-model="reduceMotion" class="sr-only" />
                <span class="switch-slider" :class="{ on: reduceMotion }">
                  <span class="switch-dot" />
                </span>
              </label>
            </div>

            <!-- 链接高亮 -->
            <div class="a11y-group">
              <label class="a11y-switch">
                <div class="switch-label">
                  <Link2 class="w-3.5 h-3.5" />
                  <div>
                    <div class="text-sm font-medium">强调链接</div>
                    <div class="text-xs text-gray-500">链接添加背景 + 下划线</div>
                  </div>
                </div>
                <input type="checkbox" v-model="emphasizeLinks" class="sr-only" />
                <span class="switch-slider" :class="{ on: emphasizeLinks }">
                  <span class="switch-dot" />
                </span>
              </label>
            </div>
          </div>

          <div class="panel-footer">
            <button class="reset-btn" @click="reset">
              <RotateCcw class="w-3.5 h-3.5" />
              恢复默认
            </button>
            <div class="text-[10px] text-gray-400">遵循 WCAG 2.1 AA 标准</div>
          </div>
        </div>
      </Transition>
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { Accessibility, X, Type, Contrast, Eye, Zap, Link2, RotateCcw } from 'lucide-vue-next'

const STORAGE_KEY = 'a11y-prefs'

const isOpen = ref(false)
const fontSize = ref(100)
const highContrast = ref(false)
const sepiaMode = ref(false)
const reduceMotion = ref(false)
const emphasizeLinks = ref(false)

const fontSizeOptions = [
  { value: 100, fontSize: '12px', label: '标准' },
  { value: 115, fontSize: '14px', label: '较大' },
  { value: 130, fontSize: '16px', label: '大' },
  { value: 150, fontSize: '18px', label: '特大' },
]

function setFontSize(v: number) {
  fontSize.value = v
}

function reset() {
  fontSize.value = 100
  highContrast.value = false
  sepiaMode.value = false
  reduceMotion.value = false
  emphasizeLinks.value = false
}

/** 把所有偏好同步到 <html> 的 class 与 CSS 变量 */
function applyPrefs() {
  if (typeof document === 'undefined') return
  const html = document.documentElement
  // 字体缩放：通过 CSS 变量 + 根字号调整
  html.style.setProperty('--a11y-font-scale', String(fontSize.value / 100))
  html.classList.toggle('a11y-scale', fontSize.value !== 100)
  html.classList.toggle('a11y-high-contrast', highContrast.value)
  html.classList.toggle('a11y-sepia', sepiaMode.value)
  html.classList.toggle('a11y-reduce-motion', reduceMotion.value)
  html.classList.toggle('a11y-emphasize-links', emphasizeLinks.value)
}

/** 持久化 */
function savePrefs() {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      fontSize: fontSize.value,
      highContrast: highContrast.value,
      sepiaMode: sepiaMode.value,
      reduceMotion: reduceMotion.value,
      emphasizeLinks: emphasizeLinks.value,
    }),
  )
}

onMounted(() => {
  // 恢复配置
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const p = JSON.parse(raw)
      fontSize.value = p.fontSize ?? 100
      highContrast.value = !!p.highContrast
      sepiaMode.value = !!p.sepiaMode
      reduceMotion.value = !!p.reduceMotion
      emphasizeLinks.value = !!p.emphasizeLinks
    } else if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      // 尊重系统 "减少动效" 偏好
      reduceMotion.value = true
    }
  } catch {}
  applyPrefs()
})

watch([fontSize, highContrast, sepiaMode, reduceMotion, emphasizeLinks], () => {
  applyPrefs()
  savePrefs()
})
</script>

<style scoped>
.a11y-widget {
  position: fixed;
  left: 16px;
  bottom: 16px;
  z-index: 55;
}
@media (min-width: 640px) {
  .a11y-widget {
    left: 24px;
    bottom: 24px;
  }
}

.a11y-trigger {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6, #6366f1);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 30px -8px rgba(59, 130, 246, 0.5);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  border: none;
  cursor: pointer;
}
.a11y-trigger:hover {
  transform: scale(1.08);
  box-shadow: 0 14px 36px -8px rgba(59, 130, 246, 0.65);
}
.a11y-trigger.active {
  transform: rotate(15deg);
}

.a11y-panel {
  position: absolute;
  left: 0;
  bottom: calc(100% + 12px);
  width: 320px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  box-shadow: 0 20px 40px -12px rgba(0, 0, 0, 0.15);
  overflow: hidden;
}
:global(.dark) .a11y-panel {
  background: #111827;
  border-color: #1f2937;
  color: #f3f4f6;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  border-bottom: 1px solid #f3f4f6;
}
:global(.dark) .panel-header { border-color: #1f2937; }

.panel-body {
  padding: 8px 14px 4px;
  max-height: 60vh;
  overflow-y: auto;
}

.a11y-group {
  padding: 10px 0;
  border-bottom: 1px dashed #f3f4f6;
}
.a11y-group:last-child { border-bottom: none; }
:global(.dark) .a11y-group { border-color: #1f2937; }

.a11y-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 8px;
}

.font-size-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;
}
.font-size-btn {
  padding: 6px 0;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  background: #f9fafb;
  color: #4b5563;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}
.font-size-btn:hover {
  border-color: #3b82f6;
  color: #3b82f6;
}
.font-size-btn.active {
  background: linear-gradient(135deg, #3b82f6, #6366f1);
  color: #fff;
  border-color: transparent;
  box-shadow: 0 4px 12px -2px rgba(59, 130, 246, 0.4);
}
:global(.dark) .font-size-btn {
  background: #1f2937;
  border-color: #374151;
  color: #d1d5db;
}

.a11y-switch {
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  gap: 12px;
}
.switch-label {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #374151;
}
:global(.dark) .switch-label { color: #e5e7eb; }

.switch-slider {
  width: 38px;
  height: 22px;
  border-radius: 999px;
  background: #d1d5db;
  position: relative;
  transition: background 0.2s ease;
  flex-shrink: 0;
}
.switch-slider.on {
  background: linear-gradient(135deg, #3b82f6, #6366f1);
}
.switch-dot {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #fff;
  transition: transform 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
.switch-slider.on .switch-dot {
  transform: translateX(16px);
}

.panel-footer {
  padding: 10px 14px;
  border-top: 1px solid #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #f9fafb;
}
:global(.dark) .panel-footer {
  border-color: #1f2937;
  background: #0f172a;
}

.reset-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  background: #fff;
  color: #4b5563;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.15s ease;
}
.reset-btn:hover {
  border-color: #ef4444;
  color: #ef4444;
}
:global(.dark) .reset-btn {
  background: #1f2937;
  border-color: #374151;
  color: #d1d5db;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* Transition */
.panel-enter-active, .panel-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.panel-enter-from, .panel-leave-to {
  opacity: 0;
  transform: translateY(8px) scale(0.96);
}
</style>
