<template>
  <div class="pt-32 pb-24">
    <div class="max-w-6xl mx-auto px-6">
      <div class="flex flex-col lg:flex-row gap-16 items-start animate-fade-in-up">

        <!-- 左侧：简介 + 时间线 -->
        <div class="w-full lg:w-3/5">
          <h1 class="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-6">
            关于 <span class="gradient-text">{{ siteConfig?.about_name || siteConfig?.site_title || 'Me' }}</span>
          </h1>
          <div class="space-y-5 text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
            <p class="whitespace-pre-line">{{ siteConfig?.about_intro || siteConfig?.home_description || '你好，我是一名热爱技术的开发者，专注于现代 Web 开发与开源项目。' }}</p>
          </div>

          <!-- 时间线 -->
          <template v-if="experiences.length">
            <h3 class="text-2xl font-bold text-gray-900 dark:text-white mt-16 mb-8 flex items-center gap-3">
              <Briefcase class="w-6 h-6 text-blue-600" /> 学习轨迹
            </h3>
            <div class="space-y-8 border-l-2 border-gray-200 dark:border-gray-700 pl-6 ml-3 relative">
              <div v-for="(exp, i) in experiences" :key="exp.id" class="relative">
                <div :class="['absolute -left-[35px] top-1 w-4 h-4 rounded-full transition-all', i === 0 ? 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]' : 'bg-gray-100 dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600']"></div>
                <div class="flex items-center gap-2 mb-1">
                  <h4 class="text-lg font-bold text-gray-900 dark:text-white">{{ exp.position }} @ {{ exp.orgName }}</h4>
                </div>
                <p :class="['text-sm mb-2', i === 0 ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400']">
                  {{ exp.startDate?.slice(0, 7) }} - {{ exp.endDate?.slice(0, 7) || '至今' }}
                </p>
                <p v-if="exp.description" class="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{{ exp.description }}</p>
              </div>
            </div>
          </template>
        </div>

        <!-- 右侧：头像 + 技能条 -->
        <div class="w-full lg:w-2/5 space-y-6">
          <!-- 头像 -->
          <div class="w-48 h-48 mx-auto rounded-3xl bg-white dark:bg-white/[0.04] border border-gray-100 dark:border-white/10 shadow-sm overflow-hidden relative flex items-center justify-center group">
            <div class="absolute inset-0 bg-gradient-to-tr from-blue-100/50 to-purple-100/50 dark:from-blue-900/20 dark:to-purple-900/20 opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div class="absolute w-40 h-40 bg-blue-200/50 dark:bg-blue-700/20 rounded-full blur-[60px] animate-pulse"></div>
            <img v-if="siteConfig?.avatar || siteConfig?.avatar_url" :src="siteConfig.avatar || siteConfig.avatar_url" alt="avatar" class="w-full h-full object-cover relative z-10" />
            <User v-else class="w-24 h-24 text-gray-300 dark:text-gray-600 relative z-10 group-hover:scale-110 transition-transform duration-500" />
          </div>

          <!-- 技能条 -->
          <template v-if="skillCategories.length">
            <div v-for="cat in skillCategories" :key="cat.id" class="bg-white dark:bg-white/[0.04] border border-gray-100 dark:border-white/10 shadow-sm rounded-2xl p-6">
              <h4 class="font-bold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full" :style="{ background: cat.themeColor || '#3b82f6' }"></span>
                {{ cat.categoryName }}
              </h4>
              <div class="space-y-4">
                <div v-for="skill in cat.skills" :key="skill.id">
                  <div class="flex justify-between text-sm mb-1.5">
                    <span class="text-gray-600 dark:text-gray-400">{{ skill.skillName }}</span>
                    <span class="font-medium" :style="{ color: cat.themeColor || '#3b82f6' }">{{ skill.proficiency }}%</span>
                  </div>
                  <div class="h-1.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div class="h-full rounded-full transition-all duration-700" :style="{ width: skill.proficiency + '%', background: cat.themeColor || '#3b82f6' }"></div>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Briefcase, User } from 'lucide-vue-next'

const { getSiteConfig, getSkillCategories, getExperiences } = useApi()

const siteConfig = ref<Record<string, string>>({})
const skillCategories = ref<any[]>([])
const experiences = ref<any[]>([])

const { data } = await useAsyncData('about', async () => {
  const [config, skills, exps] = await Promise.all([
    getSiteConfig().catch(() => ({})),
    getSkillCategories().catch(() => []),
    getExperiences().catch(() => []),
  ])
  return { config, skills, exps }
}, { server: true })

siteConfig.value = data.value?.config as Record<string, string> || {}
skillCategories.value = data.value?.skills as any[] || []
experiences.value = data.value?.exps as any[] || []

useHead({ title: '关于我 - ' + (siteConfig.value?.site_title || 'DevVoyage') })
</script>
