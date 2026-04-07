<template>
  <div class="group rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden hover:shadow-xl hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-500 flex flex-col">
    <!-- 极客风项目头图 -->
    <div class="h-64 w-full bg-gray-50 dark:bg-gray-800/50 relative overflow-hidden flex items-center justify-center border-b border-gray-100 dark:border-gray-800">
      <div class="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.03)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)]"></div>
      <div class="absolute w-64 h-64 rounded-full blur-[80px] opacity-30 group-hover:opacity-50 transition-opacity duration-700" :class="blobColor"></div>
      <img
        v-if="project.coverUrl"
        :src="project.coverUrl"
        :alt="project.projectName"
        referrerpolicy="no-referrer"
        class="absolute inset-0 w-full h-full object-cover z-10 group-hover:scale-105 transition-transform duration-500"
        @error="($event.target as HTMLImageElement).style.display = 'none'"
      />
      <div v-else class="relative z-10 w-20 h-20 rounded-2xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border border-gray-200 dark:border-gray-700 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500">
        <FolderGit2 :class="['w-10 h-10', iconColor]" />
      </div>
    </div>

    <!-- 项目信息 -->
    <div class="p-8 flex-grow flex flex-col">
      <div class="flex justify-between items-start mb-4">
        <h3 class="text-2xl font-bold group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{{ project.projectName }}</h3>
        <div class="flex gap-2">
          <a v-if="project.giteeUrl" :href="project.giteeUrl" target="_blank" class="w-10 h-10 rounded-full bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 flex items-center justify-center text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" title="Gitee">
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M11.984 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.016 0zm6.09 5.333c.328 0 .593.266.592.593v1.482a.594.594 0 0 1-.593.592H9.777c-.982 0-1.778.796-1.778 1.778v5.63c0 .327.266.592.593.592h5.63c.982 0 1.778-.796 1.778-1.778v-.296a.593.593 0 0 0-.592-.593h-4.15a.592.592 0 0 1-.592-.592v-1.482a.593.593 0 0 1 .593-.592h6.815c.327 0 .593.265.593.592v3.408a4 4 0 0 1-4 4H8.37a.593.593 0 0 1-.593-.593V9.778a4.444 4.444 0 0 1 4.445-4.444h5.852z"/></svg>
          </a>
          <a v-if="project.githubUrl" :href="project.githubUrl" target="_blank" class="w-10 h-10 rounded-full bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 flex items-center justify-center text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" title="GitHub">
            <Github class="w-5 h-5" />
          </a>
          <a v-if="project.demoUrl" :href="project.demoUrl" target="_blank" class="w-10 h-10 rounded-full bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 flex items-center justify-center text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" title="Demo">
            <ExternalLink class="w-5 h-5" />
          </a>
        </div>
      </div>
      <p class="text-gray-600 dark:text-gray-400 leading-relaxed mb-6 flex-grow">{{ project.shortDesc }}</p>
      <div v-if="project.techStack?.length" class="flex flex-wrap gap-2 mt-auto">
        <span v-for="tech in project.techStack" :key="tech" class="px-3 py-1 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md text-xs font-medium text-gray-600 dark:text-gray-400">{{ tech }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { FolderGit2, Github, ExternalLink } from 'lucide-vue-next'

const props = defineProps<{ project: any }>()

const colors = [
  { blob: 'bg-cyan-300 dark:bg-cyan-600', icon: 'text-cyan-600 dark:text-cyan-400' },
  { blob: 'bg-purple-300 dark:bg-purple-600', icon: 'text-purple-600 dark:text-purple-400' },
  { blob: 'bg-orange-300 dark:bg-orange-600', icon: 'text-orange-600 dark:text-orange-400' },
  { blob: 'bg-rose-300 dark:bg-rose-600', icon: 'text-rose-600 dark:text-rose-400' },
  { blob: 'bg-emerald-300 dark:bg-emerald-600', icon: 'text-emerald-600 dark:text-emerald-400' },
  { blob: 'bg-blue-300 dark:bg-blue-600', icon: 'text-blue-600 dark:text-blue-400' },
]

const colorIndex = computed(() => {
  const id = Number(props.project?.id) || 0
  return id % colors.length
})
const blobColor = computed(() => colors[colorIndex.value].blob)
const iconColor = computed(() => colors[colorIndex.value].icon)
</script>
