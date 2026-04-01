<template>
  <div class="pt-24 pb-16">
    <div class="max-w-6xl mx-auto px-6">
      <h1 class="text-4xl font-bold mb-4">项目</h1>
      <p class="text-gray-500 dark:text-gray-400 mb-12">我的开源项目与作品展示</p>

      <div v-if="projects.length" class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ProjectCard v-for="project in projects" :key="project.id" :project="project" />
      </div>
      <div v-else class="text-center py-20 text-gray-400">暂无项目</div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { getProjects } = useApi()
const projects = ref<any[]>([])

projects.value = await getProjects().catch(() => []) as any[]

useHead({ title: '项目 - DevVoyage' })
</script>
