<template>
  <div class="pt-24 pb-16">
    <div class="max-w-6xl mx-auto px-6">
      <!-- 页面头部 -->
      <div class="text-center max-w-2xl mx-auto mb-16">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-100 dark:bg-teal-900/30 border border-teal-200 dark:border-teal-800 text-teal-600 dark:text-teal-400 text-sm mb-6">
          <Compass class="w-4 h-4" />
          效率加速器
        </div>
        <h1 class="text-4xl md:text-5xl font-extrabold mb-6">
          实用 <span class="bg-gradient-to-r from-teal-500 to-cyan-500 bg-clip-text text-transparent">工具</span>
        </h1>
        <p class="text-gray-500 dark:text-gray-400 text-lg">
          精心收集的开发者常用工具与资源导航，助你在开发旅途中事半功倍。
        </p>
      </div>

      <!-- 搜索框 -->
      <div class="max-w-md mx-auto mb-12">
        <div class="relative">
          <Search class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="搜索工具..."
            class="w-full pl-12 pr-4 py-3 rounded-xl bg-white dark:bg-white/[0.04] border border-gray-200 dark:border-white/10 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 dark:focus:border-teal-400 transition-all"
          />
        </div>
      </div>

      <!-- 工具分类 -->
      <div v-for="category in filteredCategories" :key="category.name" class="mb-14">
        <div class="flex items-center gap-3 mb-6">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center" :class="category.bgClass">
            <component :is="category.icon" class="w-5 h-5" :class="category.iconClass" />
          </div>
          <h2 class="text-2xl font-bold">{{ category.name }}</h2>
          <span class="text-sm text-gray-400 dark:text-gray-500">{{ category.tools.length }} 个工具</span>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <a
            v-for="tool in category.tools"
            :key="tool.name"
            :href="tool.url"
            target="_blank"
            rel="noopener noreferrer"
            class="group bg-white dark:bg-white/[0.04] border border-gray-100 dark:border-white/10 rounded-2xl p-5 hover:shadow-lg hover:border-gray-200 dark:hover:border-white/20 hover:-translate-y-0.5 transition-all duration-300"
          >
            <div class="flex items-start gap-4">
              <div class="w-11 h-11 rounded-xl flex-shrink-0 flex items-center justify-center text-2xl" :class="tool.bgClass || 'bg-gray-100 dark:bg-gray-800'">
                {{ tool.emoji }}
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1">
                  <h3 class="font-bold text-gray-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors truncate">{{ tool.name }}</h3>
                  <ExternalLink class="w-3.5 h-3.5 text-gray-300 dark:text-gray-600 group-hover:text-teal-500 dark:group-hover:text-teal-400 transition-colors flex-shrink-0" />
                </div>
                <p class="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{{ tool.desc }}</p>
              </div>
            </div>
          </a>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="filteredCategories.length === 0" class="text-center py-20">
        <SearchX class="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
        <p class="text-gray-400 dark:text-gray-500">没有找到匹配的工具</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Compass, Search, ExternalLink, SearchX, Code2, Palette, Image, BookOpen, Globe, Wrench } from 'lucide-vue-next'
import type { Component } from 'vue'

const iconMap: Record<string, Component> = { Code2, Palette, Image, BookOpen, Globe, Wrench, Compass }

useHead({ title: '实用工具 - DevVoyage' })

const { getTools } = useApi()
const { data: apiCategories } = await useAsyncData('tools', () => getTools().catch(() => []))

const categories = computed(() => {
  const list = apiCategories.value || []
  return list
    .filter((cat: any) => cat.tools?.length > 0)
    .map((cat: any) => ({
      name: cat.categoryName,
      icon: iconMap[cat.icon] || Compass,
      bgClass: cat.bgClass || 'bg-gray-100 dark:bg-gray-800',
      iconClass: cat.iconClass || 'text-gray-600 dark:text-gray-400',
      tools: (cat.tools || []).map((t: any) => ({
        name: t.name,
        emoji: t.emoji || '🔗',
        desc: t.description || '',
        url: t.url || '#',
      })),
    }))
})

const searchQuery = ref('')

const filteredCategories = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return categories.value
  return categories.value
    .map((cat: any) => ({
      ...cat,
      tools: cat.tools.filter(
        (t: any) => t.name.toLowerCase().includes(q) || t.desc.toLowerCase().includes(q)
      ),
    }))
    .filter((cat: any) => cat.tools.length > 0)
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
