<template>
  <div class="pt-24 pb-16">
    <div class="max-w-6xl mx-auto px-6">
      <!-- 页面头部 -->
      <div class="text-center max-w-2xl mx-auto mb-16">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-800 text-orange-600 dark:text-orange-400 text-sm mb-6">
          <Star class="w-4 h-4" />
          创造与分享
        </div>
        <h1 class="text-4xl md:text-5xl font-extrabold mb-6">
          开源 <span class="bg-gradient-to-r from-orange-500 to-rose-500 bg-clip-text text-transparent">项目</span>
        </h1>
        <p class="text-gray-500 dark:text-gray-400 text-lg">
          这里不仅有我主导的开源作品，还有那些在开发旅程中给予我巨大启发、值得强烈推荐的卓越开源项目。
        </p>
      </div>

      <!-- 我的创造 -->
      <div v-if="myProjects.length" class="mb-20">
        <div class="flex items-center gap-3 mb-8">
          <div class="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
            <Code2 class="w-5 h-5 text-orange-600 dark:text-orange-400" />
          </div>
          <h2 class="text-2xl font-bold">我的创造</h2>
        </div>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ProjectCard v-for="project in myProjects" :key="project.id" :project="project" />
        </div>
      </div>

      <!-- 灵感与推荐 -->
      <div v-if="recommendedProjects.length">
        <div class="flex items-center gap-3 mb-8">
          <div class="w-10 h-10 rounded-xl bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center">
            <Sparkles class="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
          </div>
          <h2 class="text-2xl font-bold">灵感与推荐</h2>
        </div>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ProjectCard v-for="project in recommendedProjects" :key="project.id" :project="project" />
        </div>
      </div>

      <div v-if="!myProjects.length && !recommendedProjects.length" class="text-center py-20 text-gray-400">暂无项目</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Star, Code2, Sparkles } from 'lucide-vue-next'

const { getProjects } = useApi()
const { data: allProjects } = await useAsyncData('projects', () => getProjects().catch(() => []), {
  getCachedData: (key, nuxtApp) => nuxtApp.payload.data[key] || nuxtApp.static.data[key],
})

const myProjects = computed(() => (allProjects.value || []).filter((p: any) => !p.type || p.type === 0))
const recommendedProjects = computed(() => (allProjects.value || []).filter((p: any) => p.type === 1))

useHead({ title: '开源项目 - DevVoyage' })
</script>
