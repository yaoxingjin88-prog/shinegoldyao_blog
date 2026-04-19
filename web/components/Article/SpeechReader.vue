<!--
  文章语音朗读组件 ArticleSpeechReader
  ====================================================================
  基于浏览器原生 Web Speech API (SpeechSynthesis)：
    - 零依赖、免费、离线可用（系统语音合成引擎）
    - 支持暂停 / 继续 / 停止 / 语速调节 / 音色切换
    - 按段落分块朗读，解决部分浏览器（Chromium）单次朗读 15s 被截断的 BUG
    - 当前段落高亮显示（视觉定位）
  ====================================================================
  Props:
    - text: 原始文字（优先）
    - html: HTML 内容（自动提取纯文本）
  ====================================================================
-->
<template>
  <ClientOnly>
    <div v-if="supported" class="speech-reader" :class="{ collapsed: !expanded }">
      <!-- 主按钮 / 播放控制 -->
      <div class="reader-main">
        <button
          class="play-btn"
          :class="{ playing: isPlaying }"
          @click="togglePlay"
          :aria-label="isPlaying ? '暂停朗读' : '开始朗读文章'"
          :title="isPlaying ? '暂停' : '听文章'"
        >
          <span class="play-btn-ring" v-if="isPlaying" />
          <component :is="isPlaying ? Pause : Headphones" class="w-4 h-4" />
        </button>
        <div class="reader-info">
          <div class="reader-title">
            <Volume2 class="w-3.5 h-3.5 text-blue-500" />
            <span>{{ isPlaying ? '正在朗读…' : '听文章' }}</span>
            <span v-if="isPlaying" class="reader-progress-text">{{ currentIndex + 1 }}/{{ chunks.length }}</span>
          </div>
          <div class="reader-sub">AI 语音播报 · 无障碍阅读</div>
        </div>
        <button class="reader-toggle" @click="expanded = !expanded" :aria-label="expanded ? '收起控制' : '展开控制'">
          <ChevronDown class="w-4 h-4 transition-transform" :class="{ 'rotate-180': !expanded }" />
        </button>
      </div>

      <!-- 扩展控制面板 -->
      <Transition name="fade">
        <div v-if="expanded" class="reader-controls">
          <!-- 进度条 -->
          <div v-if="chunks.length" class="reader-progress">
            <div class="progress-track">
              <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
            </div>
            <div class="progress-text">
              <span>{{ chunks.length ? Math.round(progressPercent) : 0 }}%</span>
              <span v-if="isPlaying || isPaused">预计剩余 {{ remainingTime }}</span>
            </div>
          </div>

          <div class="reader-row">
            <!-- 语速 -->
            <div class="control-group">
              <label class="control-label">
                <Gauge class="w-3 h-3" />
                <span>语速</span>
              </label>
              <div class="speed-row">
                <button
                  v-for="s in speedOptions"
                  :key="s"
                  class="speed-btn"
                  :class="{ active: rate === s }"
                  @click="setRate(s)"
                >{{ s }}x</button>
              </div>
            </div>
          </div>

          <!-- 音色 -->
          <div v-if="voices.length" class="control-group">
            <label class="control-label">
              <Mic class="w-3 h-3" />
              <span>音色（{{ voices.length }} 种）</span>
            </label>
            <select v-model="voiceURI" class="voice-select" @change="restartIfPlaying">
              <option v-for="v in voices" :key="v.voiceURI" :value="v.voiceURI">
                {{ v.name }} · {{ v.lang }}
              </option>
            </select>
          </div>

          <!-- 操作 -->
          <div class="reader-actions">
            <button class="action-btn" @click="prev" :disabled="!canPrev" title="上一段">
              <SkipBack class="w-3.5 h-3.5" />
            </button>
            <button class="action-btn primary" @click="togglePlay">
              <component :is="isPlaying ? Pause : Play" class="w-3.5 h-3.5" />
              {{ isPlaying ? '暂停' : (isPaused ? '继续' : '播放') }}
            </button>
            <button class="action-btn" @click="stop" :disabled="!isPlaying && !isPaused" title="停止">
              <Square class="w-3.5 h-3.5" />
            </button>
            <button class="action-btn" @click="next" :disabled="!canNext" title="下一段">
              <SkipForward class="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </Transition>
    </div>
    <!-- 浏览器不支持时兜底提示 -->
    <div v-else class="speech-unsupported">
      <AlertTriangle class="w-4 h-4" />
      <span>当前浏览器不支持语音朗读功能</span>
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
import { ref, computed, watch, onBeforeUnmount } from 'vue'
import {
  Headphones, Pause, Play, Square, SkipBack, SkipForward,
  ChevronDown, Volume2, Gauge, Mic, AlertTriangle,
} from 'lucide-vue-next'

const props = defineProps<{
  text?: string
  html?: string
}>()

// ============ 基础状态 ============
const supported = ref(typeof window !== 'undefined' && 'speechSynthesis' in window)
const expanded = ref(false)
const isPlaying = ref(false)
const isPaused = ref(false)
const rate = ref(1.0)
const voiceURI = ref('')
const voices = ref<SpeechSynthesisVoice[]>([])
const currentIndex = ref(0)
const chunks = ref<string[]>([])
const speedOptions = [0.75, 1, 1.25, 1.5, 2]

// ============ 文本预处理 ============
/**
 * 将 HTML 或纯文本切分为合适的段落块
 * 策略：
 *   1. 去除 HTML 标签
 *   2. 按句号 / 换行 拆分
 *   3. 每块不超过 200 字（兼容 Chromium TTS 单次 15s 限制）
 */
function extractChunks(): string[] {
  let raw = ''
  if (props.text) {
    raw = props.text
  } else if (props.html) {
    // 客户端下用 DOM 提取，避免正则漏洞
    if (typeof document !== 'undefined') {
      const tmp = document.createElement('div')
      tmp.innerHTML = props.html
      // 去掉代码块（朗读代码没意义）
      tmp.querySelectorAll('pre, code').forEach((el) => el.remove())
      raw = tmp.textContent || tmp.innerText || ''
    } else {
      raw = props.html.replace(/<[^>]+>/g, ' ')
    }
  }
  raw = raw.replace(/\s+/g, ' ').trim()
  if (!raw) return []

  // 按中文标点切分
  const sentences = raw.split(/(?<=[。！？；.!?;])\s*/).filter(Boolean)
  // 合并到每块 ≤ 200 字
  const result: string[] = []
  let buf = ''
  for (const s of sentences) {
    if ((buf + s).length > 200 && buf) {
      result.push(buf)
      buf = s
    } else {
      buf += s
    }
  }
  if (buf) result.push(buf)
  return result
}

// ============ 语音列表加载 ============
function loadVoices() {
  if (!supported.value) return
  const list = window.speechSynthesis.getVoices()
  // 优先中文音色
  const zh = list.filter((v) => v.lang.toLowerCase().startsWith('zh'))
  const others = list.filter((v) => !v.lang.toLowerCase().startsWith('zh'))
  voices.value = [...zh, ...others]
  if (!voiceURI.value && voices.value.length) {
    voiceURI.value = voices.value[0].voiceURI
  }
}
if (supported.value) {
  loadVoices()
  // voices 在某些浏览器是异步加载的
  window.speechSynthesis.onvoiceschanged = loadVoices
}

// ============ 播放控制 ============
let currentUtterance: SpeechSynthesisUtterance | null = null

function speakChunk(idx: number) {
  if (!supported.value) return
  if (idx < 0 || idx >= chunks.value.length) {
    stop()
    return
  }
  const text = chunks.value[idx]
  const u = new SpeechSynthesisUtterance(text)
  u.rate = rate.value
  u.pitch = 1
  u.volume = 1
  const voice = voices.value.find((v) => v.voiceURI === voiceURI.value)
  if (voice) {
    u.voice = voice
    u.lang = voice.lang
  }
  u.onend = () => {
    // 自然结束：播放下一段
    if (isPlaying.value && currentIndex.value === idx) {
      const nextIdx = idx + 1
      if (nextIdx < chunks.value.length) {
        currentIndex.value = nextIdx
        speakChunk(nextIdx)
      } else {
        stop()
      }
    }
  }
  u.onerror = () => {
    // 某些浏览器会在中断时触发 error，忽略
  }
  currentUtterance = u
  window.speechSynthesis.speak(u)
}

function play() {
  if (!supported.value) return
  if (isPaused.value) {
    window.speechSynthesis.resume()
    isPaused.value = false
    isPlaying.value = true
    return
  }
  if (!chunks.value.length) chunks.value = extractChunks()
  if (!chunks.value.length) return
  // 清空之前的队列
  window.speechSynthesis.cancel()
  isPlaying.value = true
  isPaused.value = false
  speakChunk(currentIndex.value)
}

function pause() {
  if (!supported.value) return
  window.speechSynthesis.pause()
  isPaused.value = true
  isPlaying.value = false
}

function togglePlay() {
  if (isPlaying.value) pause()
  else play()
}

function stop() {
  if (!supported.value) return
  window.speechSynthesis.cancel()
  isPlaying.value = false
  isPaused.value = false
  currentIndex.value = 0
  currentUtterance = null
}

function next() {
  if (!canNext.value) return
  currentIndex.value++
  if (isPlaying.value || isPaused.value) {
    window.speechSynthesis.cancel()
    isPaused.value = false
    isPlaying.value = true
    speakChunk(currentIndex.value)
  }
}

function prev() {
  if (!canPrev.value) return
  currentIndex.value--
  if (isPlaying.value || isPaused.value) {
    window.speechSynthesis.cancel()
    isPaused.value = false
    isPlaying.value = true
    speakChunk(currentIndex.value)
  }
}

function setRate(v: number) {
  rate.value = v
  restartIfPlaying()
}

/** 语速/音色变更时，重启当前段 */
function restartIfPlaying() {
  if (!isPlaying.value) return
  window.speechSynthesis.cancel()
  speakChunk(currentIndex.value)
}

const canNext = computed(() => currentIndex.value < chunks.value.length - 1)
const canPrev = computed(() => currentIndex.value > 0)
const progressPercent = computed(() =>
  chunks.value.length ? ((currentIndex.value + (isPlaying.value ? 0.5 : 0)) / chunks.value.length) * 100 : 0,
)

/** 估算剩余时间：按每字 0.25s（1x 语速）× 实际语速 */
const remainingTime = computed(() => {
  const remainChars = chunks.value.slice(currentIndex.value).reduce((acc, s) => acc + s.length, 0)
  const secs = Math.ceil((remainChars * 0.25) / rate.value)
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return m ? `${m}分${s}秒` : `${s}秒`
})

// 当 html/text props 变化时重建 chunks
watch(() => [props.html, props.text], () => {
  stop()
  chunks.value = extractChunks()
}, { immediate: true })

onBeforeUnmount(() => {
  if (supported.value) window.speechSynthesis.cancel()
})

// 页面切换 / 刷新时停止朗读
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    if (supported.value) window.speechSynthesis.cancel()
  })
}
</script>

<style scoped>
.speech-reader {
  border-radius: 16px;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.05), rgba(139, 92, 246, 0.05));
  border: 1px solid rgba(59, 130, 246, 0.15);
  overflow: hidden;
  transition: all 0.2s ease;
}
:global(.dark) .speech-reader {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.08), rgba(139, 92, 246, 0.08));
  border-color: rgba(59, 130, 246, 0.2);
}

.reader-main {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
}

.play-btn {
  position: relative;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6, #6366f1);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  box-shadow: 0 6px 16px -4px rgba(59, 130, 246, 0.5);
  flex-shrink: 0;
  transition: transform 0.2s ease;
}
.play-btn:hover { transform: scale(1.05); }
.play-btn.playing .play-btn-ring {
  position: absolute;
  inset: -4px;
  border: 2px solid #3b82f6;
  border-radius: 50%;
  animation: pulse-ring 1.8s ease-out infinite;
}
@keyframes pulse-ring {
  0%   { opacity: 0.8; transform: scale(0.95); }
  100% { opacity: 0;   transform: scale(1.25); }
}

.reader-info { flex: 1; min-width: 0; }
.reader-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
}
:global(.dark) .reader-title { color: #f3f4f6; }
.reader-progress-text {
  font-size: 11px;
  color: #6366f1;
  background: rgba(99, 102, 241, 0.1);
  padding: 1px 6px;
  border-radius: 6px;
  font-weight: 500;
}
.reader-sub {
  font-size: 11px;
  color: #9ca3af;
  margin-top: 2px;
}

.reader-toggle {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  background: transparent;
  border: none;
  color: #6b7280;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}
.reader-toggle:hover { background: rgba(0, 0, 0, 0.05); }

.reader-controls {
  padding: 12px 14px 14px;
  border-top: 1px dashed rgba(59, 130, 246, 0.15);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.reader-progress { display: flex; flex-direction: column; gap: 6px; }
.progress-track {
  height: 4px;
  border-radius: 2px;
  background: #e5e7eb;
  overflow: hidden;
}
:global(.dark) .progress-track { background: #374151; }
.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #8b5cf6);
  transition: width 0.3s ease;
}
.progress-text {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: #9ca3af;
}

.control-group { display: flex; flex-direction: column; gap: 6px; }
.control-label {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: #6b7280;
  font-weight: 500;
}

.speed-row { display: flex; gap: 4px; flex-wrap: wrap; }
.speed-btn {
  padding: 4px 10px;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
  background: #fff;
  color: #6b7280;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.15s ease;
}
.speed-btn:hover { border-color: #3b82f6; color: #3b82f6; }
.speed-btn.active {
  background: linear-gradient(135deg, #3b82f6, #6366f1);
  color: #fff;
  border-color: transparent;
}
:global(.dark) .speed-btn {
  background: #1f2937;
  border-color: #374151;
  color: #d1d5db;
}

.voice-select {
  padding: 6px 10px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  background: #fff;
  font-size: 12px;
  color: #374151;
  width: 100%;
}
:global(.dark) .voice-select {
  background: #1f2937;
  border-color: #374151;
  color: #e5e7eb;
}

.reader-actions {
  display: grid;
  grid-template-columns: auto 1fr auto auto;
  gap: 6px;
}
.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 7px 10px;
  border-radius: 8px;
  background: #fff;
  border: 1px solid #e5e7eb;
  color: #4b5563;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.15s ease;
}
.action-btn:hover:not(:disabled) {
  border-color: #3b82f6;
  color: #3b82f6;
}
.action-btn.primary {
  background: linear-gradient(135deg, #3b82f6, #6366f1);
  color: #fff;
  border-color: transparent;
  font-weight: 500;
}
.action-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
:global(.dark) .action-btn {
  background: #1f2937;
  border-color: #374151;
  color: #d1d5db;
}

.speech-unsupported {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-radius: 10px;
  background: #fef3c7;
  color: #92400e;
  font-size: 12px;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
