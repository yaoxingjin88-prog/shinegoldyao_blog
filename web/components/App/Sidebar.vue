<template>
  <ClientOnly>
    <div
      class="hidden lg:flex fixed left-0 top-1/2 -translate-y-1/2 z-40 ml-3"
      @mouseenter="onEnter"
      @mouseleave="onLeave"
    >
      <div
        class="sidebar-panel flex flex-col gap-2 p-2.5 rounded-2xl border backdrop-blur-xl shadow-lg overflow-hidden bg-white/90 dark:bg-gray-900/90 border-gray-200 dark:border-white/10 shadow-black/5 dark:shadow-black/30"
        :class="expanded ? 'is-expanded' : ''"
      >
        <NuxtLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="sidebar-item w-full flex items-center py-3 rounded-xl whitespace-nowrap"
          :class="isActive(item.to)
            ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
            : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5'"
          :title="expanded ? '' : item.label"
        >
          <div class="w-[18px] h-[18px] flex-shrink-0 flex items-center justify-center">
            <component :is="item.icon" class="w-[18px] h-[18px]" />
          </div>
          <span class="sidebar-label text-sm font-medium">{{ item.label }}</span>
        </NuxtLink>
      </div>
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
import { Home, UserCircle, FileText, FolderOpen, MessageCircle } from 'lucide-vue-next'

const route = useRoute()
const expanded = ref(false)
let hoverTimer: ReturnType<typeof setTimeout> | null = null

function onEnter() {
  hoverTimer = setTimeout(() => { expanded.value = true }, 120)
}
function onLeave() {
  if (hoverTimer) { clearTimeout(hoverTimer); hoverTimer = null }
  expanded.value = false
}

const navItems = [
  { to: '/', label: '首页', icon: Home },
  { to: '/about', label: '关于我', icon: UserCircle },
  { to: '/articles', label: '文章', icon: FileText },
  { to: '/projects', label: '项目', icon: FolderOpen },
  { to: '/contact', label: '联系', icon: MessageCircle },
]

function isActive(path: string): boolean {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}
</script>

<style scoped>
.sidebar-panel {
  width: 52px;
  transition: width 0.25s cubic-bezier(0.25, 0.1, 0.25, 1);
}
.sidebar-panel.is-expanded {
  width: 140px;
}
.sidebar-label {
  opacity: 0;
  width: 0;
  overflow: hidden;
  transition: opacity 0.2s ease, width 0.25s cubic-bezier(0.25, 0.1, 0.25, 1);
}
.sidebar-panel.is-expanded .sidebar-label {
  opacity: 1;
  width: 60px;
}
.sidebar-item {
  padding-left: 7px;
  padding-right: 7px;
  gap: 0;
  transition: background-color 0.15s, color 0.15s, gap 0.25s cubic-bezier(0.25, 0.1, 0.25, 1), padding-left 0.25s cubic-bezier(0.25, 0.1, 0.25, 1), padding-right 0.25s cubic-bezier(0.25, 0.1, 0.25, 1);
}
.sidebar-panel.is-expanded .sidebar-item {
  padding-left: 12px;
  padding-right: 12px;
  gap: 10px;
}
</style>
