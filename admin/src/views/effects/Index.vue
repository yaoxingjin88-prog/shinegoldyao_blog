<template>
  <div>
    <h3 style="margin-bottom: 20px">特效控制</h3>

    <!-- 流星雨控制面板 -->
    <el-card shadow="hover">
      <template #header>
        <div style="display: flex; align-items: center; justify-content: space-between">
          <span style="font-weight: 600; font-size: 16px">🌠 流星雨</span>
          <el-switch
            v-model="form.meteorEnabled"
            active-text="开启"
            inactive-text="关闭"
            inline-prompt
            style="--el-switch-on-color: #409eff"
          />
        </div>
      </template>

      <el-form label-width="100px" style="max-width: 600px">
        <el-form-item label="生成密度">
          <div style="width: 100%">
            <el-slider
              v-model="form.meteorDensity"
              :min="1"
              :max="10"
              :step="1"
              show-stops
              :marks="densityMarks"
              :disabled="!form.meteorEnabled"
            />
            <div class="slider-hint">
              控制流星生成频率，值越大流星越密集（当前：每 {{ spawnInterval }}ms 生成一次）
            </div>
          </div>
        </el-form-item>

        <el-form-item label="飞行速度">
          <div style="width: 100%">
            <el-slider
              v-model="form.meteorSpeed"
              :min="1"
              :max="10"
              :step="1"
              show-stops
              :marks="speedMarks"
              :disabled="!form.meteorEnabled"
            />
            <div class="slider-hint">
              控制流星移动速度，值越大流星越快（当前：基础速度 {{ baseSpeed }}px/帧）
            </div>
          </div>
        </el-form-item>

        <el-form-item label="最大数量">
          <el-input-number
            v-model="form.meteorMaxCount"
            :min="2"
            :max="30"
            :step="1"
            :disabled="!form.meteorEnabled"
          />
          <span style="margin-left: 12px; color: #999; font-size: 13px">同时存在的最大流星数量</span>
        </el-form-item>

        <el-form-item label="实时预览">
          <div class="preview-box" :class="{ active: form.meteorEnabled }">
            <canvas ref="previewCanvas" />
            <div v-if="!form.meteorEnabled" class="preview-off">已关闭</div>
          </div>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" :loading="saving" @click="handleSave">保存配置</el-button>
          <el-button @click="handleReset">恢复默认</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { ElMessage } from 'element-plus'
import { siteApi } from '../../api'

// ---- 表单 ----
const form = reactive({
  meteorEnabled: true,
  meteorDensity: 5,
  meteorSpeed: 5,
  meteorMaxCount: 12,
})

const DEFAULTS = { meteorEnabled: true, meteorDensity: 5, meteorSpeed: 5, meteorMaxCount: 12 }

const saving = ref(false)

// ---- 计算展示值 ----
const spawnInterval = computed(() => Math.round(600 - form.meteorDensity * 40))
const baseSpeed = computed(() => Math.round(4 + form.meteorSpeed * 2.2))

const densityMarks = { 1: '稀疏', 5: '适中', 10: '密集' } as Record<number, string>
const speedMarks = { 1: '缓慢', 5: '适中', 10: '极速' } as Record<number, string>

// ---- 保存 ----
async function handleSave() {
  saving.value = true
  try {
    const configs = [
      { key: 'meteor_enabled', value: String(form.meteorEnabled) },
      { key: 'meteor_density', value: String(form.meteorDensity) },
      { key: 'meteor_speed', value: String(form.meteorSpeed) },
      { key: 'meteor_max_count', value: String(form.meteorMaxCount) },
    ]
    await siteApi.updateConfig(configs)
    ElMessage.success('流星雨配置已保存')
  } catch {
    ElMessage.error('保存失败')
  } finally {
    saving.value = false
  }
}

function handleReset() {
  Object.assign(form, DEFAULTS)
}

// ---- 加载已有配置 ----
onMounted(async () => {
  try {
    const data = await siteApi.getConfig()
    if (data?.meteor_enabled !== undefined) form.meteorEnabled = data.meteor_enabled === 'true'
    if (data?.meteor_density) form.meteorDensity = Number(data.meteor_density) || 5
    if (data?.meteor_speed) form.meteorSpeed = Number(data.meteor_speed) || 5
    if (data?.meteor_max_count) form.meteorMaxCount = Number(data.meteor_max_count) || 12
  } catch { /* 首次无配置则使用默认值 */ }
  startPreview()
})

// ---- 实时预览 ----
const previewCanvas = ref<HTMLCanvasElement | null>(null)

interface PreviewMeteor {
  x: number; y: number; len: number; spd: number; ang: number
  op: number; w: number; life: number; max: number; col: string
}

const previewPool: PreviewMeteor[] = []
let pRafId = 0
let pTimerId = 0
const PREVIEW_W = 500
const PREVIEW_H = 200
const pColors = ['#fff', '#a5d8ff', '#d0bfff', '#ffd8a8', '#b2f2bb']

function pSpawn() {
  if (previewPool.length >= form.meteorMaxCount) return
  const ang = Math.PI / 4 + (Math.random() - 0.5) * 0.4
  previewPool.push({
    x: PREVIEW_W * 0.2 + Math.random() * PREVIEW_W * 0.8,
    y: -5 - Math.random() * 30,
    len: 30 + Math.random() * 60,
    spd: baseSpeed.value * (0.3 + Math.random() * 0.4),
    ang, op: 0.7 + Math.random() * 0.3,
    w: 1 + Math.random() * 1.5, life: 0,
    max: 30 + Math.random() * 40,
    col: pColors[Math.floor(Math.random() * pColors.length)],
  })
}

function pFrame() {
  pRafId = requestAnimationFrame(pFrame)
  const c = previewCanvas.value
  if (!c) return
  const ctx = c.getContext('2d')
  if (!ctx) return

  ctx.clearRect(0, 0, PREVIEW_W, PREVIEW_H)

  if (!form.meteorEnabled) return

  for (let i = previewPool.length - 1; i >= 0; i--) {
    const m = previewPool[i]
    m.x -= Math.cos(m.ang) * m.spd
    m.y += Math.sin(m.ang) * m.spd
    m.life++
    const fi = Math.min(m.life / 4, 1)
    const fo = Math.max(0, 1 - m.life / m.max)
    const a = m.op * fi * fo
    if (a <= 0) { previewPool.splice(i, 1); continue }

    const tx = m.x + Math.cos(m.ang) * m.len
    const ty = m.y - Math.sin(m.ang) * m.len
    const g = ctx.createLinearGradient(m.x, m.y, tx, ty)
    g.addColorStop(0, m.col); g.addColorStop(0.5, m.col); g.addColorStop(1, 'transparent')

    ctx.save()
    ctx.globalAlpha = a * 0.3; ctx.strokeStyle = m.col
    ctx.lineWidth = m.w * 4; ctx.lineCap = 'round'
    ctx.shadowColor = m.col; ctx.shadowBlur = 8
    ctx.beginPath(); ctx.moveTo(m.x, m.y); ctx.lineTo(tx, ty); ctx.stroke()
    ctx.restore()

    ctx.save()
    ctx.globalAlpha = a; ctx.strokeStyle = g
    ctx.lineWidth = m.w; ctx.lineCap = 'round'
    ctx.shadowColor = m.col; ctx.shadowBlur = 6
    ctx.beginPath(); ctx.moveTo(m.x, m.y); ctx.lineTo(tx, ty); ctx.stroke()
    ctx.fillStyle = '#fff'; ctx.shadowColor = '#fff'; ctx.shadowBlur = 10
    ctx.beginPath(); ctx.arc(m.x, m.y, m.w + 0.5, 0, Math.PI * 2); ctx.fill()
    ctx.restore()
  }
}

function startPreview() {
  const c = previewCanvas.value
  if (!c) return
  c.width = PREVIEW_W
  c.height = PREVIEW_H
  pRafId = requestAnimationFrame(pFrame)
}

function restartSpawnTimer() {
  if (pTimerId) clearInterval(pTimerId)
  if (!form.meteorEnabled) { previewPool.length = 0; return }
  pTimerId = window.setInterval(() => {
    pSpawn()
    if (Math.random() > 0.6) pSpawn()
  }, spawnInterval.value)
}

watch(() => form.meteorEnabled, () => restartSpawnTimer())
watch(() => form.meteorDensity, () => restartSpawnTimer())
watch(() => form.meteorSpeed, () => {
  previewPool.forEach(m => { m.spd = baseSpeed.value * (0.3 + Math.random() * 0.4) })
})
watch(() => form.meteorMaxCount, () => {
  while (previewPool.length > form.meteorMaxCount) previewPool.pop()
})

onMounted(() => restartSpawnTimer())

onBeforeUnmount(() => {
  if (pRafId) cancelAnimationFrame(pRafId)
  if (pTimerId) clearInterval(pTimerId)
})
</script>

<style scoped>
.slider-hint {
  margin-top: 24px;
  font-size: 12px;
  color: #999;
}
.preview-box {
  width: 500px;
  height: 200px;
  border-radius: 12px;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
  overflow: hidden;
  position: relative;
  border: 1px solid #334155;
}
.preview-box canvas {
  display: block;
  width: 500px;
  height: 200px;
}
.preview-off {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  font-size: 14px;
  background: rgba(15, 23, 42, 0.8);
}
</style>
