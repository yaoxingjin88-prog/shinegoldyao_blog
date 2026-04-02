<template>
  <section v-if="categories.length" class="py-12 md:py-16">
    <div class="max-w-6xl mx-auto px-6">
      <div class="flex items-center justify-between mb-10">
        <div>
          <h2 class="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">核心武器库</h2>
          <p class="text-gray-500 dark:text-gray-400">支撑现代 Web 应用的高性能技术栈</p>
        </div>
      </div>
      <div v-for="cat in categories" :key="cat.id" class="mb-10 last:mb-0">
        <h3 class="text-lg font-semibold mb-5 flex items-center gap-2 text-gray-800 dark:text-gray-200">
          <span class="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
          {{ cat.categoryName }}
        </h3>
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          <div
            v-for="skill in cat.skills"
            :key="skill.id"
            class="group relative bg-white dark:bg-white/[0.04] border border-gray-100 dark:border-white/10 rounded-2xl p-5 hover:border-gray-200 dark:hover:border-white/20 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-default overflow-hidden flex flex-col items-center text-center gap-2.5"
          >
            <div class="w-14 h-14 relative z-10 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
              <img
                v-if="getIconUrl(skill)"
                :src="getIconUrl(skill)"
                :alt="skill.skillName"
                class="w-11 h-11 object-contain"
                loading="lazy"
                @error="handleIconError($event, skill)"
              />
              <div
                v-else
                class="w-11 h-11 rounded-xl flex items-center justify-center text-base font-bold text-white"
                :style="{ background: getSkillColor(skill.skillName) }"
              >
                {{ skill.skillName?.charAt(0)?.toUpperCase() }}
              </div>
            </div>
            <div class="relative z-10 flex flex-col items-center">
              <span class="text-sm font-bold text-gray-800 dark:text-gray-100 group-hover:text-gray-900 dark:group-hover:text-white transition-colors mb-1">
                {{ skill.skillName }}
              </span>
              <p v-if="skill.description" class="text-xs text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2">
                {{ skill.description }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{ categories: any[] }>()

const skillColors: Record<string, string> = {
  'HTML': '#E34F26',
  'CSS': '#1572B6',
  'JavaScript': '#F7DF1E',
  'TypeScript': '#3178C6',
  'Vue': '#4FC08D',
  'Nuxt': '#00DC82',
  'React': '#61DAFB',
  'Node': '#339933',
  'NestJS': '#E0234E',
  'MySQL': '#4479A1',
  'Prisma': '#2D3748',
  'Git': '#F05032',
  'Docker': '#2496ED',
  'Redis': '#DC382D',
  'MongoDB': '#47A248',
  'Python': '#3776AB',
  'Rust': '#000000',
  'Go': '#00ADD8',
  'WebAssembly': '#654FF0',
  'Tailwind': '#06B6D4',
  'Element Plus': '#409EFF',
  'Axios': '#5A29E4',
  'SCSS': '#CC6699',
  'UniApp': '#2B9C5A',
}

function getSkillColor(name: string): string {
  return skillColors[name] || '#6366F1'
}

function getIconUrl(skill: any): string | null {
  if (!skill.iconUrl) return null
  if (skill.iconError) return null
  return skill.iconUrl
}

function handleIconError(event: Event, skill: any) {
  const target = event.target as HTMLImageElement
  target.style.display = 'none'
  skill.iconError = true
}
</script>
