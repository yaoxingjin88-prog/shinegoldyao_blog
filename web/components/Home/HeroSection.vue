<template>
  <section class="relative flex items-center overflow-hidden pt-32 pb-8 md:pt-40 md:pb-4">
    <div class="relative z-10 max-w-6xl mx-auto px-6 w-full">
      <div class="flex flex-col lg:flex-row lg:items-center gap-10 lg:gap-16">

        <!-- 左侧：文字 -->
        <div class="flex-1 min-w-0">
          <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-medium mb-6 animate-fade-in-up">
            <span class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            {{ config?.home_intro || '全栈开发者 / 开源爱好者 / 技术博主' }}
          </div>
          <h1 class="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight animate-fade-in-up" style="animation-delay: 0.1s;">
            {{ config?.site_subtitle || '架构代码，' }}<br />
            <span class="gradient-text">{{ config?.site_subtitle_highlight || '书写未来。' }}</span>
          </h1>
          <p class="text-base md:text-lg text-gray-500 dark:text-gray-400 mb-8 max-w-xl leading-relaxed min-h-[3rem] animate-fade-in-up" style="animation-delay: 0.2s;">
            <span class="typewriter-text">{{ displayedText }}<span class="typewriter-cursor">|</span></span>
          </p>
          <div class="flex items-center gap-4 animate-fade-in-up" style="animation-delay: 0.3s;">
            <NuxtLink to="/articles" class="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 dark:bg-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 text-white rounded-full font-medium transition-all hover:shadow-lg">
              <BookOpen class="w-4 h-4" />
              阅读最新文章
            </NuxtLink>
            <NuxtLink to="/contact" class="inline-flex items-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500 rounded-full font-medium transition-colors">
              <Mail class="w-4 h-4" />
              订阅更新
            </NuxtLink>
          </div>
        </div>

        <!-- 右侧：代码窗口 -->
        <ClientOnly>
          <div class="hidden lg:block w-[420px] flex-shrink-0 animate-fade-in-up" style="animation-delay: 0.4s;">
            <div class="rounded-2xl overflow-hidden shadow-2xl shadow-black/10 dark:shadow-black/40 border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1a1b2e]">
              <!-- 标题栏 -->
              <div class="flex items-center gap-3 px-4 py-3 border-b border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-[#151625]">
                <div class="flex gap-2">
                  <span class="w-3 h-3 rounded-full bg-[#ff5f57]"></span>
                  <span class="w-3 h-3 rounded-full bg-[#febc2e]"></span>
                  <span class="w-3 h-3 rounded-full bg-[#28c840]"></span>
                </div>
                <span class="text-xs text-gray-400 dark:text-gray-500 font-mono ml-1">developer.js</span>
              </div>
              <!-- 代码内容 - 逐字打字机 -->
              <div class="p-5 font-mono text-[13px] leading-[1.8] min-h-[280px]">
                <template v-for="(line, idx) in renderedCodeLines" :key="idx">
                  <div :class="line.class">{{ line.text }}</div>
                </template>
                <div v-if="codeTypingDone" class="flex items-center mt-1">
                  <span class="w-2 h-4 bg-blue-500 dark:bg-cyan-400 rounded-sm code-blink"></span>
                </div>
                <span v-else class="inline-block w-2 h-4 bg-blue-500 dark:bg-cyan-400 rounded-sm code-blink align-middle"></span>
              </div>
            </div>
          </div>
        </ClientOnly>

      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { BookOpen, Mail } from 'lucide-vue-next'

const props = defineProps<{ config: Record<string, string> }>()

// === 左侧打字机 ===
const fullText = computed(() => props.config?.home_description || '你好，我是一名前端架构师与开源爱好者。在这里，我分享关于现代 Web 开发、高性能系统架构以及极客生活的深度思考。')
const displayedText = ref('')
const charIndex = ref(0)
let timer: ReturnType<typeof setInterval> | null = null

function startTyping() {
  charIndex.value = 0
  displayedText.value = ''
  if (timer) clearInterval(timer)
  timer = setInterval(() => {
    if (charIndex.value < fullText.value.length) {
      displayedText.value += fullText.value[charIndex.value]
      charIndex.value++
    } else {
      if (timer) clearInterval(timer)
    }
  }, 50)
}

watch(fullText, () => startTyping())

// === 右侧代码打字机 ===
const name = computed(() => props.config?.about_name || props.config?.site_title || '你')
const skills = computed(() => {
  const raw = props.config?.code_skills || 'Vue, React, TypeScript'
  return raw.split(',').map((s: string) => `'${s.trim()}'`).join(', ')
})
const goal = computed(() => props.config?.code_goal || '成为更好的程序员')
const log = computed(() => props.config?.code_log || '每天进步一点点!')

const comment1 = computed(() => props.config?.code_comment_1 || '// 欢迎来到我的技术世界')
const comment2 = computed(() => props.config?.code_comment_2 || '// 🚀 开启学习之旅')

const codeLines = computed(() => [
  { text: comment1.value, class: 'text-gray-400 dark:text-gray-500' },
  { text: 'const developer = {', class: 'text-gray-800 dark:text-gray-200' },
  { text: `  name: '${name.value}',`, class: 'code-str' },
  { text: `  skills: [${skills.value}],`, class: 'code-str' },
  { text: `  goal: '${goal.value}'`, class: 'code-str' },
  { text: '};', class: 'text-gray-800 dark:text-gray-200' },
  { text: '', class: '' },
  { text: comment2.value, class: 'text-gray-400 dark:text-gray-500' },
  { text: 'developer.learn = () => {', class: 'text-gray-800 dark:text-gray-200' },
  { text: `  console.log('${log.value}');`, class: 'code-str' },
  { text: '};', class: 'text-gray-800 dark:text-gray-200' },
])

const codeCharIndex = ref(0)
const codeTypingDone = ref(false)
let codeTimer: ReturnType<typeof setInterval> | null = null

const codeFullText = computed(() => codeLines.value.map(l => l.text))
const codeTotalChars = computed(() => codeFullText.value.reduce((sum, line) => sum + line.length + 1, 0))

const renderedCodeLines = computed(() => {
  let remaining = codeCharIndex.value
  const result: { text: string; class: string }[] = []
  for (const line of codeLines.value) {
    if (remaining <= 0) break
    if (remaining >= line.text.length + 1) {
      result.push({ text: line.text, class: line.class })
      remaining -= line.text.length + 1
    } else {
      result.push({ text: line.text.slice(0, remaining), class: line.class })
      remaining = 0
    }
  }
  return result
})

function startCodeTyping() {
  codeCharIndex.value = 0
  codeTypingDone.value = false
  if (codeTimer) clearInterval(codeTimer)
  codeTimer = setInterval(() => {
    if (codeCharIndex.value < codeTotalChars.value) {
      codeCharIndex.value++
    } else {
      codeTypingDone.value = true
      if (codeTimer) clearInterval(codeTimer)
    }
  }, 25)
}

onMounted(() => {
  startTyping()
  setTimeout(() => startCodeTyping(), 600)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
  if (codeTimer) clearInterval(codeTimer)
})
</script>

<style scoped>
.typewriter-cursor {
  animation: blink 1s step-end infinite;
  font-weight: 100;
  color: #3b82f6;
}
.code-blink {
  animation: blink 1s step-end infinite;
}
@keyframes blink {
  50% { opacity: 0; }
}
.code-str {
  color: #92400e;
}
:root.dark .code-str,
.dark .code-str {
  color: #fbbf24;
}
</style>
