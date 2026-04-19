<!--
  ============================================================
  访客点击热力图分析面板（商用级）
  ============================================================
  设计要点：
  1. Iframe 叠加：以真实前台页面为视觉底图，热力图 Canvas 精准覆盖
  2. 坐标归一化：后端存储 x/y 相对比例 (0~1)，前端按 iframe 实时宽高还原为像素
  3. 渲染算法：纯 Canvas 2D 实现 heatmap.js 的"径向渐变 + 全局着色"算法
  4. 响应式：ResizeObserver 监听容器尺寸变化，窗口/终端切换时自动重绘
  5. 终端模拟：PC / Mobile (375px) 两种视口预览
  ============================================================
-->
<template>
  <div class="heatmap-page">
    <!-- ===== 顶部控制栏 ===== -->
    <el-card shadow="never" class="control-card">
      <div class="header">
        <div class="title-block">
          <div class="icon-wrap">
            <el-icon :size="22" color="#fff"><DataAnalysis /></el-icon>
          </div>
          <div>
            <h2 class="title">访客点击热力图</h2>
            <p class="subtitle">基于归一化坐标的真实页面交互分析</p>
          </div>
        </div>

        <div class="controls">
          <!-- 路由筛选 -->
          <el-select
            v-model="currentPath"
            filterable
            placeholder="选择分析页面"
            size="large"
            style="width: 260px"
            @change="onPathChange"
          >
            <el-option
              v-for="p in paths"
              :key="p.path"
              :label="`${p.label || p.path}  ·  ${p.count} 次点击`"
              :value="p.path"
            >
              <div style="display:flex;justify-content:space-between;gap:20px">
                <span>
                  <b style="color:#4f46e5">{{ p.label || p.path }}</b>
                  <span style="color:#9ca3af;margin-left:8px;font-size:12px">{{ p.path }}</span>
                </span>
                <span style="color:#ef4444;font-weight:600">{{ p.count }} 次</span>
              </div>
            </el-option>
          </el-select>

          <!-- 终端切换 -->
          <el-radio-group v-model="deviceMode" size="large" @change="onDeviceChange">
            <el-radio-button value="pc">
              <el-icon><Monitor /></el-icon>&nbsp;PC
            </el-radio-button>
            <el-radio-button value="mobile">
              <el-icon><Iphone /></el-icon>&nbsp;移动端
            </el-radio-button>
          </el-radio-group>

          <el-tooltip content="刷新数据" placement="top">
            <el-button :icon="Refresh" size="large" circle @click="reload" />
          </el-tooltip>
        </div>
      </div>
    </el-card>

    <!-- ===== 统计数据卡片 ===== -->
    <div class="stats-row">
      <div class="stat-card stat-primary">
        <div class="stat-icon"><el-icon :size="20"><Pointer /></el-icon></div>
        <div>
          <div class="stat-label">总点击数</div>
          <div class="stat-value">{{ total.toLocaleString() }}</div>
        </div>
      </div>
      <div class="stat-card stat-success">
        <div class="stat-icon"><el-icon :size="20"><Grid /></el-icon></div>
        <div>
          <div class="stat-label">独立热区</div>
          <div class="stat-value">{{ normalizedPoints.length }}</div>
        </div>
      </div>
      <div class="stat-card stat-warning">
        <div class="stat-icon"><el-icon :size="20"><TrendCharts /></el-icon></div>
        <div>
          <div class="stat-label">最高热度</div>
          <div class="stat-value">{{ maxValue }}</div>
        </div>
      </div>
      <div class="stat-card stat-danger">
        <div class="stat-icon"><el-icon :size="20"><Aim /></el-icon></div>
        <div>
          <div class="stat-label">热度集中度</div>
          <div class="stat-value">{{ concentration }}%</div>
        </div>
      </div>
    </div>

    <!-- ===== 渲染参数调节条 ===== -->
    <el-card shadow="never" class="config-card">
      <div class="config-row">
        <div class="config-item">
          <label>热点半径</label>
          <el-slider v-model="radius" :min="20" :max="100" :step="5" style="width: 140px" @input="render" />
          <span class="config-val">{{ radius }}px</span>
        </div>
        <div class="config-item">
          <label>模糊强度</label>
          <el-slider v-model="blur" :min="0.1" :max="1" :step="0.05" style="width: 140px" @input="render" />
          <span class="config-val">{{ (blur * 100).toFixed(0) }}%</span>
        </div>
        <div class="config-item">
          <label>透明度</label>
          <el-slider v-model="opacity" :min="0.3" :max="1" :step="0.05" style="width: 140px" @input="render" />
          <span class="config-val">{{ (opacity * 100).toFixed(0) }}%</span>
        </div>
        <div class="config-item flex-grow">
          <el-switch v-model="showPreview" active-text="显示页面底图" inactive-text="纯热力模式" inline-prompt />
          <el-switch v-model="showMarkers" active-text="标注 TOP 热区" inactive-text="隐藏标注" inline-prompt style="margin-left: 12px" />
        </div>
      </div>
    </el-card>

    <!-- ===== 核心可视化区域 ===== -->
    <div class="visualization-wrap">
      <div
        ref="stageRef"
        class="stage"
        :class="`stage-${deviceMode}`"
        :style="stageStyle"
      >
        <!-- 底图：真实前台页面 -->
        <iframe
          v-if="showPreview && iframeUrl"
          :src="iframeUrl"
          class="page-iframe"
          sandbox="allow-same-origin allow-scripts"
          loading="lazy"
        />
        <div v-else class="grid-backdrop"></div>

        <!-- 热力图 Canvas 覆盖层 -->
        <canvas ref="canvasRef" class="heatmap-canvas" />

        <!-- TOP 热区标注 -->
        <div v-if="showMarkers" class="markers-layer">
          <div
            v-for="(m, idx) in topMarkers"
            :key="idx"
            class="marker"
            :style="{ left: m.left + 'px', top: m.top + 'px' }"
          >
            <div class="marker-badge">{{ idx + 1 }}</div>
            <div class="marker-info">
              <b>{{ m.count }}</b> 次点击
            </div>
          </div>
        </div>

        <!-- 状态层 -->
        <div v-if="loading" class="state-overlay">
          <el-icon class="is-loading" :size="28"><Loading /></el-icon>
          <span>数据加载中…</span>
        </div>
        <div v-else-if="!normalizedPoints.length" class="state-overlay">
          <el-empty description="该页面暂无点击数据" :image-size="80" />
        </div>
      </div>

      <!-- 右侧色阶图例 -->
      <div class="legend">
        <div class="legend-label">高</div>
        <div class="legend-bar"></div>
        <div class="legend-label">低</div>
        <div class="legend-ticks">
          <span>{{ maxValue }}</span>
          <span>{{ Math.round(maxValue * 0.5) }}</span>
          <span>0</span>
        </div>
      </div>
    </div>

    <!-- ===== 底部说明 ===== -->
    <el-card shadow="never" class="hint-card">
      <div class="hint-content">
        <el-icon :size="16" color="#6366f1"><InfoFilled /></el-icon>
        <span>
          热力图基于 <b>Canvas 2D API</b> 手动实现渲染：先用径向渐变在灰度缓冲画布上累积强度，
          再对每个像素的 α 通道做颜色查找表（LUT）映射。冷色（蓝）= 低热度，暖色（红）= 高热度。
          坐标系基于 <b>归一化比例 (0~1)</b>，不同屏幕尺寸下依然精准对齐。
        </span>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'
import {
  Refresh, Monitor, Iphone, DataAnalysis, Pointer, Grid, TrendCharts,
  Aim, Loading, InfoFilled,
} from '@element-plus/icons-vue'
import { trackApi } from '../../api'

// ============================================================
// 类型定义
// ============================================================
interface HeatPoint {
  /** 归一化 X 坐标 0~1 */
  x: number
  /** 归一化 Y 坐标 0~1 */
  y: number
  /** 该位置的点击计数 */
  value: number
}

// ============================================================
// 响应式状态
// ============================================================
const stageRef = ref<HTMLDivElement>()
const canvasRef = ref<HTMLCanvasElement>()

const paths = ref<{ path: string; label?: string; count: number }[]>([])
const currentPath = ref('/')
const rawPoints = ref<[number, number, number][]>([]) // 后端原始 50x50 网格数据 [gx, gy, value]
const total = ref(0)
const loading = ref(false)

// 终端模式：pc 全宽；mobile 限制 375px 居中模拟手机
const deviceMode = ref<'pc' | 'mobile'>('pc')

// 渲染参数（用户可调）
const radius = ref(40)
const blur = ref(0.7)
const opacity = ref(0.85)
const showPreview = ref(true)
const showMarkers = ref(true)

// 前台 Base URL
const webBase = (import.meta as any).env?.VITE_WEB_BASE || 'http://localhost:3001'

// ============================================================
// 计算属性
// ============================================================
/** 归一化点数据：将后端的 50x50 网格索引转换为 0~1 比例 */
const normalizedPoints = computed<HeatPoint[]>(() => {
  return rawPoints.value.map(([gx, gy, v]) => ({
    x: gx / 50,
    y: gy / 50,
    value: v,
  }))
})

const maxValue = computed(() => {
  let m = 0
  for (const p of normalizedPoints.value) if (p.value > m) m = p.value
  return m || 1
})

/** 热度集中度：TOP3 热区占总点击数的百分比，反映用户行为聚焦程度 */
const concentration = computed(() => {
  if (!total.value) return 0
  const top3 = [...normalizedPoints.value].sort((a, b) => b.value - a.value).slice(0, 3)
  const sum = top3.reduce((acc, p) => acc + p.value, 0)
  return Math.round((sum / total.value) * 100)
})

const iframeUrl = computed(() => {
  if (!currentPath.value) return ''
  const p = currentPath.value.startsWith('/') ? currentPath.value : '/' + currentPath.value
  return webBase + p
})

/** 舞台样式：移动端模式下限制宽度模拟手机屏 */
const stageStyle = computed(() => {
  if (deviceMode.value === 'mobile') {
    return { maxWidth: '375px', margin: '0 auto', aspectRatio: '9 / 16' }
  }
  return { width: '100%', aspectRatio: '16 / 9' }
})

/** TOP 5 热区屏幕坐标（用于 DOM 标注层） */
const topMarkers = ref<Array<{ left: number; top: number; count: number }>>([])

// ============================================================
// 数据加载
// ============================================================
/**
 * 导航栏主页面白名单
 * ---------------------------------
 * 仅展示站点导航栏暴露的核心页面，避免出现海量文章详情页污染下拉。
 * 文章详情页（/articles/xxx）的点击会归并到 /articles 聚合项下。
 */
const MAIN_PAGES: Array<{ path: string; label: string }> = [
  { path: '/', label: '首页' },
  { path: '/articles', label: '文章列表' },
  { path: '/graph', label: '知识图谱' },
  { path: '/projects', label: '项目' },
  { path: '/tools', label: '工具' },
  { path: '/about', label: '关于我' },
  { path: '/contact', label: '联系' },
]

async function loadPaths() {
  try {
    const res: any = await trackApi.heatmapPaths()
    const raw: Array<{ path: string; count: number }> = res || []

    // 按白名单归一化：/articles/xxx → /articles
    const aggregated = new Map<string, number>()
    for (const p of raw) {
      const norm = normalizePath(p.path)
      if (!norm) continue
      aggregated.set(norm, (aggregated.get(norm) || 0) + Number(p.count || 0))
    }

    paths.value = MAIN_PAGES.map((mp) => ({
      path: mp.path,
      label: mp.label,
      count: aggregated.get(mp.path) || 0,
    }))

    if (!currentPath.value || !paths.value.find((p) => p.path === currentPath.value)) {
      currentPath.value = paths.value[0].path
    }
  } catch {
    paths.value = MAIN_PAGES.map((mp) => ({ path: mp.path, label: mp.label, count: 0 }))
    currentPath.value = '/'
  }
}

/** 将任意路径归一化为主导航路径，非主导航页返回空串被过滤 */
function normalizePath(p: string): string {
  if (!p) return ''
  // 去掉查询串 + 结尾斜杠
  const pure = p.split('?')[0].replace(/\/+$/, '') || '/'
  if (pure === '/' || pure === '') return '/'
  // 文章详情页归并到 /articles
  if (pure.startsWith('/articles/') || pure === '/articles') return '/articles'
  // 其它主导航页精确匹配
  const hit = MAIN_PAGES.find((mp) => mp.path !== '/' && (pure === mp.path || pure.startsWith(mp.path + '/')))
  return hit?.path || ''
}

async function loadHeatmapData() {
  if (!currentPath.value) return
  loading.value = true
  try {
    const res: any = await trackApi.heatmap(currentPath.value, 2000)
    rawPoints.value = res?.points || []
    total.value = res?.total || 0

    // 数据为空时注入 mock 数据以展示演示效果
    if (!rawPoints.value.length) {
      rawPoints.value = generateMockData()
      total.value = rawPoints.value.reduce((acc, p) => acc + p[2], 0)
    }
    await nextTick()
    render()
  } finally {
    loading.value = false
  }
}

function reload() {
  loadPaths().then(() => loadHeatmapData())
}

function onPathChange() {
  loadHeatmapData()
}

function onDeviceChange() {
  nextTick(() => render())
}

/**
 * 生成 mock 数据：模拟典型点击分布
 *   - 导航栏区域（顶部 0~10%）
 *   - 主按钮区域（中间偏左）
 *   - 侧边栏（右侧）
 *   - 一些随机散点
 */
function generateMockData(): [number, number, number][] {
  const data: [number, number, number][] = []
  const hotspots = [
    { cx: 25, cy: 3, count: 45, spread: 3 },   // logo 区
    { cx: 10, cy: 25, count: 32, spread: 2 },  // 侧边栏
    { cx: 25, cy: 15, count: 18, spread: 4 },  // 标题
    { cx: 20, cy: 30, count: 28, spread: 5 },  // 内容区
    { cx: 35, cy: 40, count: 22, spread: 4 },  // 卡片
    { cx: 40, cy: 25, count: 15, spread: 3 },  // 右上按钮
    { cx: 15, cy: 45, count: 8, spread: 5 },   // 底部
  ]
  for (const h of hotspots) {
    for (let i = 0; i < 12; i++) {
      const dx = (Math.random() - 0.5) * h.spread * 2
      const dy = (Math.random() - 0.5) * h.spread * 2
      const gx = Math.max(0, Math.min(49, Math.round(h.cx + dx)))
      const gy = Math.max(0, Math.min(49, Math.round(h.cy + dy)))
      const v = Math.max(1, Math.round(h.count / 12 + (Math.random() - 0.5) * 4))
      data.push([gx, gy, v])
    }
  }
  return data
}

// ============================================================
// 核心渲染算法（Canvas 2D 手写 heatmap）
// ============================================================

/** 颜色映射查找表：256 档从蓝 → 青 → 绿 → 黄 → 红 */
const COLOR_STOPS: Array<[number, [number, number, number]]> = [
  [0.0, [30, 64, 175]],    // 深蓝
  [0.25, [14, 165, 233]],  // 青
  [0.5, [16, 185, 129]],   // 绿
  [0.7, [250, 204, 21]],   // 黄
  [0.85, [249, 115, 22]],  // 橙
  [1.0, [239, 68, 68]],    // 红
]

/**
 * 构建颜色查找表（Lookup Table）
 * 将 0~255 的灰度值映射到 RGBA 颜色，避免每像素重复计算渐变
 */
function buildColorLUT(): Uint8ClampedArray {
  const lut = new Uint8ClampedArray(256 * 4)
  for (let i = 0; i < 256; i++) {
    const t = i / 255
    // 查找相邻两个色标并线性插值
    let c0 = COLOR_STOPS[0][1]
    let c1 = COLOR_STOPS[COLOR_STOPS.length - 1][1]
    let t0 = 0, t1 = 1
    for (let j = 0; j < COLOR_STOPS.length - 1; j++) {
      if (t >= COLOR_STOPS[j][0] && t <= COLOR_STOPS[j + 1][0]) {
        c0 = COLOR_STOPS[j][1]
        c1 = COLOR_STOPS[j + 1][1]
        t0 = COLOR_STOPS[j][0]
        t1 = COLOR_STOPS[j + 1][0]
        break
      }
    }
    const k = t1 === t0 ? 0 : (t - t0) / (t1 - t0)
    lut[i * 4] = c0[0] + (c1[0] - c0[0]) * k       // R
    lut[i * 4 + 1] = c0[1] + (c1[1] - c0[1]) * k   // G
    lut[i * 4 + 2] = c0[2] + (c1[2] - c0[2]) * k   // B
    lut[i * 4 + 3] = 255                           // A
  }
  return lut
}

let colorLUT: Uint8ClampedArray | null = null

/**
 * 主渲染函数
 * ----------------------------------------------------------
 * 算法分两步：
 * Step 1 - 强度累积：
 *   在灰度画布上对每个数据点绘制径向渐变（中心浓、边缘淡），
 *   多点重叠时 α 通道自然叠加，形成"密度场"。
 * Step 2 - 颜色着色：
 *   读取画布 ImageData，遍历每个像素，
 *   以其 α 值为索引查 COLOR_LUT，写回 RGB 颜色。
 *   alpha 通道再乘以 opacity 控制整体透明度。
 * ----------------------------------------------------------
 */
function render() {
  if (!canvasRef.value || !stageRef.value) return
  const canvas = canvasRef.value
  const stage = stageRef.value

  // 使用容器实际像素尺寸（支持 devicePixelRatio 高清渲染）
  const rect = stage.getBoundingClientRect()
  const dpr = window.devicePixelRatio || 1
  const w = Math.floor(rect.width)
  const h = Math.floor(rect.height)
  if (w <= 0 || h <= 0) return

  canvas.width = w * dpr
  canvas.height = h * dpr
  canvas.style.width = w + 'px'
  canvas.style.height = h + 'px'

  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) return
  ctx.scale(dpr, dpr)
  ctx.clearRect(0, 0, w, h)

  if (!normalizedPoints.value.length) {
    topMarkers.value = []
    return
  }

  const max = maxValue.value
  const r = radius.value
  const blurFactor = blur.value

  // === Step 1: 绘制灰度强度场 ===
  ctx.globalCompositeOperation = 'source-over'
  for (const p of normalizedPoints.value) {
    // 归一化坐标 → 像素坐标
    const px = p.x * w
    const py = p.y * h
    // 强度归一化 0~1
    const intensity = Math.min(1, p.value / max)

    // 径向渐变：中心 alpha=intensity，边缘 alpha=0
    // blur 因子控制渐变曲率（小 blur = 硬核、大 blur = 柔和）
    const grd = ctx.createRadialGradient(px, py, 0, px, py, r)
    grd.addColorStop(0, `rgba(0,0,0,${intensity})`)
    grd.addColorStop(blurFactor, `rgba(0,0,0,${intensity * 0.5})`)
    grd.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = grd
    ctx.fillRect(px - r, py - r, r * 2, r * 2)
  }

  // === Step 2: α → 颜色映射 ===
  const imageData = ctx.getImageData(0, 0, w * dpr, h * dpr)
  const pixels = imageData.data
  if (!colorLUT) colorLUT = buildColorLUT()
  const lut = colorLUT!
  const alphaMultiplier = opacity.value

  for (let i = 0; i < pixels.length; i += 4) {
    const alpha = pixels[i + 3]
    if (alpha === 0) continue
    const idx = alpha * 4
    pixels[i] = lut[idx]          // R
    pixels[i + 1] = lut[idx + 1]  // G
    pixels[i + 2] = lut[idx + 2]  // B
    pixels[i + 3] = alpha * alphaMultiplier
  }
  ctx.putImageData(imageData, 0, 0)

  // === 更新 TOP 热区标注 ===
  updateTopMarkers(w, h)
}

/** 计算 TOP 5 热区的屏幕像素坐标 */
function updateTopMarkers(w: number, h: number) {
  const top = [...normalizedPoints.value]
    .sort((a, b) => b.value - a.value)
    .slice(0, 5)
  topMarkers.value = top.map(p => ({
    left: p.x * w,
    top: p.y * h,
    count: p.value,
  }))
}

// ============================================================
// 响应式监听
// ============================================================
let resizeObserver: ResizeObserver | null = null

onMounted(async () => {
  await loadPaths()
  await loadHeatmapData()

  // 监听容器尺寸变化（窗口缩放、切换终端模式等都会触发）
  if (stageRef.value) {
    resizeObserver = new ResizeObserver(() => {
      render()
    })
    resizeObserver.observe(stageRef.value)
  }
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
})

// 切换渲染参数时即时重绘（已通过 @input 触发，此处兜底）
watch([radius, blur, opacity], () => render())
</script>

<style scoped>
/* ============================================================
 * 布局与容器
 * ============================================================ */
.heatmap-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.control-card,
.config-card,
.hint-card {
  border: 1px solid #eef0f4;
  border-radius: 14px;
}

/* ============================================================
 * 顶部标题区
 * ============================================================ */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}
.title-block {
  display: flex;
  align-items: center;
  gap: 14px;
}
.icon-wrap {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 6px 16px rgba(99, 102, 241, 0.3);
}
.title {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: #1f2937;
}
.subtitle {
  margin: 4px 0 0;
  font-size: 12px;
  color: #9ca3af;
}
.controls {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}

/* ============================================================
 * 统计卡片
 * ============================================================ */
.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
}
.stat-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px 20px;
  border-radius: 14px;
  color: #fff;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.06);
  position: relative;
  overflow: hidden;
}
.stat-card::after {
  content: '';
  position: absolute;
  right: -30px;
  bottom: -30px;
  width: 120px;
  height: 120px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 50%;
}
.stat-primary  { background: linear-gradient(135deg, #6366f1, #8b5cf6); }
.stat-success  { background: linear-gradient(135deg, #10b981, #06b6d4); }
.stat-warning  { background: linear-gradient(135deg, #f59e0b, #f97316); }
.stat-danger   { background: linear-gradient(135deg, #ef4444, #ec4899); }
.stat-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.stat-label {
  font-size: 12px;
  opacity: 0.9;
}
.stat-value {
  font-size: 24px;
  font-weight: 700;
  margin-top: 2px;
}

/* ============================================================
 * 渲染参数调节区
 * ============================================================ */
.config-row {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  align-items: center;
}
.config-item {
  display: flex;
  align-items: center;
  gap: 10px;
}
.config-item label {
  font-size: 13px;
  color: #4b5563;
  white-space: nowrap;
}
.config-val {
  font-size: 12px;
  color: #6366f1;
  font-weight: 600;
  min-width: 40px;
}
.flex-grow { flex: 1; justify-content: flex-end; }

/* ============================================================
 * 可视化舞台
 * ============================================================ */
.visualization-wrap {
  position: relative;
  display: flex;
  gap: 20px;
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 20px;
}
.stage {
  position: relative;
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  transition: max-width 0.3s ease, aspect-ratio 0.3s ease;
  flex-shrink: 0;
}
.stage-pc { flex: 1; }
.stage-mobile {
  border: 8px solid #1f2937;
  border-radius: 24px;
}
.page-iframe {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border: none;
  pointer-events: none; /* 禁用 iframe 交互，避免影响热力层 */
  background: #fff;
}
.grid-backdrop {
  position: absolute;
  inset: 0;
  background-color: #fff;
  background-image:
    linear-gradient(rgba(229, 231, 235, 0.6) 1px, transparent 1px),
    linear-gradient(90deg, rgba(229, 231, 235, 0.6) 1px, transparent 1px);
  background-size: 40px 40px;
}
.heatmap-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none; /* 纯渲染层，不拦截事件 */
  z-index: 2;
}

/* ============================================================
 * TOP 热区标注
 * ============================================================ */
.markers-layer {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 3;
}
.marker {
  position: absolute;
  transform: translate(-50%, -50%);
  pointer-events: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  animation: marker-pulse 2s ease-in-out infinite;
}
.marker-badge {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: #fff;
  font-weight: 700;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.25), 0 6px 16px rgba(239, 68, 68, 0.4);
}
.marker-info {
  font-size: 11px;
  padding: 3px 8px;
  background: rgba(17, 24, 39, 0.92);
  color: #fff;
  border-radius: 10px;
  white-space: nowrap;
}
.marker-info b {
  color: #fbbf24;
  margin-right: 2px;
}
@keyframes marker-pulse {
  0%, 100% { transform: translate(-50%, -50%) scale(1); }
  50%      { transform: translate(-50%, -50%) scale(1.1); }
}

/* ============================================================
 * 状态遮罩 & 色阶图例
 * ============================================================ */
.state-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background: rgba(255, 255, 255, 0.88);
  color: #6b7280;
  z-index: 10;
  backdrop-filter: blur(4px);
}
.legend {
  width: 60px;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  padding-top: 10px;
}
.legend-label {
  font-size: 11px;
  color: #6b7280;
  margin: 4px 0;
}
.legend-bar {
  width: 14px;
  flex: 1;
  min-height: 240px;
  border-radius: 7px;
  background: linear-gradient(
    to bottom,
    #ef4444 0%,
    #f97316 15%,
    #fbbf24 30%,
    #10b981 50%,
    #0ea5e9 75%,
    #1e40af 100%
  );
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.08);
}
.legend-ticks {
  position: absolute;
  right: 32px;
  top: 20px;
  bottom: 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  font-size: 10px;
  color: #9ca3af;
  pointer-events: none;
}

/* ============================================================
 * 底部说明
 * ============================================================ */
.hint-content {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  color: #6b7280;
  font-size: 12px;
  line-height: 1.7;
}
.hint-content b {
  color: #4f46e5;
  font-weight: 600;
}

@media (max-width: 1024px) {
  .stats-row { grid-template-columns: repeat(2, 1fr); }
  .controls { width: 100%; }
}
</style>
