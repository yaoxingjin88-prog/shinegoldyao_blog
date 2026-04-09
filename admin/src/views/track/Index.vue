<template>
  <div>
    <!-- 统计卡片 -->
    <el-row :gutter="16" style="margin-bottom:20px">
      <el-col :span="6" v-for="item in statCards" :key="item.label">
        <el-card shadow="never" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" :style="{ background: item.bg }">
              <el-icon :size="22" :color="item.color"><component :is="item.icon" /></el-icon>
            </div>
            <div>
              <div class="stat-value">{{ item.value }}</div>
              <div class="stat-label">{{ item.label }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 访问日志表格 -->
    <el-card shadow="never">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
        <h3 style="margin:0">访问日志</h3>
        <el-button @click="loadData" :icon="Refresh" circle />
      </div>
      <el-table :data="list" border stripe style="width:100%">
        <el-table-column label="访问时间" width="170">
          <template #default="{ row }">{{ formatTime(row.createTime) }}</template>
        </el-table-column>
        <el-table-column prop="ip" label="IP" width="140" />
        <el-table-column prop="path" label="页面路径" show-overflow-tooltip />
        <el-table-column prop="title" label="页面标题" show-overflow-tooltip />
        <el-table-column prop="browser" label="浏览器" width="150" />
        <el-table-column prop="os" label="操作系统" width="130" />
        <el-table-column label="设备" width="90" align="center">
          <template #default="{ row }">
            <el-tag size="small" :type="deviceTagType(row.device)">{{ deviceLabel(row.device) }}</el-tag>
          </template>
        </el-table-column>
      </el-table>
      <div style="display:flex;justify-content:flex-end;margin-top:16px">
        <el-pagination
          v-model:current-page="page"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[20, 50, 100]"
          layout="total, sizes, prev, pager, next"
          @current-change="loadData"
          @size-change="loadData"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { Refresh } from '@element-plus/icons-vue'
import { trackApi } from '../../api'

const list = ref<any[]>([])
const page = ref(1)
const pageSize = ref(20)
const total = ref(0)
const stats = reactive({ totalPV: 0, todayPV: 0, todayUV: 0, totalUV: 0 })

const statCards = computed(() => [
  { label: '总访问量 (PV)', value: stats.totalPV, icon: 'View', color: '#6366f1', bg: '#eef2ff' },
  { label: '今日访问量', value: stats.todayPV, icon: 'Sunrise', color: '#f59e0b', bg: '#fffbeb' },
  { label: '总独立访客 (UV)', value: stats.totalUV, icon: 'User', color: '#10b981', bg: '#ecfdf5' },
  { label: '今日独立访客', value: stats.todayUV, icon: 'UserFilled', color: '#0ea5e9', bg: '#f0f9ff' },
])

function formatTime(t: string) {
  if (!t) return ''
  const d = new Date(t)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

function deviceLabel(type: string) {
  const map: Record<string, string> = { desktop: '桌面', mobile: '手机', tablet: '平板' }
  return map[type] || type || '桌面'
}

function deviceTagType(type: string) {
  const map: Record<string, string> = { desktop: '', mobile: 'success', tablet: 'warning' }
  return map[type] || 'info'
}

async function loadData() {
  try {
    const res = await trackApi.list({ page: page.value, pageSize: pageSize.value })
    list.value = res?.list || []
    total.value = res?.total || 0
  } catch { /* ignore */ }
}

async function loadStats() {
  try {
    const res = await trackApi.stats()
    Object.assign(stats, res || {})
  } catch { /* ignore */ }
}

onMounted(() => {
  loadData()
  loadStats()
})
</script>

<style scoped>
.stat-card {
  border-radius: 12px;
  border: 1px solid #f0f0f0;
}
.stat-card :deep(.el-card__body) {
  padding: 20px;
}
.stat-content {
  display: flex;
  align-items: center;
  gap: 14px;
}
.stat-icon {
  width: 46px;
  height: 46px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.stat-value {
  font-size: 26px;
  font-weight: 700;
  color: #1f2937;
  line-height: 1.2;
}
.stat-label {
  font-size: 13px;
  color: #9ca3af;
  margin-top: 2px;
}
</style>
