<template>
  <div class="pt-32 pb-24">
    <div class="max-w-6xl mx-auto px-6">

      <!-- 顶部：简介 + 头像 -->
      <div class="flex flex-col-reverse lg:flex-row gap-12 items-center lg:items-start mb-20">
        <div class="flex-1">
          <h1 class="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-6">
            {{ $t('about.aboutPrefix') }} <span class="gradient-text">{{ siteConfig?.about_name || siteConfig?.site_title || 'Me' }}</span>
          </h1>
          <div class="space-y-5 text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
            <p class="whitespace-pre-line">{{ siteConfig?.about_intro || siteConfig?.home_description || $t('hero.defaultDescription') }}</p>
          </div>
        </div>
        <div class="flex-shrink-0">
          <div class="w-48 h-48 rounded-3xl bg-white dark:bg-white/[0.04] border border-gray-100 dark:border-white/10 shadow-sm overflow-hidden relative flex items-center justify-center group">
            <div class="absolute inset-0 bg-gradient-to-tr from-blue-100/50 to-purple-100/50 dark:from-blue-900/20 dark:to-purple-900/20 opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div class="absolute w-40 h-40 bg-blue-200/50 dark:bg-blue-700/20 rounded-full blur-[60px] animate-pulse"></div>
            <img v-if="siteConfig?.avatar || siteConfig?.avatar_url" :src="siteConfig.avatar || siteConfig.avatar_url" alt="avatar" class="w-full h-full object-cover relative z-10" />
            <User v-else class="w-24 h-24 text-gray-300 dark:text-gray-600 relative z-10 group-hover:scale-110 transition-transform duration-500" />
          </div>
        </div>
      </div>

      <!-- 中间：经历 + 技能 双栏 -->
      <div class="flex flex-col lg:flex-row gap-16 items-start">

        <!-- 左侧：时间线 -->
        <div class="w-full lg:w-2/5" v-if="experiences.length">
          <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-8 flex items-center gap-3">
            <Briefcase class="w-6 h-6 text-blue-600" /> {{ $t('about.timeline') }}
          </h3>
          <div class="space-y-8 border-l-2 border-gray-200 dark:border-gray-700 pl-6 ml-3 relative">
            <div v-for="(exp, i) in experiences" :key="exp.id" class="relative">
              <div :class="['absolute -left-[35px] top-1 w-4 h-4 rounded-full transition-all', i === 0 ? 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]' : 'bg-gray-100 dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600']"></div>
              <div class="flex items-center gap-2 mb-1">
                <h4 class="text-lg font-bold text-gray-900 dark:text-white">{{ exp.position }} @ {{ exp.orgName }}</h4>
              </div>
              <p :class="['text-sm mb-2', i === 0 ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400']">
                {{ formatDate(exp.startDate) }} - {{ formatDate(exp.endDate) || $t('about.present') }}
              </p>
              <p v-if="exp.description" class="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{{ exp.description }}</p>
            </div>
          </div>
        </div>

        <!-- 右侧：技能网格 -->
        <div :class="experiences.length ? 'w-full lg:w-3/5' : 'w-full'">
          <template v-if="skillCategories.length">
            <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-8 flex items-center gap-3">
              <Layers class="w-6 h-6 text-cyan-500" /> {{ $t('about.techStack') }}
            </h3>
            <div :class="experiences.length ? 'grid grid-cols-1 md:grid-cols-2 gap-5' : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5'">
              <div
                v-for="(cat, catIdx) in skillCategories" :key="cat.id"
                class="bg-white dark:bg-white/[0.04] border border-gray-100 dark:border-white/10 shadow-sm rounded-2xl p-5 hover:shadow-md hover:border-gray-200 dark:hover:border-white/20 transition-all duration-300"
              >
                <h4 class="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2 text-sm">
                  <span class="w-2.5 h-2.5 rounded-full flex-shrink-0" :style="{ background: getSkillColor(catIdx, 0) }"></span>
                  {{ cat.categoryName }}
                </h4>
                <div class="space-y-3">
                  <div v-for="(skill, skillIdx) in cat.skills" :key="skill.id">
                    <div class="flex justify-between text-xs mb-1">
                      <span class="text-gray-600 dark:text-gray-400">{{ skill.skillName }}</span>
                      <span class="font-medium" :style="{ color: getSkillColor(catIdx, skillIdx) }">{{ skill.proficiency }}%</span>
                    </div>
                    <div class="h-1 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div class="h-full rounded-full transition-all duration-700" :style="{ width: skill.proficiency + '%', background: getSkillColor(catIdx, skillIdx) }"></div>
                    </div>
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
import { Briefcase, User, Layers } from 'lucide-vue-next'

const skillPalette = [
  { light: '#3b82f6', dark: '#60a5fa' },  // blue
  { light: '#8b5cf6', dark: '#a78bfa' },  // violet
  { light: '#06b6d4', dark: '#22d3ee' },  // cyan
  { light: '#10b981', dark: '#34d399' },  // emerald
  { light: '#f59e0b', dark: '#fbbf24' },  // amber
  { light: '#ef4444', dark: '#f87171' },  // red
  { light: '#ec4899', dark: '#f472b6' },  // pink
  { light: '#6366f1', dark: '#818cf8' },  // indigo
  { light: '#14b8a6', dark: '#2dd4bf' },  // teal
  { light: '#f97316', dark: '#fb923c' },  // orange
  { light: '#84cc16', dark: '#a3e635' },  // lime
  { light: '#a855f7', dark: '#c084fc' },  // purple
]

const colorMode = useColorMode()
function getSkillColor(catIdx: number, skillIdx: number): string {
  const idx = (catIdx * 7 + skillIdx) % skillPalette.length
  return colorMode.value === 'dark' ? skillPalette[idx].dark : skillPalette[idx].light
}

function formatDate(date: string | Date | null | undefined): string {
  if (!date) return ''
  if (typeof date === 'string') return date.slice(0, 7)
  if (date instanceof Date) return date.toISOString().slice(0, 7)
  return String(date).slice(0, 7)
}

const { getSkillCategories, getExperiences } = useApi()

const siteConfig = useSiteConfig()
const skillCategories = ref<any[]>([])
const experiences = ref<any[]>([])

const { data } = await useAsyncData('about', async () => {
  const [skills, exps] = await Promise.all([
    getSkillCategories().catch(() => []),
    getExperiences().catch(() => []),
  ])
  return { skills, exps }
}, {
  lazy: true,
  getCachedData: (key: any, nuxtApp: any) => nuxtApp.payload.data[key] || nuxtApp.static.data[key],
})

watch(data, (val) => {
  if (!val) return
  skillCategories.value = val.skills as any[] || []
  experiences.value = val.exps as any[] || []
}, { immediate: true })

useHead({
  title: '关于姚兴金 - ' + (siteConfig.value?.site_title || 'ShineGoldYao'),
  meta: [
    { name: 'description', content: '了解姚兴金（ShineGoldYao），全栈开发者、开源爱好者、技术探索者。查看技术栈、工作经历与个人简介。' },
    { name: 'keywords', content: '姚兴金,ShineGoldYao,关于我,全栈开发者,技术栈,工作经历' },
    { property: 'og:title', content: '关于姚兴金 - ShineGoldYao' },
    { property: 'og:description', content: '了解姚兴金，全栈开发者、开源爱好者、技术探索者。' },
    { property: 'og:url', content: 'https://shinegoldyao.store/about' },
  ],
  link: [{ rel: 'canonical', href: 'https://shinegoldyao.store/about' }],
})
</script>
