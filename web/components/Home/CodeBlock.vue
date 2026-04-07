<template>
  <section class="py-20">
    <div class="max-w-3xl mx-auto px-6">
      <div class="rounded-2xl overflow-hidden shadow-2xl shadow-black/10 dark:shadow-black/40 border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1a1b2e]">
        <!-- 标题栏 -->
        <div class="flex items-center gap-3 px-5 py-3.5 border-b border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-[#151625]">
          <div class="flex gap-2">
            <span class="w-3 h-3 rounded-full bg-[#ff5f57]"></span>
            <span class="w-3 h-3 rounded-full bg-[#febc2e]"></span>
            <span class="w-3 h-3 rounded-full bg-[#28c840]"></span>
          </div>
          <span class="text-xs text-gray-400 dark:text-gray-500 font-mono ml-1">developer.js</span>
        </div>
        <!-- 代码内容 -->
        <div class="p-6 md:p-8 font-mono text-sm md:text-base leading-relaxed overflow-x-auto">
          <div class="text-gray-400 dark:text-gray-500 mb-1">
            <span class="text-green-600 dark:text-green-400">//</span> {{ codeLines.comment1 }}
          </div>
          <div>
            <span class="text-purple-600 dark:text-purple-400">const</span>
            <span class="text-gray-800 dark:text-gray-200"> developer </span>
            <span class="text-gray-500">=</span>
            <span class="text-gray-800 dark:text-gray-200"> {</span>
          </div>
          <div class="pl-6">
            <span class="text-gray-800 dark:text-gray-300">name:</span>
            <span class="text-amber-600 dark:text-amber-400"> '{{ codeLines.name }}'</span><span class="text-gray-500">,</span>
          </div>
          <div class="pl-6">
            <span class="text-gray-800 dark:text-gray-300">skills:</span>
            <span class="text-gray-500"> [</span><span class="text-amber-600 dark:text-amber-400">{{ formattedSkills }}</span><span class="text-gray-500">]</span><span class="text-gray-500">,</span>
          </div>
          <div class="pl-6">
            <span class="text-gray-800 dark:text-gray-300">goal:</span>
            <span class="text-amber-600 dark:text-amber-400"> '{{ codeLines.goal }}'</span>
          </div>
          <div><span class="text-gray-800 dark:text-gray-200">};</span></div>

          <div class="mt-6 text-gray-400 dark:text-gray-500 mb-1">
            <span class="text-green-600 dark:text-green-400">//</span> 🚀 {{ codeLines.comment2 }}
          </div>
          <div>
            <span class="text-gray-800 dark:text-gray-200">developer</span><span class="text-gray-500">.</span><span class="text-blue-600 dark:text-blue-400">learn</span>
            <span class="text-gray-500"> = </span>
            <span class="text-gray-500">()</span>
            <span class="text-purple-600 dark:text-purple-400"> =&gt; </span>
            <span class="text-gray-800 dark:text-gray-200">{</span>
          </div>
          <div class="pl-6">
            <span class="text-gray-800 dark:text-gray-200">console</span><span class="text-gray-500">.</span><span class="text-blue-600 dark:text-blue-400">log</span><span class="text-gray-500">(</span><span class="text-amber-600 dark:text-amber-400">'{{ codeLines.log }}'</span><span class="text-gray-500">);</span>
          </div>
          <div><span class="text-gray-800 dark:text-gray-200">};</span></div>

          <!-- 闪烁光标 -->
          <div class="mt-4 flex items-center">
            <span class="w-2.5 h-5 bg-blue-500 dark:bg-cyan-400 rounded-sm animate-blink"></span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const props = defineProps<{
  config?: Record<string, string>
}>()

const codeLines = computed(() => ({
  comment1: props.config?.code_comment1 || '欢迎来到我的技术世界',
  name: props.config?.about_name || props.config?.site_title || '你',
  goal: props.config?.code_goal || '成为更好的程序员',
  comment2: props.config?.code_comment2 || '开启学习之旅',
  log: props.config?.code_log || '每天进步一点点!',
}))

const formattedSkills = computed(() => {
  const raw = props.config?.code_skills || 'Vue, React, TypeScript'
  return raw.split(',').map((s: string) => `'${s.trim()}'`).join(', ')
})
</script>

<style scoped>
@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}
.animate-blink {
  animation: blink 1s step-end infinite;
}
</style>
