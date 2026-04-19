<template>
  <div class="fixed z-50" :class="isOpen ? 'bottom-4 right-4 sm:bottom-6 sm:right-6' : 'bottom-4 right-4 sm:bottom-6 sm:right-6'">
    <!-- Chat Panel -->
    <Transition name="chat-panel">
      <div
        v-if="isOpen"
        class="flex flex-col bg-white/90 dark:bg-gray-900/95 backdrop-blur-2xl border border-gray-200/60 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden mb-3"
        :class="[
          isMobile
            ? 'fixed inset-2 z-50'
            : 'w-[420px] h-[600px]'
        ]"
      >
        <!-- Header -->
        <div class="flex items-center justify-between px-4 py-3 border-b border-gray-200/50 dark:border-white/10 bg-gradient-to-r from-blue-500/10 to-purple-500/10">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714a2.25 2.25 0 00.659 1.591L19 14.5M14.25 3.104c.251.023.501.05.75.082M19 14.5l-2.47 2.47a2.25 2.25 0 00-.659 1.591v1.689m-4.371 0h4.371m0 0a2.25 2.25 0 002.25-2.25V18" />
              </svg>
            </div>
            <div>
              <span class="font-semibold text-sm text-gray-800 dark:text-gray-100">航行者 AI</span>
              <span class="block text-[10px] text-gray-500 dark:text-gray-400 leading-tight">你的专属技术助手</span>
            </div>
          </div>
          <div class="flex items-center gap-1">
            <button
              @click="clearMessages"
              class="p-1.5 rounded-lg hover:bg-gray-200/60 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400 transition-colors"
              title="清空对话"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
            <button
              @click="isOpen = false"
              class="p-1.5 rounded-lg hover:bg-gray-200/60 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400 transition-colors"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Messages -->
        <div ref="messagesContainer" class="flex-1 overflow-y-auto px-4 py-3 space-y-4 scroll-smooth">
          <!-- Welcome -->
          <div v-if="messages.length === 0" class="flex flex-col items-center justify-center h-full text-center px-4">
            <div class="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-4">
              <svg class="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714a2.25 2.25 0 00.659 1.591L19 14.5M14.25 3.104c.251.023.501.05.75.082M19 14.5l-2.47 2.47a2.25 2.25 0 00-.659 1.591v1.689m-4.371 0h4.371m0 0a2.25 2.25 0 002.25-2.25V18" />
              </svg>
            </div>
            <h3 class="text-lg font-bold text-gray-800 dark:text-gray-100 mb-2">你好！我是航行者 AI 🚀</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400 mb-6">有任何技术问题都可以问我，我会尽力帮你解答。</p>
            <div class="grid grid-cols-1 gap-2 w-full max-w-[280px]">
              <!-- 文章页专属：AI 帮我读 -->
              <button
                v-if="isArticlePage"
                @click="openArticleReader"
                class="flex items-center gap-2 text-left text-xs px-3 py-2.5 rounded-xl
                       bg-gradient-to-r from-violet-500/10 to-blue-500/10 hover:from-violet-500/20 hover:to-blue-500/20
                       border border-violet-300/40 dark:border-violet-500/30
                       text-violet-700 dark:text-violet-300 font-medium transition-colors"
              >
                <span class="text-base">📖</span>
                <span class="flex-1">AI 帮我读这篇文章</span>
                <span class="text-[10px] text-violet-500/70">思维导图 · 术语</span>
              </button>
              <button
                v-for="q in quickQuestions"
                :key="q"
                @click="sendMessage(q)"
                class="text-left text-xs px-3 py-2 rounded-xl bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-600 dark:text-gray-300 transition-colors border border-gray-200/50 dark:border-white/5"
              >
                {{ q }}
              </button>
            </div>
          </div>

          <!-- Message List -->
          <div v-for="(msg, i) in messages" :key="i" class="flex" :class="msg.role === 'user' ? 'justify-end' : 'justify-start'">
            <div
              class="max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed"
              :class="msg.role === 'user'
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-br-md'
                : 'bg-gray-100 dark:bg-white/[0.06] text-gray-800 dark:text-gray-200 border border-gray-200/40 dark:border-white/5 rounded-bl-md'"
            >
              <div v-if="msg.role === 'assistant'" class="ai-content prose prose-sm dark:prose-invert max-w-none" v-html="renderMarkdown(msg.content)" />
              <span v-else>{{ msg.content }}</span>
            </div>
          </div>

          <!-- Loading -->
          <div v-if="isLoading && (!messages.length || messages[messages.length - 1]?.role !== 'assistant')" class="flex justify-start">
            <div class="bg-gray-100 dark:bg-white/[0.06] border border-gray-200/40 dark:border-white/5 rounded-2xl rounded-bl-md px-4 py-3">
              <div class="flex items-center gap-1.5">
                <div class="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" style="animation-delay: 0ms" />
                <div class="w-1.5 h-1.5 rounded-full bg-purple-500 animate-bounce" style="animation-delay: 150ms" />
                <div class="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" style="animation-delay: 300ms" />
              </div>
            </div>
          </div>
        </div>

        <!-- Input -->
        <div class="px-4 py-3 border-t border-gray-200/50 dark:border-white/10 bg-white/50 dark:bg-gray-900/50">
          <div v-if="isLimited" class="text-center py-2">
            <p class="text-xs text-gray-500 dark:text-gray-400">已达到对话次数上限（{{ MAX_CHAT_COUNT }} 次/天），请明天再来~</p>
          </div>
          <div v-else class="flex items-end gap-2">
            <textarea
              ref="inputEl"
              v-model="inputText"
              @keydown.enter.exact.prevent="sendMessage()"
              :disabled="isLoading"
              rows="1"
              placeholder="输入你的问题..."
              class="flex-1 resize-none rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 px-3 py-2.5 text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 transition-all max-h-[120px]"
              @input="autoResize"
            />
            <button
              @click="sendMessage()"
              :disabled="isLoading || !inputText.trim()"
              class="flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white flex items-center justify-center hover:shadow-lg hover:shadow-blue-500/25 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19V5m0 0l-7 7m7-7l7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Floating Button -->
    <button
      v-show="!isOpen"
      @click="isOpen = true"
      class="group w-14 h-14 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/40 hover:scale-110 transition-all duration-300 flex items-center justify-center"
    >
      <svg class="w-6 h-6 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import { Marked } from 'marked'
import { markedHighlight } from 'marked-highlight'
import hljs from 'highlight.js/lib/core'

// AI 回答里可能出现的常见语言（按需注册，多余的语言直接转义为纯文本）
const HLJS_LANG_MAP: Record<string, string> = {
  js: 'javascript', javascript: 'javascript',
  ts: 'typescript', typescript: 'typescript',
  html: 'xml', xml: 'xml', vue: 'xml',
  css: 'css', scss: 'scss', less: 'less',
  json: 'json',
  bash: 'bash', sh: 'bash', shell: 'bash',
  python: 'python', py: 'python',
  java: 'java', sql: 'sql',
  markdown: 'markdown', md: 'markdown',
  yaml: 'yaml', yml: 'yaml',
  go: 'go', rust: 'rust', c: 'c', cpp: 'cpp', php: 'php',
}
const loadedLangs = new Set<string>()
const loadingLangs = new Map<string, Promise<void>>()
function loadHljsLang(alias: string): Promise<void> {
  const mod = HLJS_LANG_MAP[alias]
  if (!mod) return Promise.resolve()
  if (loadedLangs.has(mod)) return Promise.resolve()
  const existing = loadingLangs.get(mod)
  if (existing) return existing
  const p = import(`highlight.js/lib/languages/${mod}`)
    .then((m: any) => { hljs.registerLanguage(mod, m.default || m); loadedLangs.add(mod) })
    .catch(() => { /* ignore */ })
  loadingLangs.set(mod, p)
  return p
}
function preloadLangsFor(md: string) {
  if (!md) return
  const set = new Set<string>()
  const re = /```([a-zA-Z0-9_+-]+)/g
  let m: RegExpExecArray | null
  while ((m = re.exec(md))) set.add(m[1].toLowerCase())
  set.forEach((l) => { loadHljsLang(l) })
}

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

const config = useRuntimeConfig()
const apiBase = config.public.apiBase as string

const isOpen = ref(false)
const inputText = ref('')
const messages = ref<ChatMessage[]>([])
const isLoading = ref(false)
const messagesContainer = ref<HTMLElement | null>(null)
const inputEl = ref<HTMLTextAreaElement | null>(null)
const isMobile = ref(false)

/**
 * 对话配额（后端为源）
 * ------------------------------------------------------------
 * 后端按 IP 统计 24h 内的使用次数，前端 localStorage 仅做 UX 显示。
 * 用户换浏览器 / 开无痕仍将被后端拦截（返回 429）。
 */
const MAX_CHAT_COUNT = ref(3)
const chatCount = ref(0)
const isLimited = computed(() => chatCount.value >= MAX_CHAT_COUNT.value)

async function refreshQuota() {
  try {
    const res: any = await $fetch(`${apiBase}/ai-chat/quota`)
    const data = res?.data || res
    if (data && typeof data.used === 'number') {
      chatCount.value = data.used
      MAX_CHAT_COUNT.value = data.limit
      localStorage.setItem('ai_chat_count', String(data.used))
    }
  } catch {
    // 后端不可达时回落 localStorage（弱网兼容）
  }
}

const quickQuestions = [
  '🔧 Vue 3 和 React 有什么区别？',
  '📦 如何优化前端性能？',
  '🚀 NestJS 有哪些核心概念？',
]

// 当前是否在文章详情页（用于展示「AI 帮我读」入口）
const route = useRoute()
const isArticlePage = computed(() => /^\/articles\/[^/]+$/.test(route.path))

// 打开 AI 阅读抽屉（共享状态），并关闭聊天面板
const aiReaderOpen = useAiReaderOpen()
function openArticleReader() {
  aiReaderOpen.value = true
  isOpen.value = false
}

onMounted(() => {
  isMobile.value = window.innerWidth < 640
  // 先用 localStorage 快速回显（避免闪烁），再以后端真实配额视为权威值
  chatCount.value = parseInt(localStorage.getItem('ai_chat_count') || '0', 10)
  refreshQuota()
})

const marked = new Marked(
  markedHighlight({
    langPrefix: 'hljs language-',
    highlight(code: string, lang: string) {
      const alias = (lang || '').toLowerCase()
      const real = HLJS_LANG_MAP[alias]
      if (real && hljs.getLanguage(real)) {
        return hljs.highlight(code, { language: real }).value
      }
      return code
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
    },
  }),
)

function renderMarkdown(text: string): string {
  if (!text) return ''
  // 异步懒加载语言包（下一次 tick 渲染时才会生效，但不影响展示）
  preloadLangsFor(text)
  return marked.parse(text) as string
}

function autoResize(e: Event) {
  const el = e.target as HTMLTextAreaElement
  el.style.height = 'auto'
  el.style.height = Math.min(el.scrollHeight, 120) + 'px'
}

function scrollToBottom() {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

function clearMessages() {
  messages.value = []
}

async function sendMessage(text?: string) {
  const content = (text || inputText.value).trim()
  if (!content || isLoading.value || isLimited.value) return

  // 乐观 +1，最终以后端配额为准
  chatCount.value++
  localStorage.setItem('ai_chat_count', String(chatCount.value))

  inputText.value = ''
  if (inputEl.value) {
    inputEl.value.style.height = 'auto'
  }

  messages.value.push({ role: 'user', content })
  scrollToBottom()

  isLoading.value = true

  // Prepare the context (last 10 messages)
  const contextMessages = messages.value.slice(-10).map((m) => ({
    role: m.role,
    content: m.content,
  }))

  // Add assistant placeholder
  messages.value.push({ role: 'assistant', content: '' })
  const assistantIndex = messages.value.length - 1
  scrollToBottom()

  try {
    const response = await fetch(`${apiBase}/ai-chat/stream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: contextMessages }),
    })

    if (!response.ok) {
      // 后端配额拦截
      if (response.status === 429) {
        let msg = `对话次数已达上限（${MAX_CHAT_COUNT.value} 次/天），请明天再来~`
        try {
          const errBody = await response.json()
          msg = errBody?.message || msg
        } catch { /* ignore */ }
        messages.value[assistantIndex].content = `⏳ ${msg}`
        // 同步配额到上限，禁用输入框
        chatCount.value = MAX_CHAT_COUNT.value
        localStorage.setItem('ai_chat_count', String(chatCount.value))
        return
      }
      throw new Error(`HTTP ${response.status}`)
    }

    const reader = response.body!.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed || !trimmed.startsWith('data: ')) continue

        const data = trimmed.slice(6)
        if (data === '[DONE]') break

        try {
          const parsed = JSON.parse(data)
          if (parsed.error) {
            messages.value[assistantIndex].content = `❌ ${parsed.error}`
            break
          }
          const delta = parsed.choices?.[0]?.delta?.content
          if (delta) {
            messages.value[assistantIndex].content += delta
            scrollToBottom()
          }
        } catch {
          // skip unparseable lines
        }
      }
    }
  } catch (err: any) {
    if (!messages.value[assistantIndex].content) {
      messages.value[assistantIndex].content = '❌ 连接 AI 服务失败，请稍后再试。'
    }
  } finally {
    isLoading.value = false
    scrollToBottom()
    // 回答结束后拉一次后端配额，保证前后端一致
    refreshQuota()
  }
}
</script>

<style scoped>
.chat-panel-enter-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.chat-panel-leave-active {
  transition: all 0.2s ease-in;
}
.chat-panel-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}
.chat-panel-leave-to {
  opacity: 0;
  transform: translateY(10px) scale(0.98);
}

/* AI content prose styles */
:deep(.ai-content) {
  font-size: 0.8125rem;
  line-height: 1.7;
}
:deep(.ai-content p) {
  margin: 0.4em 0;
}
:deep(.ai-content pre) {
  margin: 0.5em 0;
  padding: 0.75em;
  border-radius: 0.75rem;
  font-size: 0.75rem;
  overflow-x: auto;
  background: #1e1e2e;
  color: #cdd6f4;
}
:deep(.ai-content code:not(pre code)) {
  padding: 0.15em 0.4em;
  border-radius: 0.375rem;
  font-size: 0.8em;
  background: rgba(127, 127, 127, 0.15);
}
:deep(.ai-content ul),
:deep(.ai-content ol) {
  padding-left: 1.25em;
  margin: 0.4em 0;
}
:deep(.ai-content li) {
  margin: 0.15em 0;
}
:deep(.ai-content h1),
:deep(.ai-content h2),
:deep(.ai-content h3) {
  margin: 0.6em 0 0.3em;
  font-weight: 600;
}
:deep(.ai-content blockquote) {
  border-left: 3px solid rgb(99 102 241);
  padding-left: 0.75em;
  margin: 0.5em 0;
  opacity: 0.85;
}
</style>
