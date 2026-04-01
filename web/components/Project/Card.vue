<template>
  <div class="glass-card overflow-hidden hover-lift group">
    <div class="aspect-video bg-gray-100 dark:bg-gray-800 overflow-hidden">
      <img v-if="project.coverUrl" :src="project.coverUrl" :alt="project.projectName" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
      <div v-else class="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-600">
        <FolderGit2 class="w-12 h-12" />
      </div>
    </div>
    <div class="p-6">
      <h3 class="text-xl font-semibold mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{{ project.projectName }}</h3>
      <p class="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">{{ project.shortDesc }}</p>
      <div v-if="project.techStack?.length" class="flex flex-wrap gap-1.5 mb-4">
        <span v-for="tech in project.techStack" :key="tech" class="text-xs px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">{{ tech }}</span>
      </div>
      <div class="flex items-center gap-3">
        <a v-if="project.githubUrl" :href="project.githubUrl" target="_blank" class="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
          <Github class="w-4 h-4" /> GitHub
        </a>
        <a v-if="project.demoUrl" :href="project.demoUrl" target="_blank" class="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
          <ExternalLink class="w-4 h-4" /> Demo
        </a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { FolderGit2, Github, ExternalLink } from 'lucide-vue-next'
defineProps<{ project: any }>()
</script>
