<template>
  <div class="pt-24 pb-16">
    <article v-if="article" class="max-w-4xl mx-auto px-6">
      <div class="mb-8">
        <div class="flex items-center gap-3 mb-4">
          <span v-if="article.category" class="text-sm px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">{{ article.category.categoryName }}</span>
          <span v-for="t in article.tags" :key="t.tagId" class="text-sm px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300" :style="t.tag?.themeColor ? { background: t.tag.themeColor + '20', color: t.tag.themeColor } : {}">{{ t.tag?.tagName }}</span>
        </div>
        <h1 class="text-4xl font-bold mb-4">{{ article.title }}</h1>
        <div class="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
          <span>{{ formatDate(article.publishTime || article.createTime) }}</span>
          <span class="flex items-center gap-1"><Eye class="w-4 h-4" /> {{ article.viewCount }} 阅读</span>
        </div>
      </div>

      <div v-if="article.coverUrl" class="mb-8 rounded-2xl overflow-hidden">
        <img :src="article.coverUrl" :alt="article.title" class="w-full max-h-96 object-cover" />
      </div>

      <div class="prose prose-lg dark:prose-invert max-w-none" v-html="article.htmlContent || article.content"></div>
    </article>
    <div v-else class="max-w-4xl mx-auto px-6 text-center py-20 text-gray-400">文章不存在</div>
  </div>
</template>

<script setup lang="ts">
import { Eye } from 'lucide-vue-next'

const route = useRoute()
const { getArticleBySlug } = useApi()
const article = ref<any>(null)

try {
  article.value = await getArticleBySlug(route.params.slug as string)
} catch { article.value = null }

function formatDate(d: string) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })
}

useHead({
  title: article.value ? `${article.value.title} - DevVoyage` : '文章 - DevVoyage',
  meta: [
    { name: 'description', content: article.value?.seoDescription || article.value?.summary || '' },
    { name: 'keywords', content: article.value?.seoKeywords || '' },
  ],
})
</script>
