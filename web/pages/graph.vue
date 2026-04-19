<template>
  <div class="graph-page pt-24 pb-10 px-4 md:px-8 lg:pl-20">
    <div class="max-w-7xl mx-auto">
      <!-- 顶部信息栏 -->
      <div class="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
        <div>
          <h1 class="text-3xl md:text-4xl font-bold bg-gradient-to-r from-violet-600 via-blue-500 to-cyan-500 dark:from-violet-400 dark:via-blue-400 dark:to-cyan-300 bg-clip-text text-transparent">
            知识图谱
          </h1>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">技能 · 标签 · 文章 的关系网络</p>
        </div>
        <div class="flex flex-wrap gap-3">
          <div
            v-for="item in statList"
            :key="item.label"
            class="stat-card"
          >
            <span class="stat-num">{{ item.value }}</span>
            <span class="stat-label">{{ item.label }}</span>
          </div>
        </div>
      </div>

      <!-- 图表卡片容器 -->
      <div class="graph-card">
        <div ref="chartEl" class="graph-chart"></div>

        <!-- loading 遮罩 -->
        <div v-if="loading" class="loading-mask">
          <div class="loading-spinner"></div>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-3">正在构建知识网络…</p>
        </div>

        <!-- 图例 -->
        <div class="legend">
          <div v-for="(cat, i) in legendItems" :key="i" class="legend-item">
            <span class="legend-dot" :style="{ background: cat.color }"></span>
            <span class="legend-name">{{ cat.name }}</span>
          </div>
          <div class="legend-tip">💡 拖拽节点 · 滚轮缩放 · 点击文章跳转</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, reactive, computed, watch } from 'vue'

definePageMeta({ layout: 'default' })
const graphSiteConfig = useSiteConfig()
const graphSiteTitle = computed(() => graphSiteConfig.value?.site_title || 'ShineGoldYao')
useHead({
  title: computed(() => `知识图谱 - ${graphSiteTitle.value}`),
  meta: [{ name: 'description', content: '技能、标签与文章的关系图谱' }],
})

const { getKnowledgeGraph } = useApi()
const router = useRouter()
const colorMode = useColorMode()
const isDark = computed(() => colorMode.value === 'dark')

const chartEl = ref<HTMLElement>()
const loading = ref(true)
const stats = reactive({ skills: 0, tags: 0, articles: 0, links: 0 })
const statList = computed(() => [
  { label: '技能', value: stats.skills },
  { label: '标签', value: stats.tags },
  { label: '文章', value: stats.articles },
  { label: '关系', value: stats.links },
])
// 缓存原始数据，切换主题时重新渲染不重新拉接口
let rawData: any = null

// 6 种类别颜色（对应 backend categories 索引）
const palette = [
  '#a78bfa', // 0 核心
  '#60a5fa', // 1 技能分类
  '#34d399', // 2 技能
  '#fbbf24', // 3 文章分类
  '#f472b6', // 4 标签
  '#22d3ee', // 5 文章
]
const legendItems = computed(() => [
  { name: '核心', color: palette[0] },
  { name: '技能分类', color: palette[1] },
  { name: '技能', color: palette[2] },
  { name: '文章分类', color: palette[3] },
  { name: '标签', color: palette[4] },
  { name: '文章', color: palette[5] },
])

let chartInstance: any = null
let resizeHandler: (() => void) | null = null
async function renderGraph() {
  if (!chartEl.value) return
  loading.value = true

  // 按需加载 echarts，减小首屏体积
  const echarts = await import('echarts/core')
  const { GraphChart } = await import('echarts/charts')
  const { TooltipComponent, LegendComponent, TitleComponent } = await import('echarts/components')
  const { CanvasRenderer } = await import('echarts/renderers')
  echarts.use([GraphChart, TooltipComponent, LegendComponent, TitleComponent, CanvasRenderer])

  rawData = await getKnowledgeGraph().catch(() => null)
  if (!rawData) {
    loading.value = false
    return
  }

  // 统计
  stats.skills = rawData.nodes.filter((n: any) => n.category === 2).length
  stats.tags = rawData.nodes.filter((n: any) => n.category === 4).length
  stats.articles = rawData.nodes.filter((n: any) => n.category === 5).length
  stats.links = rawData.links.length

  drawChart(echarts)

  resizeHandler = () => chartInstance?.resize()
  window.addEventListener('resize', resizeHandler)
  loading.value = false
}

function drawChart(echarts: any) {
  if (!chartEl.value || !rawData) return
  // 首次 init 或主题变化时销毁重建（dark/light 主题）
  if (chartInstance) {
    chartInstance.dispose()
    chartInstance = null
  }
  chartInstance = echarts.init(chartEl.value, isDark.value ? 'dark' : null)

  const dark = isDark.value

  const nodes = rawData.nodes.map((n: any) => ({
    ...n,
    itemStyle: {
      color: n.color || palette[n.category] || '#60a5fa',
      shadowBlur: n.category === 0 ? (dark ? 30 : 18) : (dark ? 10 : 6),
      shadowColor: n.color || palette[n.category] || '#60a5fa',
      borderColor: dark ? 'transparent' : 'rgba(255,255,255,0.7)',
      borderWidth: dark ? 0 : 1,
    },
    label: {
      show: n.symbolSize >= 22 || n.category <= 3,
      color: dark ? '#f1f5f9' : '#1f2937',
      // 亮色背景加白色描边增强对比；暗色不加，避免字周围出现"污渍"
      textBorderColor: dark ? 'transparent' : 'rgba(255,255,255,0.95)',
      textBorderWidth: dark ? 0 : 2,
      fontSize: n.category === 0 ? 16 : 11,
      fontWeight: n.category === 0 ? 700 : 400,
    },
  }))

  const links = rawData.links.map((l: any) => ({
    ...l,
    lineStyle: {
      color: 'source',
      opacity: dark ? 0.35 : 0.5,
      curveness: 0.15,
    },
  }))

  chartInstance.setOption({
    backgroundColor: 'transparent',
    tooltip: {
      show: true,
      backgroundColor: dark ? 'rgba(17, 24, 39, 0.95)' : 'rgba(255, 255, 255, 0.98)',
      borderColor: dark ? '#374151' : '#e5e7eb',
      borderWidth: 1,
      textStyle: { color: dark ? '#f3f4f6' : '#111827', fontSize: 12 },
      formatter: (p: any) => {
        if (p.dataType === 'node') {
          const cat = rawData.categories[p.data.category]?.name
          const secondary = dark ? '#9ca3af' : '#6b7280'
          return `<div><b>${p.data.name}</b><br/><span style="color:${secondary}">类型: ${cat}</span>${
            p.data.value !== undefined ? `<br/><span style="color:${secondary}">热度: ${p.data.value}</span>` : ''
          }${p.data.slug ? `<br/><span style="color:#10b981">点击跳转 →</span>` : ''}</div>`
        }
        return ''
      },
    },
    legend: { show: false },
    series: [
      {
        type: 'graph',
        layout: 'force',
        data: nodes,
        links,
        categories: rawData.categories.map((c: any, i: number) => ({ ...c, itemStyle: { color: palette[i] } })),
        roam: true,
        draggable: true,
        focusNodeAdjacency: true,
        force: {
          repulsion: 180,
          edgeLength: [60, 120],
          gravity: 0.08,
          layoutAnimation: true,
        },
        emphasis: {
          focus: 'adjacency',
          lineStyle: { width: 2, opacity: 0.85 },
          label: { show: true, color: dark ? '#fff' : '#000' },
        },
        labelLayout: { hideOverlap: true },
      },
    ],
  })

  // 点击文章节点跳转（每次 init 后都要重新绑定，因为 dispose 会清空监听）
  chartInstance.on('click', (params: any) => {
    if (params.dataType === 'node' && params.data?.slug) {
      router.push(`/articles/${params.data.slug}`)
    }
  })
}

// 主题切换时重绘
watch(isDark, async () => {
  if (!rawData) return
  const echarts = await import('echarts/core')
  drawChart(echarts)
})

onMounted(() => {
  renderGraph()
})

onBeforeUnmount(() => {
  if (resizeHandler) window.removeEventListener('resize', resizeHandler)
  chartInstance?.dispose()
})
</script>

<style scoped>
/* 页面容器：不覆盖全局 bg，让 default layout 的 bg + 紫青光晕透出来 */
.graph-page {
  position: relative;
  width: 100%;
  min-height: 100vh;
}

/* 顶部统计卡片：与站内其他卡片保持一致的玻璃风格 */
.stat-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  min-width: 72px;
  padding: 8px 16px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(229, 231, 235, 0.8);
  backdrop-filter: blur(8px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}
:global(html.dark) .stat-card {
  background: rgba(2, 6, 23, 0.6);
  border-color: rgba(99, 102, 241, 0.2);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
}
.stat-num {
  font-size: 18px;
  font-weight: 700;
  color: #4f46e5;
  line-height: 1.2;
}
:global(html.dark) .stat-num { color: #a5b4fc; }
.stat-label {
  font-size: 11px;
  color: #6b7280;
}
:global(html.dark) .stat-label { color: #9ca3af; }

/* 图表卡片：作为主要视觉区域的承载容器 */
.graph-card {
  position: relative;
  width: 100%;
  height: calc(100vh - 200px);
  min-height: 520px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(229, 231, 235, 0.8);
  backdrop-filter: blur(8px);
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(99, 102, 241, 0.08);
}
:global(html.dark) .graph-card {
  /* 完全透明，仅保留虚线边框提示区域；避免产生任何灰色蒙层 */
  background: transparent;
  border: 1px dashed rgba(148, 163, 184, 0.15);
  box-shadow: none;
  backdrop-filter: none;
}

.graph-chart {
  position: absolute;
  inset: 0;
}

.loading-mask {
  position: absolute;
  inset: 0;
  z-index: 20;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(4px);
}
:global(html.dark) .loading-mask {
  background: rgba(17, 24, 39, 0.6);
}
.loading-spinner {
  width: 48px;
  height: 48px;
  border: 3px solid rgba(139, 92, 246, 0.2);
  border-top-color: #7c3aed;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
:global(html.dark) .loading-spinner { border-top-color: #a78bfa; }
@keyframes spin { to { transform: rotate(360deg); } }

.legend {
  position: absolute;
  bottom: 16px;
  left: 16px;
  z-index: 10;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(229, 231, 235, 0.8);
  border-radius: 12px;
  padding: 10px 14px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}
:global(html.dark) .legend {
  background: rgba(2, 6, 23, 0.75);
  border-color: rgba(99, 102, 241, 0.22);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
}
.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #4b5563;
}
:global(html.dark) .legend-item { color: #d1d5db; }
.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  box-shadow: 0 0 6px currentColor;
}
.legend-tip {
  font-size: 11px;
  color: #9ca3af;
  margin-top: 4px;
  padding-top: 6px;
  border-top: 1px solid rgba(229, 231, 235, 0.8);
}
:global(html.dark) .legend-tip {
  color: #6b7280;
  border-top-color: rgba(75, 85, 99, 0.5);
}

@media (max-width: 768px) {
  .graph-card {
    height: calc(100vh - 240px);
  }
  .legend {
    bottom: 10px;
    left: 10px;
    right: 10px;
    padding: 8px 12px;
  }
}
</style>
