<template>
  <section class="relative min-h-screen flex items-center pt-16 overflow-hidden">
    <div class="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950"></div>
    <div class="absolute top-20 left-10 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl animate-pulse"></div>
    <div class="absolute bottom-20 right-10 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl animate-pulse" style="animation-delay:2s"></div>
    <div class="relative z-10 max-w-6xl mx-auto px-6 w-full">
      <div class="max-w-3xl">
        <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-medium mb-8">
          <span class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          {{ config?.home_intro || '全栈开发者 / 开源爱好者 / 技术博主' }}
        </div>
        <h1 class="text-5xl md:text-7xl font-bold mb-4 leading-tight">
          {{ config?.site_subtitle || '架构代码，' }}<br />
          <span class="gradient-text">{{ config?.site_subtitle_highlight || '书写未来。' }}</span>
        </h1>
        <p class="text-lg text-gray-500 dark:text-gray-400 mb-10 max-w-2xl leading-relaxed">
          <span class="typewriter-text">{{ displayedText }}<span class="typewriter-cursor">|</span></span>
        </p>
        <div class="flex items-center gap-4">
          <NuxtLink to="/articles" class="inline-flex items-center gap-2 px-8 py-3 bg-gray-900 dark:bg-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 text-white rounded-full font-medium transition-all hover:shadow-lg">
            <BookOpen class="w-4 h-4" />
            阅读最新文章
          </NuxtLink>
          <NuxtLink to="/contact" class="inline-flex items-center gap-2 px-8 py-3 border border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500 rounded-full font-medium transition-colors">
            <Mail class="w-4 h-4" />
            联系方式
          </NuxtLink>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { BookOpen, Mail } from 'lucide-vue-next'

const props = defineProps<{ config: Record<string, string> }>()

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

onMounted(() => {
  startTyping()
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<style scoped>
.typewriter-cursor {
  animation: blink 1s step-end infinite;
  font-weight: 100;
  color: #3b82f6;
}
@keyframes blink {
  50% { opacity: 0; }
}
</style>
