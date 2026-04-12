<template>
  <NuxtLink :to="`/articles/${article.slug}`" class="group relative rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 overflow-hidden hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-500 hover:-translate-y-1 hover:shadow-xl flex flex-col cursor-pointer">
    <div :class="['h-1 w-full opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-r', gradient]"></div>
    <!-- 头图区域 -->
    <div class="h-48 w-full bg-gray-50 dark:bg-gray-800/50 relative overflow-hidden p-6 flex flex-col justify-end border-b border-gray-100 dark:border-gray-800">
      <div :class="['absolute -right-10 -top-10 w-40 h-40 rounded-full blur-3xl opacity-30 group-hover:opacity-50 transition-opacity duration-500 bg-gradient-to-br', gradient]"></div>
      <span v-if="article.category" class="relative z-10 text-xs font-bold uppercase tracking-wider bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 shadow-sm self-start px-3 py-1 rounded-full mb-2">
        {{ article.category.categoryName }}
      </span>
    </div>
    <!-- 文章信息 -->
    <div class="p-6 flex-grow flex flex-col">
      <div class="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mb-3">
        <time>{{ formatDate(article.publishTime || article.createTime) }}</time>
        <span class="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600"></span>
        <span>{{ readTime }} min read</span>
      </div>
      <h3 class="text-xl font-bold mb-3 leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300 line-clamp-2">
        {{ article.title }}
      </h3>
      <p class="text-gray-600 dark:text-gray-400 text-sm leading-relaxed flex-grow line-clamp-3">
        {{ article.summary }}
      </p>
      <div class="mt-6 flex items-center text-sm font-medium text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
        {{ $t('articles.readFull') }} <ChevronRight class="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform text-blue-600 dark:text-blue-400" />
      </div>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
import { ChevronRight } from 'lucide-vue-next'

const props = defineProps<{ article: any }>()

const gradients = [
  'from-cyan-400 to-blue-500',
  'from-purple-400 to-pink-500',
  'from-orange-400 to-rose-500',
  'from-emerald-400 to-cyan-500',
  'from-blue-400 to-indigo-500',
  'from-rose-400 to-orange-400',
]

const gradient = computed(() => {
  const id = Number(props.article?.id) || 0
  return gradients[id % gradients.length]
})

const readTime = computed(() => {
  const len = props.article?.content?.length || props.article?.summary?.length || 0
  return Math.max(1, Math.ceil(len / 500))
})

function formatDate(d: string) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('en-CA')
}
</script>
