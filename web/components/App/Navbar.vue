<template>
  <nav class="fixed top-0 w-full z-50 transition-all duration-300" :class="scrolled ? 'bg-white/80 dark:bg-gray-950/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800 py-3 shadow-sm' : 'bg-transparent py-5'">
    <div class="max-w-6xl mx-auto px-6 flex items-center justify-between">
      <NuxtLink to="/" class="text-xl font-bold gradient-text">{{ siteTitle }}</NuxtLink>
      <div class="hidden md:flex items-center gap-8">
        <NuxtLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="relative text-sm font-medium text-gray-800 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors pb-1"
          :class="$route.path === item.to ? 'text-blue-600 dark:text-blue-400 after:absolute after:-bottom-2 after:left-1/2 after:-translate-x-1/2 after:w-4 after:h-0.5 after:bg-blue-600 after:dark:bg-blue-400 after:rounded-full' : ''"
        >{{ item.label }}</NuxtLink>
      </div>
      <div class="flex items-center gap-4">
        <button @click="toggleTheme" class="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          <Sun v-if="isDark" class="w-5 h-5" />
          <Moon v-else class="w-5 h-5" />
        </button>
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
import { Sun, Moon, Menu } from 'lucide-vue-next'

const { getSiteConfig } = useApi()
const colorMode = useColorMode()
const scrolled = ref(false)
const mobileOpen = ref(false)
const isDark = computed(() => colorMode.value === 'dark')
const siteTitle = ref('')

const navItems = [
  { to: '/', label: '首页' },
  { to: '/about', label: '关于我' },
  { to: '/articles', label: '文章' },
  { to: '/projects', label: '项目' },
  { to: '/contact', label: '联系' },
]

function toggleTheme() {
  colorMode.preference = isDark.value ? 'light' : 'dark'
}

onMounted(async () => {
  window.addEventListener('scroll', () => { scrolled.value = window.scrollY > 20 })
  try {
    const config = await getSiteConfig()
    if (config?.site_title) siteTitle.value = config.site_title
  } catch {}
})

</script>
