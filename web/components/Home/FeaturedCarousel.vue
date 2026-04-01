<template>
  <section v-if="banners.length" class="py-20">
    <div class="max-w-6xl mx-auto px-6">
      <h2 class="section-title">精选推荐</h2>
      <div class="relative overflow-hidden rounded-2xl">
        <div class="flex transition-transform duration-500 ease-out" :style="{ transform: `translateX(-${current * 100}%)` }">
          <div v-for="(banner, i) in banners" :key="i" class="w-full flex-shrink-0">
            <a :href="banner.linkUrl || '#'" class="block relative aspect-[21/9] rounded-2xl overflow-hidden group">
              <img :src="banner.imageUrl" :alt="banner.title" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div class="absolute bottom-8 left-8 text-white">
                <h3 class="text-2xl font-bold mb-2">{{ banner.title }}</h3>
                <p class="text-sm text-white/80">{{ banner.description }}</p>
              </div>
            </a>
          </div>
        </div>
        <div v-if="banners.length > 1" class="absolute bottom-4 right-6 flex gap-2">
          <button @click="prev" class="p-2 rounded-full bg-white/20 backdrop-blur hover:bg-white/40 text-white transition-colors">
            <ChevronLeft class="w-5 h-5" />
          </button>
          <button @click="next" class="p-2 rounded-full bg-white/20 backdrop-blur hover:bg-white/40 text-white transition-colors">
            <ChevronRight class="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'

const props = defineProps<{ banners: any[] }>()
const current = ref(0)
let timer: ReturnType<typeof setInterval>

function next() { current.value = (current.value + 1) % props.banners.length }
function prev() { current.value = (current.value - 1 + props.banners.length) % props.banners.length }

onMounted(() => { if (props.banners.length > 1) timer = setInterval(next, 5000) })
onUnmounted(() => clearInterval(timer))
</script>
