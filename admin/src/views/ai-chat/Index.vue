<template>
  <div>
    <el-card shadow="never">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
        <h3 style="margin:0">AI 聊天记录</h3>
        <el-button @click="loadData" :icon="Refresh" circle />
      </div>
      <el-table :data="list" border stripe style="width:100%">
        <el-table-column label="时间" width="170">
          <template #default="{ row }">{{ formatTime(row.createTime) }}</template>
        </el-table-column>
        <el-table-column prop="ip" label="IP 地址" width="140" />
        <el-table-column prop="question" label="提问内容" show-overflow-tooltip />
        <el-table-column prop="model" label="模型" width="120" />
        <el-table-column prop="userAgent" label="User-Agent" show-overflow-tooltip width="220" />
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
import { ref, onMounted } from 'vue'
import { Refresh } from '@element-plus/icons-vue'
import { aiChatApi } from '../../api'

const list = ref<any[]>([])
const page = ref(1)
const pageSize = ref(20)
const total = ref(0)

function formatTime(t: string) {
  if (!t) return ''
  const d = new Date(t)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

async function loadData() {
  try {
    const res = await aiChatApi.logs({ page: page.value, pageSize: pageSize.value })
    list.value = res?.list || []
    total.value = res?.total || 0
  } catch { /* ignore */ }
}

onMounted(() => {
  loadData()
})
</script>
