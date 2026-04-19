<template>
  <!-- 抽屉 -->
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="open"
        class="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
        @click.self="open = false"
      >
        <Transition
          enter-active-class="transition duration-300 ease-out"
          enter-from-class="translate-x-full"
          enter-to-class="translate-x-0"
          leave-active-class="transition duration-200 ease-in"
          leave-from-class="translate-x-0"
          leave-to-class="translate-x-full"
        >
          <aside
            v-if="open"
            class="absolute right-0 top-0 bottom-0 w-full md:w-[640px] bg-white dark:bg-gray-900
                   shadow-2xl flex flex-col"
          >
            <!-- 头部 -->
            <header class="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center">
                  <Sparkles class="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 class="text-base font-bold">{{ $t('articles.aiRead') || 'AI 帮我读' }}</h3>
                  <p class="text-xs text-gray-500 dark:text-gray-400">{{ $t('articles.aiReadDesc') || '思维导图 · 术语解释' }}</p>
                </div>
              </div>
              <button
                class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                @click="open = false"
              >
                <X class="w-5 h-5" />
              </button>
            </header>

            <!-- Tab 切换 -->
            <nav class="flex items-center gap-1 px-4 py-2 border-b border-gray-200 dark:border-gray-800">
              <button
                v-for="tab in tabs"
                :key="tab.key"
                class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors"
                :class="activeTab === tab.key
                  ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 font-medium'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'"
                @click="activeTab = tab.key"
              >
                <component :is="tab.icon" class="w-4 h-4" />
                {{ tab.label }}
              </button>
            </nav>

            <!-- 内容区 -->
            <div class="flex-1 overflow-y-auto p-6">
              <!-- loading -->
              <div v-if="loading" class="flex flex-col items-center justify-center py-20 gap-4">
                <div class="w-12 h-12 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin"></div>
                <p class="text-sm text-gray-500">{{ $t('articles.aiReadLoading') || 'AI 正在阅读文章，请稍候…' }}</p>
              </div>

              <!-- 错误 / 未启用 -->
              <div v-else-if="error" class="text-center py-20">
                <AlertCircle class="w-12 h-12 mx-auto text-orange-400 mb-3" />
                <p class="text-sm text-gray-500">{{ error }}</p>
                <button class="mt-4 px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700" @click="loadData">
                  {{ $t('articles.retry') || '重试' }}
                </button>
              </div>

              <!-- 摘要 Tab -->
              <div v-else-if="activeTab === 'summary'">
                <h4 class="text-xs uppercase tracking-wider text-gray-400 mb-3">TL;DR</h4>
                <p v-if="data?.summary" class="text-sm leading-relaxed text-gray-700 dark:text-gray-200 whitespace-pre-wrap">
                  {{ data.summary }}
                </p>
                <p v-else class="text-sm text-gray-400">{{ $t('articles.aiReadEmpty') || '暂无内容' }}</p>
              </div>

              <!-- 思维导图 Tab -->
              <div v-else-if="activeTab === 'mindmap'">
                <div v-if="data?.mindmap" class="mindmap-wrap overflow-x-auto">
                  <MindmapNode :node="data.mindmap" :root="true" />
                </div>
                <p v-else class="text-sm text-gray-400 text-center py-10">{{ $t('articles.aiReadEmpty') || '暂无内容' }}</p>
              </div>

              <!-- 术语 Tab -->
              <div v-else-if="activeTab === 'terms'">
                <div v-if="data?.terms?.length" class="space-y-3">
                  <div
                    v-for="(t, i) in data.terms"
                    :key="i"
                    class="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 transition-colors"
                  >
                    <div class="flex items-center justify-between gap-2 mb-1.5">
                      <span class="px-2 py-0.5 rounded text-xs font-medium bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300">
                        {{ t.term }}
                      </span>
                      <button
                        class="flex items-center gap-1 text-xs text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        :disabled="termLoading[i]"
                        @click="handleTermClick(i, t.term)"
                      >
                        <Sparkles class="w-3 h-3" />
                        {{ termDetail[i] ? ($t('articles.aiCollapse') || '收起') : ($t('articles.aiExpand') || '追问详情') }}
                      </button>
                    </div>
                    <p class="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{{ t.explanation }}</p>
                    <!-- 追问结果 -->
                    <Transition
                      enter-active-class="transition duration-300 ease-out"
                      enter-from-class="opacity-0 max-h-0"
                      enter-to-class="opacity-100 max-h-[500px]"
                      leave-active-class="transition duration-200 ease-in"
                      leave-from-class="opacity-100 max-h-[500px]"
                      leave-to-class="opacity-0 max-h-0"
                    >
                      <div
                        v-if="termDetail[i] || termLoading[i]"
                        class="mt-3 pt-3 border-t border-dashed border-gray-300 dark:border-gray-600 overflow-hidden"
                      >
                        <div v-if="termLoading[i]" class="flex items-center gap-2 text-xs text-gray-400">
                          <div class="w-3 h-3 rounded-full border-2 border-blue-200 border-t-blue-600 animate-spin"></div>
                          AI 正在分析…
                        </div>
                        <div
                          v-else
                          class="prose prose-sm dark:prose-invert max-w-none text-sm leading-relaxed"
                          v-html="termDetail[i]"
                        ></div>
                      </div>
                    </Transition>
                  </div>
                </div>
                <p v-else class="text-sm text-gray-400 text-center py-10">{{ $t('articles.aiReadEmpty') || '暂无内容' }}</p>
              </div>
            </div>

            <!-- 底部提示 -->
            <footer class="px-6 py-3 border-t border-gray-200 dark:border-gray-800 text-xs text-gray-400 flex items-center gap-2">
              <Info class="w-3.5 h-3.5" />
              {{ $t('articles.aiReadFooter') || 'AI 生成内容仅供参考，结果已缓存 1 小时' }}
            </footer>
          </aside>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { Sparkles, X, Network, BookOpen, FileText, AlertCircle, Info } from 'lucide-vue-next'
import { marked } from 'marked'
import MindmapNode from './MindmapNode.vue'

const props = defineProps<{ slug: string; articleTitle?: string }>()

interface AiReadData {
  mindmap: { title: string; children?: any[] } | null
  terms: { term: string; explanation: string }[]
  summary: string
  enabled: boolean
}

const { aiReadArticle, aiExplainText } = useApi()

// 共享开关：允许其他组件（如航行者 AiChat）触发打开
const open = useAiReaderOpen()
const loading = ref(false)
const error = ref('')
const data = ref<AiReadData | null>(null)
const activeTab = ref<'summary' | 'mindmap' | 'terms'>('summary')
const termLoading = reactive<Record<number, boolean>>({})
const termDetail = reactive<Record<number, string>>({})

// 首次打开时懒加载数据
watch(open, (val) => {
  if (val && !data.value && !loading.value) loadData()
})

// 路由切换（不同文章）时清空缓存
watch(() => props.slug, () => {
  data.value = null
  error.value = ''
  Object.keys(termDetail).forEach((k) => delete termDetail[+k])
  Object.keys(termLoading).forEach((k) => delete termLoading[+k])
})

const tabs = computed(() => [
  { key: 'summary' as const, label: 'TL;DR', icon: FileText },
  { key: 'mindmap' as const, label: '思维导图', icon: Network },
  { key: 'terms' as const, label: '术语解释', icon: BookOpen },
])

async function loadData() {
  loading.value = true
  error.value = ''
  try {
    const res = await aiReadArticle(props.slug, 'all')
    if (!res.enabled) {
      error.value = '服务端未配置 AI API Key'
      return
    }
    if (!res.summary && !res.mindmap && !res.terms?.length) {
      error.value = 'AI 返回为空，请稍后重试'
      return
    }
    data.value = res
  } catch (e: any) {
    error.value = e?.message || 'AI 服务暂不可用'
  } finally {
    loading.value = false
  }
}

/** 术语卡片点击：展开/收起；首次点击调用 AI 获取详细解释 */
async function handleTermClick(index: number, term: string) {
  // 已有内容 → 收起（清空）
  if (termDetail[index]) {
    delete termDetail[index]
    return
  }
  if (termLoading[index]) return
  termLoading[index] = true
  try {
    const context = props.articleTitle || data.value?.summary || ''
    const res = await aiExplainText(term, context)
    if (res.explanation) {
      termDetail[index] = marked.parse(res.explanation) as string
    } else {
      termDetail[index] = '<p class="text-gray-400 text-xs">AI 暂时无法给出更详细解释</p>'
    }
  } catch {
    termDetail[index] = '<p class="text-red-400 text-xs">请求失败，请稍后重试</p>'
  } finally {
    termLoading[index] = false
  }
}
</script>

<style scoped>
.mindmap-wrap {
  min-height: 300px;
  padding: 20px 10px;
}
</style>
