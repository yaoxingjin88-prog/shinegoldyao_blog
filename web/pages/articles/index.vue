<template>
  <div class="pt-24 pb-16">
    <div class="max-w-6xl mx-auto px-6">
      <h1 class="text-4xl font-bold mb-4">文章</h1>
      <p class="text-gray-500 dark:text-gray-400 mb-10">分享技术见解与实践经验</p>

      <div class="flex flex-col md:flex-row gap-4 mb-8">
        <input v-model="keyword" type="text" placeholder="搜索文章..." class="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" @keyup.enter="loadData" />
        <select v-model="selectedCategory" class="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900" @change="loadData">
          <option value="">全部分类</option>
          <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.categoryName }}</option>
        </select>
      </div>

      <div class="flex flex-wrap gap-2 mb-8">
        <button v-for="t in tags" :key="t.id" :class="['px-3 py-1.5 rounded-full text-sm transition-colors', selectedTag === t.id ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700']" @click="selectTag(t.id)">
          {{ t.tagName }}
        </button>
      </div>

      <div v-if="articles.length" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ArticleCard v-for="article in articles" :key="article.id" :article="article" />
      </div>
      <div v-else class="text-center py-20 text-gray-400">暂无文章</div>

      <div v-if="total > pageSize" class="flex justify-center mt-10 gap-2">
        <button :disabled="page <= 1" class="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-50" @click="page--; loadData()">上一页</button>
        <span class="px-4 py-2 text-sm text-gray-500">{{ page }} / {{ Math.ceil(total / pageSize) }}</span>
        <button :disabled="page >= Math.ceil(total / pageSize)" class="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-50" @click="page++; loadData()">下一页</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { getArticles, getCategories, getTags } = useApi()

const keyword = ref('')
const selectedCategory = ref('')
const selectedTag = ref('')
const page = ref(1)
const pageSize = 9
const total = ref(0)
const articles = ref<any[]>([])
const categories = ref<any[]>([])
const tags = ref<any[]>([])

async function loadData() {
  const params: Record<string, any> = { page: page.value, pageSize }
  if (keyword.value) params.keyword = keyword.value
  if (selectedCategory.value) params.categoryId = selectedCategory.value
  if (selectedTag.value) params.tagId = selectedTag.value
  const res = await getArticles(params)
  articles.value = res?.list || []
  total.value = res?.total || 0
}

function selectTag(id: string) {
  selectedTag.value = selectedTag.value === id ? '' : id
  page.value = 1
  loadData()
}

const [cats, tgs] = await Promise.all([getCategories().catch(() => []), getTags().catch(() => [])])
categories.value = cats || []
tags.value = tgs || []
await loadData()

useHead({ title: '文章 - DevVoyage' })
</script>
