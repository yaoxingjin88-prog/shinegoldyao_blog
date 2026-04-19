<template>
  <!-- 选中文字浮动按钮 -->
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="opacity-0 scale-90"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-90"
    >
      <button
        v-if="triggerVisible"
        ref="triggerRef"
        class="fixed z-[60] flex items-center gap-1.5 px-3 py-1.5 rounded-full
               bg-gradient-to-r from-violet-600 to-blue-500 text-white shadow-lg shadow-blue-500/40
               text-xs font-medium hover:scale-105 active:scale-95 transition-transform"
        :style="{ top: triggerPos.top + 'px', left: triggerPos.left + 'px' }"
        @mousedown.prevent
        @click="handleExplain"
      >
        <Sparkles class="w-3.5 h-3.5" />
        AI 解释
      </button>
    </Transition>

    <!-- 浮动解释弹窗 -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-2"
    >
      <div
        v-if="popoverVisible"
        ref="popoverRef"
        class="fixed z-[60] w-[min(90vw,400px)] rounded-2xl bg-white dark:bg-gray-900
               border border-gray-200 dark:border-gray-700 shadow-2xl overflow-hidden"
        :style="{ top: popoverPos.top + 'px', left: popoverPos.left + 'px' }"
        @mousedown.stop
      >
        <!-- 头部 -->
        <div class="flex items-center justify-between px-4 py-2.5 bg-gradient-to-r from-violet-500/10 to-blue-500/10 border-b border-gray-200 dark:border-gray-700">
          <div class="flex items-center gap-2">
            <Sparkles class="w-4 h-4 text-blue-500" />
            <span class="text-xs font-medium text-gray-700 dark:text-gray-200">AI 解释</span>
          </div>
          <button class="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800" @click="closePopover">
            <X class="w-3.5 h-3.5 text-gray-400" />
          </button>
        </div>
        <!-- 原文引用 -->
        <div class="px-4 py-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700 line-clamp-2">
          <span class="font-medium text-gray-400">选中：</span>{{ selectedText }}
        </div>
        <!-- 内容区 -->
        <div class="px-4 py-3 max-h-[50vh] overflow-y-auto">
          <div v-if="loading" class="flex items-center gap-2 text-xs text-gray-400 py-4">
            <div class="w-3 h-3 rounded-full border-2 border-blue-200 border-t-blue-600 animate-spin"></div>
            AI 正在思考…
          </div>
          <div
            v-else-if="explanation"
            class="prose prose-sm dark:prose-invert max-w-none text-sm leading-relaxed"
            v-html="explanation"
          ></div>
          <p v-else class="text-xs text-gray-400 py-4">暂无结果</p>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { Sparkles, X } from 'lucide-vue-next'
import { marked } from 'marked'

const props = defineProps<{
  /** 监听选中的容器 CSS 选择器，默认为 .article-content */
  scope?: string
  /** 文章标题，作为上下文传给 AI */
  articleTitle?: string
}>()

const { aiExplainText } = useApi()

const triggerVisible = ref(false)
const triggerPos = ref({ top: 0, left: 0 })
const popoverVisible = ref(false)
const popoverPos = ref({ top: 0, left: 0 })
const popoverRef = ref<HTMLElement>()
const selectedText = ref('')
const loading = ref(false)
const explanation = ref('')

const scopeSelector = props.scope || '.article-content'

function getScopeEl(node: Node | null): HTMLElement | null {
  if (!node) return null
  const el = node.nodeType === 1 ? (node as HTMLElement) : node.parentElement
  return el?.closest(scopeSelector) as HTMLElement | null
}

function handleSelectionChange() {
  // 仅在弹窗不可见时才响应选区变化
  if (popoverVisible.value) return
  const sel = window.getSelection()
  if (!sel || sel.isCollapsed) {
    triggerVisible.value = false
    return
  }
  const text = sel.toString().trim()
  // 过滤太短或太长
  if (text.length < 2 || text.length > 300) {
    triggerVisible.value = false
    return
  }
  // 必须在文章容器内
  const anchor = getScopeEl(sel.anchorNode)
  const focus = getScopeEl(sel.focusNode)
  if (!anchor || !focus) {
    triggerVisible.value = false
    return
  }
  const range = sel.getRangeAt(0)
  const rect = range.getBoundingClientRect()
  if (!rect.width && !rect.height) {
    triggerVisible.value = false
    return
  }
  selectedText.value = text
  triggerPos.value = {
    top: rect.top - 40,
    left: rect.left + rect.width / 2 - 50,
  }
  triggerVisible.value = true
}

async function handleExplain() {
  if (!selectedText.value) return
  triggerVisible.value = false
  popoverVisible.value = true
  explanation.value = ''
  loading.value = true

  // 定位弹窗到按钮附近
  popoverPos.value = {
    top: Math.min(triggerPos.value.top + 10, window.innerHeight - 300),
    left: Math.max(10, Math.min(triggerPos.value.left - 170, window.innerWidth - 420)),
  }

  try {
    const res = await aiExplainText(selectedText.value, props.articleTitle)
    if (res.enabled === false) {
      explanation.value = '<p class="text-gray-400 text-xs">服务端未配置 AI API Key</p>'
    } else if (res.explanation) {
      explanation.value = marked.parse(res.explanation) as string
    } else {
      explanation.value = '<p class="text-gray-400 text-xs">AI 暂无返回</p>'
    }
  } catch {
    explanation.value = '<p class="text-red-400 text-xs">请求失败，请稍后重试</p>'
  } finally {
    loading.value = false
  }

  await nextTick()
  // 如果弹窗超出视口底部，向上调整
  const rect = popoverRef.value?.getBoundingClientRect()
  if (rect && rect.bottom > window.innerHeight - 20) {
    popoverPos.value.top = Math.max(10, window.innerHeight - rect.height - 20)
  }
}

function closePopover() {
  popoverVisible.value = false
  window.getSelection()?.removeAllRanges()
}

function handleDocClick(e: MouseEvent) {
  if (!popoverVisible.value) return
  const target = e.target as Node
  if (popoverRef.value?.contains(target)) return
  closePopover()
}

function handleScroll() {
  // 滚动时隐藏触发按钮（选区会失效）
  if (triggerVisible.value) triggerVisible.value = false
}

onMounted(() => {
  document.addEventListener('selectionchange', handleSelectionChange)
  document.addEventListener('mousedown', handleDocClick)
  window.addEventListener('scroll', handleScroll, { passive: true })
})

onBeforeUnmount(() => {
  document.removeEventListener('selectionchange', handleSelectionChange)
  document.removeEventListener('mousedown', handleDocClick)
  window.removeEventListener('scroll', handleScroll)
})
</script>
