<template>
  <canvas
    ref="canvasRef"
    class="fixed inset-0 z-[9999] pointer-events-none"
  />
</template>

<script setup lang="ts">
const canvasRef = ref<HTMLCanvasElement | null>(null)

interface Petal {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  rotation: number
  rotationSpeed: number
  opacity: number
  color: string
  life: number
  maxLife: number
  type: 'petal' | 'sparkle'
}

const petals: Petal[] = []

const petalColors = [
  '#FFB7C5', '#FF69B4', '#FF1493', '#FFC0CB', '#DB7093',
  '#FFD700', '#FFA07A', '#FF6347', '#E8A0BF', '#BA55D3',
  '#87CEEB', '#98FB98', '#DDA0DD', '#F0E68C', '#FFF0F5',
]

function createPetals(x: number, y: number, count: number) {
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5
    const speed = 1.5 + Math.random() * 3
    const isPetal = Math.random() > 0.3
    petals.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 1,
      size: isPetal ? 4 + Math.random() * 6 : 2 + Math.random() * 3,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.15,
      opacity: 1,
      color: petalColors[Math.floor(Math.random() * petalColors.length)],
      life: 0,
      maxLife: 40 + Math.random() * 30,
      type: isPetal ? 'petal' : 'sparkle',
    })
  }
}

function drawPetal(ctx: CanvasRenderingContext2D, p: Petal) {
  ctx.save()
  ctx.translate(p.x, p.y)
  ctx.rotate(p.rotation)
  ctx.globalAlpha = p.opacity

  if (p.type === 'petal') {
    // 花瓣形状
    ctx.fillStyle = p.color
    ctx.beginPath()
    ctx.ellipse(0, 0, p.size * 0.6, p.size, 0, 0, Math.PI * 2)
    ctx.fill()

    // 花瓣高光
    ctx.fillStyle = 'rgba(255,255,255,0.4)'
    ctx.beginPath()
    ctx.ellipse(-p.size * 0.15, -p.size * 0.2, p.size * 0.2, p.size * 0.4, -0.3, 0, Math.PI * 2)
    ctx.fill()
  } else {
    // 闪光点
    ctx.fillStyle = p.color
    ctx.shadowColor = p.color
    ctx.shadowBlur = 6
    ctx.beginPath()
    ctx.arc(0, 0, p.size * 0.5, 0, Math.PI * 2)
    ctx.fill()
  }

  ctx.restore()
}

let animId = 0

function animate() {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  ctx.clearRect(0, 0, canvas.width, canvas.height)

  for (let i = petals.length - 1; i >= 0; i--) {
    const p = petals[i]
    p.x += p.vx
    p.y += p.vy
    p.vy += 0.06 // 重力
    p.vx *= 0.98 // 阻力
    p.rotation += p.rotationSpeed
    p.life++
    p.opacity = Math.max(0, 1 - p.life / p.maxLife)

    if (p.life >= p.maxLife) {
      petals.splice(i, 1)
      continue
    }

    drawPetal(ctx, p)
  }

  if (petals.length > 0) {
    animId = requestAnimationFrame(animate)
  } else {
    animId = 0
  }
}

function handleClick(e: MouseEvent) {
  createPetals(e.clientX, e.clientY, 12 + Math.floor(Math.random() * 6))
  if (!animId) {
    animId = requestAnimationFrame(animate)
  }
}

function resizeCanvas() {
  const canvas = canvasRef.value
  if (!canvas) return
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
}

onMounted(() => {
  resizeCanvas()
  window.addEventListener('resize', resizeCanvas)
  document.addEventListener('click', handleClick)
})

onUnmounted(() => {
  window.removeEventListener('resize', resizeCanvas)
  document.removeEventListener('click', handleClick)
  if (animId) cancelAnimationFrame(animId)
})
</script>
