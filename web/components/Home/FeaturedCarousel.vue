<template>
  <section
    v-if="banners.length"
    class="max-w-6xl mx-auto px-6 mt-12 mb-16 relative w-full h-[360px] md:h-[580px] lg:h-[640px] rounded-3xl overflow-hidden shadow-2xl border border-gray-100 dark:border-white/5 group animate-fade-in-up"
    style="animation-delay: 0.4s;"
    @mouseenter="stopAutoplay"
    @mouseleave="startAutoplay"
  >
    <!-- 轮播项 -->
    <div
      v-for="(banner, index) in banners"
      :key="banner.id"
      class="absolute inset-0 transition-all duration-1000 ease-in-out"
      :class="index === current ? 'opacity-100 scale-100 z-10' : 'opacity-0 scale-105 z-0 pointer-events-none'"
    >
      <!-- 背景图或渐变 -->
      <img v-if="banner.imageUrl" :src="banner.imageUrl" :alt="banner.title" class="absolute inset-0 w-full h-full object-cover" loading="lazy" decoding="async" />
      <template v-else>
        <div class="absolute inset-0 dark:hidden" :style="{ background: banner.bgColor || 'linear-gradient(135deg, #e0e7ff 0%, #f3e8ff 50%, #fce7f3 100%)' }"></div>
        <div class="absolute inset-0 hidden dark:block" :style="{ background: banner.bgColorDark || 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%)' }"></div>
      </template>
      
      <!-- 多层光晕效果 - 移动端隐藏 -->
      <div class="hidden md:block absolute -right-32 -top-32 w-[500px] h-[500px] rounded-full bg-purple-300/40 dark:bg-purple-500/30 blur-[120px] mix-blend-multiply dark:mix-blend-screen"></div>
      <div class="hidden md:block absolute -left-20 -bottom-20 w-[400px] h-[400px] rounded-full bg-cyan-300/30 dark:bg-cyan-500/20 blur-[100px] mix-blend-multiply dark:mix-blend-screen"></div>
      
      <!-- 遮罩 -->
      <div class="absolute inset-0 bg-gradient-to-r from-white/95 via-white/60 to-transparent dark:hidden"></div>
      <div class="absolute inset-0 bg-gradient-to-r from-black/95 via-black/60 to-transparent hidden dark:block"></div>
      
      <!-- 装饰网格 - 移动端隐藏 -->
      <div class="hidden md:block absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:40px_40px] dark:bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)]"></div>

      <!-- 文字内容 - 左对齐，垂直居中 -->
      <div class="absolute inset-0 flex items-center">
        <div class="w-full pl-16 md:pl-20 lg:pl-24 pr-8 md:pr-16">
          <div class="max-w-2xl">
            <!-- 标签 -->
            <span class="inline-block px-4 py-1.5 bg-white/90 dark:bg-white/10 md:bg-white/80 md:backdrop-blur-md rounded-full text-xs font-bold text-gray-700 dark:text-gray-200 mb-6 border border-gray-200 dark:border-white/10 shadow-lg uppercase tracking-wider">
              {{ banner.tag || '精选推荐' }}
            </span>
            
            <!-- 标题 -->
            <h2 class="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-extrabold text-gray-900 dark:text-white mb-6 leading-tight drop-shadow-sm">
              {{ banner.title }}
            </h2>
            
            <!-- 描述 -->
            <p v-if="banner.description" class="text-gray-600 dark:text-gray-300 max-w-xl mb-10 text-base md:text-lg leading-relaxed">
              {{ banner.description }}
            </p>
            
            <!-- 按钮 -->
            <a
              v-if="banner.linkUrl"
              :href="banner.linkUrl"
              class="inline-flex items-center gap-2 px-8 py-4 bg-gray-900 dark:bg-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 text-white font-semibold rounded-full transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 text-sm"
            >
              {{ banner.btnText || '阅读专栏' }}
              <ArrowRight class="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </div>

    <!-- 左右箭头 -->
    <button
      v-if="banners.length > 1"
      @click="prev"
      class="absolute left-5 top-1/2 -translate-y-1/2 z-20 w-12 h-12 flex items-center justify-center rounded-full bg-white/70 dark:bg-white/10 backdrop-blur-md text-gray-800 dark:text-white border border-gray-200 dark:border-white/10 shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white dark:hover:bg-white/20 hover:scale-110"
    >
      <ChevronLeft class="w-6 h-6" />
    </button>
    <button
      v-if="banners.length > 1"
      @click="next"
      class="absolute right-5 top-1/2 -translate-y-1/2 z-20 w-12 h-12 flex items-center justify-center rounded-full bg-white/70 dark:bg-white/10 backdrop-blur-md text-gray-800 dark:text-white border border-gray-200 dark:border-white/10 shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white dark:hover:bg-white/20 hover:scale-110"
    >
      <ChevronRight class="w-6 h-6" />
    </button>

    <!-- 底部指示器 -->
    <div v-if="banners.length > 1" class="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2.5">
      <button
        v-for="(_, index) in banners"
        :key="index"
        @click="goTo(index)"
        class="transition-all duration-500 rounded-full h-2.5"
        :class="index === current ? 'w-12 bg-cyan-500 shadow-md shadow-cyan-500/30' : 'w-2.5 bg-gray-400/50 dark:bg-white/30 hover:bg-gray-500 dark:hover:bg-white/50'"
      ></button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-vue-next'

const props = defineProps<{ banners: any[] }>()
const current = ref(0)
let timer: ReturnType<typeof setInterval> | null = null

function next() { current.value = (current.value + 1) % props.banners.length }
function prev() { current.value = (current.value - 1 + props.banners.length) % props.banners.length }
function goTo(i: number) { current.value = i }
function startAutoplay() { if (props.banners.length > 1) timer = setInterval(next, 5000) }
function stopAutoplay() { if (timer) { clearInterval(timer); timer = null } }

onMounted(startAutoplay)
onUnmounted(stopAutoplay)
</script>
