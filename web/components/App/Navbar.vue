<template>
  <nav class="fixed top-0 w-full z-50 transition-all duration-300" :class="scrolled ? 'bg-white/95 dark:bg-gray-950/95 md:bg-white/80 md:dark:bg-gray-950/80 md:backdrop-blur-lg border-b border-gray-200 dark:border-gray-800 py-3 shadow-sm' : 'bg-transparent py-5'">
    <div class="max-w-6xl mx-auto px-6 flex items-center justify-between">
      <NuxtLink to="/" class="group flex items-center gap-2 text-xl font-bold">
            <!-- 发光星星 -->
            <span class="relative flex items-center justify-center w-7 h-7 transition-transform duration-300 group-hover:scale-110">
              <span class="hidden md:block absolute inset-0 rounded-full blur-lg opacity-50 dark:opacity-40 animate-pulse bg-blue-400 dark:bg-sky-400"></span>
              <span class="hidden md:block absolute inset-0 rounded-full blur-md opacity-30 dark:opacity-25 transition-all duration-300 group-hover:opacity-50 group-hover:blur-lg bg-blue-400 dark:bg-sky-400"></span>
              <svg viewBox="0 0 24 24" fill="currentColor" class="relative z-10 w-5 h-5 text-blue-500 dark:text-sky-400 drop-shadow-[0_0_6px_rgba(59,130,246,0.6)] dark:drop-shadow-[0_0_5px_rgba(56,189,248,0.5)] transition-all duration-300">
                <path d="M12 1.5C12.5 7.5 16.5 11.5 22.5 12C16.5 12.5 12.5 16.5 12 22.5C11.5 16.5 7.5 12.5 1.5 12C7.5 11.5 11.5 7.5 12 1.5Z" />
              </svg>
            </span>
            <span class="bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-blue-600 to-blue-500 dark:from-gray-100 dark:via-sky-300 dark:to-sky-400">{{ siteTitle }}</span>
      </NuxtLink>
      <div class="hidden md:flex items-center gap-8 min-w-0">
        <NuxtLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="relative text-sm font-medium text-gray-800 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors pb-1 whitespace-nowrap"
          :class="$route.path === item.to ? 'text-blue-600 dark:text-blue-400 after:absolute after:-bottom-2 after:left-1/2 after:-translate-x-1/2 after:w-4 after:h-0.5 after:bg-blue-600 after:dark:bg-blue-400 after:rounded-full' : ''"
        >{{ item.label }}</NuxtLink>
      </div>
      <div class="flex items-center gap-3">
        <NuxtLink to="/login" class="hidden md:inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-full border border-gray-300 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-all">
          <LogIn class="w-4 h-4" />
          {{ $t('nav.login') }}
        </NuxtLink>
        <ClientOnly>
          <button
            @click="switchLang"
            class="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-xs font-bold text-gray-600 dark:text-gray-300"
            :title="locale === 'zh' ? 'Switch to English' : '切换到中文'"
          >
            {{ locale === 'zh' ? 'EN' : '中' }}
          </button>
          <button
            @click="toggleMeteor"
            class="w-9 h-9 flex items-center justify-center rounded-lg transition-colors relative"
            :class="meteorActive ? 'text-amber-500 dark:text-sky-400 bg-amber-50 dark:bg-sky-900/30' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'"
            title="流星雨"
          >
            <Sparkles class="w-5 h-5" />
            <span v-if="meteorActive" class="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-amber-500 dark:bg-sky-400 animate-pulse" />
          </button>
          <button @click="toggleTheme" class="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <Sun v-if="isDark" class="w-5 h-5" />
            <Moon v-else class="w-5 h-5" />
          </button>
          <template #fallback>
            <div class="flex items-center gap-3">
              <div class="w-9 h-9"></div>
              <div class="w-9 h-9"></div>
              <div class="w-9 h-9"></div>
            </div>
          </template>
        </ClientOnly>
        <button @click="mobileOpen = !mobileOpen" class="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
          <Menu class="w-5 h-5" />
        </button>
      </div>
    </div>
    <div v-if="mobileOpen" class="md:hidden bg-white dark:bg-gray-950 border-t dark:border-gray-800 px-6 py-4 space-y-3">
      <NuxtLink v-for="item in navItems" :key="item.to" :to="item.to" class="block text-sm font-medium text-gray-800 dark:text-gray-100" :class="$route.path === item.to ? 'text-blue-600 dark:text-blue-400' : ''" @click="mobileOpen = false">{{ item.label }}</NuxtLink>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { Sun, Moon, Menu, LogIn, Sparkles } from 'lucide-vue-next'

const { meteorActive, toggleMeteor } = useMeteor()

const colorMode = useColorMode()
const scrolled = ref(false)
const mobileOpen = ref(false)
const isDark = computed(() => colorMode.value === 'dark')

const navConfig = useSiteConfig()
const siteTitle = computed(() => navConfig.value?.site_title || 'ShineGoldYao')

const { t, locale, locales, setLocale } = useI18n()
const availableLocales = computed(() => (locales.value as any[]).filter((l: any) => l.code !== locale.value))
function switchLang() {
  const next = locale.value === 'zh' ? 'en' : 'zh'
  setLocale(next)
}

const navItems = computed(() => [
  { to: '/', label: t('nav.home') },
  { to: '/articles', label: t('nav.articles') },
  { to: '/graph', label: t('nav.graph') },
  { to: '/projects', label: t('nav.projects') },
  { to: '/tools', label: t('nav.tools') },
  { to: '/about', label: t('nav.about') },
  { to: '/contact', label: t('nav.contact') },
])

function toggleTheme() {
  colorMode.preference = isDark.value ? 'light' : 'dark'
}

let scrollRaf = 0
function onScroll() {
  if (scrollRaf) return
  scrollRaf = requestAnimationFrame(() => {
    scrolled.value = window.scrollY > 20
    scrollRaf = 0
  })
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
  if (scrollRaf) cancelAnimationFrame(scrollRaf)
})

</script>

<style scoped>
.group:hover .animate-pulse {
  animation-duration: 1.5s;
}
</style>
