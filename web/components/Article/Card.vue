<template>
  <NuxtLink :to="`/articles/${article.slug}`" class="glass-card overflow-hidden hover-lift group block">
    <div class="aspect-video bg-gray-100 dark:bg-gray-800 overflow-hidden">
      <img v-if="article.coverUrl" :src="article.coverUrl" :alt="article.title" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
      <div v-else class="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-600">
        <FileText class="w-12 h-12" />
      </div>
    </div>
    <div class="p-5">
      <div class="flex items-center gap-2 mb-3">
        <span v-if="article.category" class="text-xs px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">{{ article.category.categoryName }}</span>
        <span v-if="article.isTop" class="text-xs px-2 py-1 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400">置顶</span>
      </div>
      <h3 class="text-lg font-semibold mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{{ article.title }}</h3>
      <p class="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4">{{ article.summary }}</p>
      <div class="flex items-center justify-between text-xs text-gray-400">
        <span>{{ formatDate(article.publishTime || article.createTime) }}</span>
        <div class="flex items-center gap-1"><Eye class="w-3.5 h-3.5" /> {{ article.viewCount || 0 }}</div>
      </div>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
import { FileText, Eye } from 'lucide-vue-next'

defineProps<{ article: any }>()

function formatDate(d: string) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('zh-CN', { year: 'numeric', month: 'short', day: 'numeric' })
}
</script>
