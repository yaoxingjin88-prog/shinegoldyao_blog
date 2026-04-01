<template>
  <div class="pt-24 pb-16">
    <div class="max-w-6xl mx-auto px-6">
      <h1 class="text-4xl font-bold mb-4">关于我</h1>
      <p class="text-gray-500 dark:text-gray-400 mb-12">{{ siteConfig?.home_intro || '全栈开发者 / 开源爱好者 / 技术博主' }}</p>

      <section v-if="experiences.length" class="mb-16">
        <h2 class="text-2xl font-bold mb-8">经历时间线</h2>
        <div class="relative pl-8 border-l-2 border-blue-200 dark:border-blue-800 space-y-10">
          <div v-for="exp in experiences" :key="exp.id" class="relative">
            <div class="absolute -left-[2.55rem] top-1 w-4 h-4 rounded-full border-2 border-blue-500 bg-white dark:bg-gray-950"></div>
            <div class="glass-card p-5">
              <div class="flex items-center gap-3 mb-2">
                <span :class="['text-xs px-2 py-1 rounded-full', exp.type===1 ? 'bg-green-100 dark:bg-green-900/30 text-green-600' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600']">{{ exp.type===1?'教育':'工作' }}</span>
                <span class="text-sm text-gray-400">{{ exp.startDate?.slice(0,7) }} ~ {{ exp.endDate?.slice(0,7) || '至今' }}</span>
              </div>
              <h3 class="text-lg font-semibold">{{ exp.orgName }}</h3>
              <p class="text-sm text-gray-500 dark:text-gray-400">{{ exp.position }}</p>
              <p v-if="exp.description" class="text-sm text-gray-400 mt-2">{{ exp.description }}</p>
            </div>
          </div>
        </div>
      </section>

      <section v-if="skillCategories.length">
        <h2 class="text-2xl font-bold mb-8">技能概览</h2>
        <div v-for="cat in skillCategories" :key="cat.id" class="mb-8">
          <h3 class="text-lg font-semibold mb-4 flex items-center gap-2">
            <span class="w-3 h-3 rounded-full" :style="{ background: cat.themeColor || '#3b82f6' }"></span>
            {{ cat.categoryName }}
          </h3>
          <div class="space-y-3">
            <div v-for="skill in cat.skills" :key="skill.id" class="flex items-center gap-4">
              <span class="w-28 text-sm font-medium">{{ skill.skillName }}</span>
              <div class="flex-1 bg-gray-200 dark:bg-gray-800 rounded-full h-2.5">
                <div class="h-2.5 rounded-full transition-all duration-1000" :style="{ width: skill.proficiency + '%', background: cat.themeColor || '#3b82f6' }"></div>
              </div>
              <span class="text-sm text-gray-400 w-10 text-right">{{ skill.proficiency }}%</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
const { getSiteConfig, getSkillCategories, getExperiences } = useApi()

const siteConfig = ref<Record<string, string>>({})
const skillCategories = ref<any[]>([])
const experiences = ref<any[]>([])

const [config, skills, exps] = await Promise.all([
  getSiteConfig().catch(() => ({})),
  getSkillCategories().catch(() => []),
  getExperiences().catch(() => []),
])
siteConfig.value = config as Record<string, string>
skillCategories.value = skills as any[]
experiences.value = exps as any[]

useHead({ title: '关于我 - DevVoyage' })
</script>
