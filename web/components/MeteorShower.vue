<template>
  <canvas ref="canvasRef" class="meteor-canvas" />
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'

const props = withDefaults(defineProps<{
  active: boolean
  spawnInterval?: number
  baseSpeed?: number
  maxMeteors?: number
}>(), {
  spawnInterval: 400,
  baseSpeed: 15,
  maxMeteors: 12,
})

const canvasRef = ref<HTMLCanvasElement | null>(null)

// ---- 类型 ----
interface Meteor {
  x: number
  y: number
  length: number
  speed: number
  angle: number
  opacity: number
  lineWidth: number
  life: number
  maxLife: number
  color: string
  glowSize: number
  headRadius: number
}

// ---- 状态 ----
const meteors: Meteor[] = []
let ctx: CanvasRenderingContext2D | null = null
let rafId = 0
let spawnTimerId = 0
let dpr = 1

const COLORS = [
  { head: '#ffffff', tail: 'rgba(255,255,255,0)' },
  { head: '#a5d8ff', tail: 'rgba(165,216,255,0)' },
  { head: '#d0bfff', tail: 'rgba(208,191,255,0)' },
  { head: '#ffd8a8', tail: 'rgba(255,216,168,0)' },
  { head: '#b2f2bb', tail: 'rgba(178,242,187,0)' },
  { head: '#ffc9c9', tail: 'rgba(255,201,201,0)' },
  { head: '#99e9f2', tail: 'rgba(153,233,242,0)' },
]

// ---- HiDPI Canvas 尺寸 ----
function resize() {
  const c = canvasRef.value
  if (!c) return
  dpr = window.devicePixelRatio || 1
  const w = window.innerWidth
  const h = window.innerHeight
  c.width = w * dpr
  c.height = h * dpr
  c.style.width = w + 'px'
  c.style.height = h + 'px'
  ctx = c.getContext('2d')
  if (ctx) ctx.scale(dpr, dpr)
}

// ---- 逻辑尺寸（CSS 像素） ----
function logicalW() { return window.innerWidth }
function logicalH() { return window.innerHeight }

// ---- 生成流星 ----
function spawn() {
  if (meteors.length >= props.maxMeteors) return
  const w = logicalW()
  const angle = Math.PI / 4 + (Math.random() - 0.5) * 0.5
  const isBig = Math.random() > 0.7
  const spdBase = props.baseSpeed
  meteors.push({
    x: w * 0.15 + Math.random() * w * 0.85,
    y: -10 - Math.random() * 150,
    length: isBig ? (160 + Math.random() * 220) : (60 + Math.random() * 120),
    speed: isBig ? (spdBase * 1.2 + Math.random() * spdBase * 0.6) : (spdBase * 0.5 + Math.random() * spdBase * 0.8),
    angle,
    opacity: 0.6 + Math.random() * 0.4,
    lineWidth: isBig ? (2.5 + Math.random() * 1.5) : (1 + Math.random() * 1.5),
    life: 0,
    maxLife: isBig ? (40 + Math.random() * 30) : (55 + Math.random() * 65),
    color: COLORS[Math.floor(Math.random() * COLORS.length)].head,
    glowSize: isBig ? (24 + Math.random() * 16) : (10 + Math.random() * 10),
    headRadius: isBig ? (3 + Math.random() * 1.5) : (1.5 + Math.random() * 1),
  })
}

// ---- 解析颜色获取 tailColor ----
function tailColorOf(headColor: string): string {
  const c = COLORS.find(c => c.head === headColor)
  return c ? c.tail : 'rgba(255,255,255,0)'
}

// ---- 动画帧 ----
function frame() {
  rafId = requestAnimationFrame(frame)

  const c = canvasRef.value
  if (!c || !ctx) return

  const w = logicalW()
  const h = logicalH()

  // 重置变换后清屏
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.clearRect(0, 0, w, h)

  for (let i = meteors.length - 1; i >= 0; i--) {
    const m = meteors[i]

    // 移动
    m.x -= Math.cos(m.angle) * m.speed
    m.y += Math.sin(m.angle) * m.speed
    m.life++

    // 渐入 + 渐出
    const fadeIn = Math.min(m.life / 5, 1)
    const fadeOut = Math.max(0, 1 - m.life / m.maxLife)
    const alpha = m.opacity * fadeIn * fadeOut

    // 生命结束 -> 删除
    if (alpha <= 0) {
      meteors.splice(i, 1)
      continue
    }

    // 尾巴终点
    const tailX = m.x + Math.cos(m.angle) * m.length
    const tailY = m.y - Math.sin(m.angle) * m.length
    const tailEnd = tailColorOf(m.color)

    // ---- 外层柔光（大半径低透明度） ----
    ctx.save()
    ctx.globalAlpha = alpha * 0.15
    ctx.strokeStyle = m.color
    ctx.lineWidth = m.lineWidth * 6
    ctx.lineCap = 'round'
    ctx.shadowColor = m.color
    ctx.shadowBlur = m.glowSize * 1.5
    ctx.beginPath()
    ctx.moveTo(m.x, m.y)
    ctx.lineTo(tailX, tailY)
    ctx.stroke()
    ctx.restore()

    // ---- 中层发光 ----
    ctx.save()
    ctx.globalAlpha = alpha * 0.4
    ctx.lineWidth = m.lineWidth * 3
    ctx.lineCap = 'round'
    ctx.shadowColor = m.color
    ctx.shadowBlur = m.glowSize
    const midGrad = ctx.createLinearGradient(m.x, m.y, tailX, tailY)
    midGrad.addColorStop(0, m.color)
    midGrad.addColorStop(0.5, m.color)
    midGrad.addColorStop(1, tailEnd)
    ctx.strokeStyle = midGrad
    ctx.beginPath()
    ctx.moveTo(m.x, m.y)
    ctx.lineTo(tailX, tailY)
    ctx.stroke()
    ctx.restore()

    // ---- 核心亮线（渐变尾巴） ----
    ctx.save()
    ctx.globalAlpha = alpha
    const coreGrad = ctx.createLinearGradient(m.x, m.y, tailX, tailY)
    coreGrad.addColorStop(0, '#fff')
    coreGrad.addColorStop(0.15, m.color)
    coreGrad.addColorStop(0.6, m.color)
    coreGrad.addColorStop(1, tailEnd)
    ctx.strokeStyle = coreGrad
    ctx.lineWidth = m.lineWidth
    ctx.lineCap = 'round'
    ctx.shadowColor = m.color
    ctx.shadowBlur = m.glowSize * 0.6
    ctx.beginPath()
    ctx.moveTo(m.x, m.y)
    ctx.lineTo(tailX, tailY)
    ctx.stroke()
    ctx.restore()

    // ---- 头部亮点（双层） ----
    ctx.save()
    // 外层光晕
    ctx.globalAlpha = alpha * 0.3
    ctx.fillStyle = m.color
    ctx.shadowColor = m.color
    ctx.shadowBlur = m.glowSize * 1.2
    ctx.beginPath()
    ctx.arc(m.x, m.y, m.headRadius * 3, 0, Math.PI * 2)
    ctx.fill()
    // 内核白点
    ctx.globalAlpha = alpha
    ctx.fillStyle = '#fff'
    ctx.shadowColor = '#fff'
    ctx.shadowBlur = m.glowSize * 0.8
    ctx.beginPath()
    ctx.arc(m.x, m.y, m.headRadius, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }
}

// ---- 启动 / 停止 ----
function start() {
  const c = canvasRef.value
  if (!c) return
  resize()
  if (!ctx) return
  // 初始一波
  for (let i = 0; i < 3; i++) spawn()
  // 持续生成
  restartSpawnTimer()
  // 动画循环
  if (!rafId) {
    rafId = requestAnimationFrame(frame)
  }
}

function stop() {
  if (spawnTimerId) {
    window.clearInterval(spawnTimerId)
    spawnTimerId = 0
  }
  if (rafId) {
    cancelAnimationFrame(rafId)
    rafId = 0
  }
  meteors.length = 0
  const c = canvasRef.value
  if (c && ctx) {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, logicalW(), logicalH())
  }
}

function restartSpawnTimer() {
  if (spawnTimerId) { window.clearInterval(spawnTimerId); spawnTimerId = 0 }
  spawnTimerId = window.setInterval(() => {
    spawn()
    if (Math.random() > 0.6) spawn()
  }, props.spawnInterval)
}

// ---- 监听 active 变化 ----
watch(() => props.active, (val) => {
  if (val) start()
  else stop()
})

// ---- 监听配置变化，动态调整 ----
watch(() => props.spawnInterval, () => {
  if (props.active && spawnTimerId) restartSpawnTimer()
})
watch(() => props.maxMeteors, () => {
  while (meteors.length > props.maxMeteors) meteors.pop()
})

// ---- 生命周期 ----
onMounted(() => {
  window.addEventListener('resize', resize)
  if (props.active) start()
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', resize)
  stop()
})
</script>

<style scoped>
.meteor-canvas {
  position: fixed;
  top: 0;
  left: 0;
  pointer-events: none;
  z-index: 50;
}
</style>
