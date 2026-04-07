<template>
  <div class="pt-24 pb-16">
    <div class="max-w-6xl mx-auto px-6">
      <!-- 页面头部 -->
      <div class="text-center max-w-2xl mx-auto mb-16">
        <h1 class="text-4xl md:text-5xl font-extrabold mb-6">
          技术 <span class="bg-gradient-to-r from-cyan-600 to-emerald-500 bg-clip-text text-transparent">专栏</span>
        </h1>
        <p class="text-gray-500 dark:text-gray-400 text-lg">
          记录我踩过的坑，以及那些让我拍案叫绝的架构设计。
        </p>
      </div>

      <!-- 分类筛选 + 搜索 -->
      <div class="flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
        <div class="flex flex-wrap gap-2">
          <button
            :class="['px-5 py-2 rounded-full text-sm font-medium transition-all shadow-sm', !selectedCategory ? 'bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400' : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800']"
            @click="selectedCategory = ''; page = 1; loadData()"
          >全部</button>
          <button
            v-for="c in categories"
            :key="c.id"
            :class="['px-5 py-2 rounded-full text-sm font-medium transition-all shadow-sm', selectedCategory === c.id ? 'bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400' : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800']"
            @click="selectedCategory = selectedCategory === c.id ? '' : c.id; page = 1; loadData()"
          >{{ c.categoryName }}</button>
        </div>
        <div class="relative w-full md:w-64">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input v-model="keyword" type="text" placeholder="搜索文章..." class="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-full placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all shadow-sm" @keyup.enter="page = 1; loadData()" />
        </div>
      </div>

      <!-- 文章网格 -->
      <div v-if="articles.length" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <ArticleCard v-for="article in articles" :key="article.id" :article="article" />
      </div>
      <div v-else class="text-center py-20 text-gray-400">暂无文章</div>

      <!-- 分页 -->
      <div v-if="total > pageSize" class="flex justify-center mt-12 gap-2">
        <button :disabled="page <= 1" class="px-5 py-2 rounded-full border border-gray-200 dark:border-gray-700 text-sm disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors" @click="page--; loadData()">上一页</button>
        <span class="px-4 py-2 text-sm text-gray-500">{{ page }} / {{ Math.ceil(total / pageSize) }}</span>
        <button :disabled="page >= Math.ceil(total / pageSize)" class="px-5 py-2 rounded-full border border-gray-200 dark:border-gray-700 text-sm disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors" @click="page++; loadData()">下一页</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Search } from 'lucide-vue-next'

const { getArticles, getCategories } = useApi()

const keyword = ref('')
const selectedCategory = ref('')
const page = ref(1)
const pageSize = 9
const total = ref(0)
const articles = ref<any[]>([])
const categories = ref<any[]>([])

async function loadData() {
  const params: Record<string, any> = { page: page.value, pageSize }
  if (keyword.value) params.keyword = keyword.value
  if (selectedCategory.value) params.categoryId = selectedCategory.value
  const res = await getArticles(params)
  articles.value = res?.list || []
  total.value = res?.total || 0
}

categories.value = await getCategories().catch(() => []) || []
await loadData()

useHead({ title: '技术专栏 - DevVoyage' })
</script>
