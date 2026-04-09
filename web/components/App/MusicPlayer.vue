<template>
  <ClientOnly>
    <div class="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      <!-- 展开面板 -->
      <Transition name="player-panel">
        <div
          v-if="expanded"
          class="w-80 rounded-2xl border shadow-2xl overflow-hidden
                 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl
                 border-gray-200/60 dark:border-white/10"
        >
          <!-- 封面区域 -->
          <div class="relative h-44 overflow-hidden">
            <div
              class="absolute inset-0 transition-all duration-700"
              :style="{ background: currentTrack?.gradient || 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)' }"
            ></div>
            <div class="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:20px_20px]"></div>

            <!-- 旋转唱片 -->
            <div class="absolute inset-0 flex items-center justify-center">
              <div
                class="w-28 h-28 rounded-full border-4 border-white/20 shadow-2xl flex items-center justify-center transition-transform duration-500"
                :class="isPlaying ? 'animate-spin-slow' : ''"
                :style="{ background: `conic-gradient(from 0deg, rgba(0,0,0,0.3), rgba(0,0,0,0.1), rgba(0,0,0,0.3), rgba(0,0,0,0.1), rgba(0,0,0,0.3))` }"
              >
                <div class="w-12 h-12 rounded-full bg-white/90 dark:bg-gray-800/90 flex items-center justify-center shadow-inner">
                  <Music class="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </div>

            <!-- 光晕 -->
            <div class="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-white/20 blur-2xl"></div>
            <div class="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-black/10 blur-2xl"></div>
          </div>

          <!-- 歌曲信息 -->
          <div class="px-5 pt-4 pb-2">
            <h4 class="font-bold text-sm text-gray-900 dark:text-white truncate">{{ currentTrack?.title || '未知歌曲' }}</h4>
            <p class="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">{{ currentTrack?.artist || '未知歌手' }}</p>
          </div>

          <!-- 进度条 -->
          <div class="px-5 py-2">
            <div
              class="relative w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full cursor-pointer group"
              @click="seekTo"
              ref="progressBarRef"
            >
              <div
                class="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-200"
                :style="{ width: progressPercent + '%' }"
              ></div>
              <div
                class="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white shadow-md border-2 border-purple-500 opacity-0 group-hover:opacity-100 transition-opacity"
                :style="{ left: `calc(${progressPercent}% - 6px)` }"
              ></div>
            </div>
            <div class="flex justify-between mt-1.5 text-[10px] text-gray-400 dark:text-gray-500 font-mono">
              <span>{{ formatTime(currentTime) }}</span>
              <span>{{ formatTime(duration) }}</span>
            </div>
          </div>

          <!-- 控制按钮 -->
          <div class="px-5 pb-4 flex items-center justify-center gap-5">
            <button @click="prevTrack" class="p-1.5 rounded-full text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-all">
              <SkipBack class="w-4 h-4" />
            </button>
            <button
              @click="togglePlay"
              class="w-11 h-11 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-105
                     bg-gradient-to-br from-purple-500 to-pink-500 text-white"
            >
              <Pause v-if="isPlaying" class="w-5 h-5" />
              <Play v-else class="w-5 h-5 ml-0.5" />
            </button>
            <button @click="nextTrack" class="p-1.5 rounded-full text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-all">
              <SkipForward class="w-4 h-4" />
            </button>
          </div>

          <!-- 音量 -->
          <div class="px-5 pb-4 flex items-center gap-2">
            <button @click="toggleMute" class="text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
              <VolumeX v-if="isMuted" class="w-3.5 h-3.5" />
              <Volume2 v-else class="w-3.5 h-3.5" />
            </button>
            <input
              type="range" min="0" max="100" :value="isMuted ? 0 : volume"
              @input="setVolume"
              class="flex-1 h-1 accent-purple-500 cursor-pointer"
            />
          </div>

          <!-- 播放列表 -->
          <div class="border-t border-gray-100 dark:border-gray-800">
            <button
              @click="showPlaylist = !showPlaylist"
              class="w-full px-5 py-2.5 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
            >
              <span class="flex items-center gap-1.5"><ListMusic class="w-3.5 h-3.5" /> 播放列表 ({{ playlist.length }})</span>
              <ChevronUp class="w-3.5 h-3.5 transition-transform" :class="showPlaylist ? '' : 'rotate-180'" />
            </button>
            <Transition name="playlist">
              <div v-if="showPlaylist" class="max-h-40 overflow-y-auto">
                <button
                  v-for="(track, index) in playlist"
                  :key="index"
                  @click="playTrack(index)"
                  class="w-full px-5 py-2 flex items-center gap-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  :class="currentIndex === index ? 'bg-purple-50 dark:bg-purple-900/20' : ''"
                >
                  <div
                    class="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                    :class="currentIndex === index ? 'bg-purple-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'"
                  >
                    <template v-if="currentIndex === index && isPlaying">
                      <div class="flex items-end gap-[2px] h-3">
                        <span class="w-[2px] bg-white rounded-full animate-eq-1"></span>
                        <span class="w-[2px] bg-white rounded-full animate-eq-2"></span>
                        <span class="w-[2px] bg-white rounded-full animate-eq-3"></span>
                      </div>
                    </template>
                    <template v-else>{{ index + 1 }}</template>
                  </div>
                  <div class="min-w-0 flex-1">
                    <p class="text-xs font-medium truncate" :class="currentIndex === index ? 'text-purple-600 dark:text-purple-400' : 'text-gray-700 dark:text-gray-300'">{{ track.title }}</p>
                    <p class="text-[10px] text-gray-400 truncate">{{ track.artist }}</p>
                  </div>
                </button>
              </div>
            </Transition>
          </div>
        </div>
      </Transition>

      <!-- 浮动按钮 -->
      <button
        @click="expanded = !expanded"
        class="w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 border
               bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl
               border-gray-200/60 dark:border-white/10
               hover:shadow-purple-500/20 dark:hover:shadow-purple-400/20 hover:shadow-xl"
        :class="[isPlaying ? 'ring-2 ring-purple-400/50 ring-offset-2 ring-offset-transparent animate-spin-fab' : '']"
      >
        <div v-if="isPlaying" class="absolute inset-0 rounded-full animate-ping-slow bg-purple-400/20"></div>
        <Music class="w-5 h-5 text-purple-600 dark:text-purple-400 relative z-10" />
      </button>
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
import { Music, Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, ListMusic, ChevronUp } from 'lucide-vue-next'

const expanded = ref(false)
const showPlaylist = ref(false)
const isPlaying = ref(false)
const isMuted = ref(false)
const volume = ref(70)
const currentTime = ref(0)
const duration = ref(0)
const currentIndex = ref(0)
const progressBarRef = ref<HTMLElement | null>(null)

let audio: HTMLAudioElement | null = null

const { getMusicList } = useApi()
const playlist = ref<any[]>([])

onMounted(async () => {
  try {
    const data = await getMusicList()
    if (data && data.length) playlist.value = data
  } catch { /* fallback empty */ }
})

const currentTrack = computed(() => playlist.value[currentIndex.value])

function initAudio() {
  if (!audio) {
    audio = new Audio()
    audio.volume = volume.value / 100
    audio.addEventListener('timeupdate', () => {
      currentTime.value = audio!.currentTime
      duration.value = audio!.duration || 0
    })
    audio.addEventListener('ended', nextTrack)
    audio.addEventListener('loadedmetadata', () => {
      duration.value = audio!.duration || 0
    })
  }
}

function togglePlay() {
  initAudio()
  if (!audio) return
  if (isPlaying.value) {
    audio.pause()
    isPlaying.value = false
  } else {
    if (!audio.src || audio.src !== currentTrack.value?.url) {
      audio.src = currentTrack.value?.url || ''
    }
    audio.play().catch(() => {})
    isPlaying.value = true
  }
}

function playTrack(index: number) {
  initAudio()
  if (!audio) return
  currentIndex.value = index
  audio.src = playlist.value[index]?.url || ''
  audio.play().catch(() => {})
  isPlaying.value = true
}

function nextTrack() {
  const next = (currentIndex.value + 1) % playlist.value.length
  playTrack(next)
}

function prevTrack() {
  const prev = (currentIndex.value - 1 + playlist.value.length) % playlist.value.length
  playTrack(prev)
}

function toggleMute() {
  if (!audio) return
  isMuted.value = !isMuted.value
  audio.muted = isMuted.value
}

function setVolume(e: Event) {
  const val = Number((e.target as HTMLInputElement).value)
  volume.value = val
  if (audio) {
    audio.volume = val / 100
    if (val > 0) isMuted.value = false
  }
}

function seekTo(e: MouseEvent) {
  if (!audio || !progressBarRef.value) return
  const rect = progressBarRef.value.getBoundingClientRect()
  const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
  audio.currentTime = percent * (audio.duration || 0)
}

const progressPercent = computed(() => {
  if (!duration.value) return 0
  return (currentTime.value / duration.value) * 100
})

function formatTime(sec: number) {
  if (!sec || isNaN(sec)) return '0:00'
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

onUnmounted(() => {
  if (audio) {
    audio.pause()
    audio.src = ''
    audio = null
  }
})
</script>

<style scoped>
@keyframes spin-slow {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
.animate-spin-slow {
  animation: spin-slow 8s linear infinite;
}
.animate-spin-fab {
  animation: spin-slow 6s linear infinite;
}

@keyframes ping-slow {
  0% { transform: scale(1); opacity: 0.4; }
  100% { transform: scale(1.5); opacity: 0; }
}
.animate-ping-slow {
  animation: ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite;
}

@keyframes eq-1 { 0%,100% { height: 3px; } 50% { height: 10px; } }
@keyframes eq-2 { 0%,100% { height: 8px; } 50% { height: 4px; } }
@keyframes eq-3 { 0%,100% { height: 5px; } 50% { height: 12px; } }
.animate-eq-1 { animation: eq-1 0.5s ease-in-out infinite; }
.animate-eq-2 { animation: eq-2 0.6s ease-in-out infinite; }
.animate-eq-3 { animation: eq-3 0.4s ease-in-out infinite; }

.player-panel-enter-active { transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
.player-panel-leave-active { transition: all 0.2s ease-in; }
.player-panel-enter-from { opacity: 0; transform: translateY(16px) scale(0.95); }
.player-panel-leave-to { opacity: 0; transform: translateY(8px) scale(0.98); }

.playlist-enter-active { transition: all 0.25s ease-out; }
.playlist-leave-active { transition: all 0.15s ease-in; }
.playlist-enter-from, .playlist-leave-to { opacity: 0; max-height: 0; }
.playlist-enter-to, .playlist-leave-from { max-height: 160px; }

input[type="range"] {
  -webkit-appearance: none;
  appearance: none;
  background: transparent;
}
input[type="range"]::-webkit-slider-runnable-track {
  height: 4px;
  border-radius: 2px;
  background: linear-gradient(to right, #a855f7, #ec4899);
}
input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: white;
  border: 2px solid #a855f7;
  margin-top: -4px;
  cursor: pointer;
}

::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 2px; }
.dark ::-webkit-scrollbar-thumb { background: #374151; }
</style>
