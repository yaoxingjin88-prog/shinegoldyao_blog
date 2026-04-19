<template>
  <div>
    <el-card shadow="never">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
        <h3 style="margin:0">AI 阅读日志</h3>
        <div style="display:flex;gap:10px;align-items:center">
          <el-radio-group v-model="actionType" size="small" @change="handleFilter">
            <el-radio-button value="">全部</el-radio-button>
            <el-radio-button value="read">整篇分析</el-radio-button>
            <el-radio-button value="explain">术语/文本解释</el-radio-button>
          </el-radio-group>
          <el-button @click="loadData" :icon="Refresh" circle />
        </div>
      </div>

      <el-table :data="list" border stripe style="width:100%">
        <el-table-column label="时间" width="170">
          <template #default="{ row }">{{ formatTime(row.createTime) }}</template>
        </el-table-column>
        <el-table-column prop="ip" label="IP 地址" width="140" />
        <el-table-column label="动作" width="120" align="center">
          <template #default="{ row }">
            <el-tag :type="row.actionType === 'read' ? 'primary' : 'success'" size="small">
              {{ row.actionType === 'read' ? '整篇分析' : '解释' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="文章" min-width="240" show-overflow-tooltip>
          <template #default="{ row }">
            <div v-if="row.articleSlug" class="article-cell">
              <div class="article-title">{{ row.articleTitle || row.articleSlug }}</div>
              <a
                :href="`${webBase}/articles/${row.articleSlug}`"
                target="_blank"
                class="article-slug"
                rel="noopener"
              >/{{ row.articleSlug }}</a>
            </div>
            <span v-else class="article-title">{{ row.articleTitle || '—' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="内容/模式" min-width="260" show-overflow-tooltip>
          <template #default="{ row }">
            <span v-if="row.actionType === 'read'" class="mode-tag">
              {{ modeLabel(row.selectedText) }}
            </span>
            <span v-else class="selected-text">{{ row.selectedText || '—' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="userAgent" label="User-Agent" show-overflow-tooltip width="200" />
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
import { articleApi } from '../../api'

const list = ref<any[]>([])
const page = ref(1)
const pageSize = ref(20)
const total = ref(0)
const actionType = ref<'' | 'read' | 'explain'>('')

const webBase = (import.meta.env.VITE_WEB_BASE as string) || 'http://localhost:3001'

function formatTime(t: string) {
  if (!t) return ''
  const d = new Date(t)
  if (isNaN(d.getTime())) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

function modeLabel(mode: string) {
  const map: Record<string, string> = {
    all: '全量（思维导图+术语+摘要）',
    mindmap: '思维导图',
    terms: '术语解释',
  }
  return map[mode] || mode || '—'
}

function handleFilter() {
  page.value = 1
  loadData()
}

async function loadData() {
  try {
    const res = await articleApi.aiLogs({
      page: page.value,
      pageSize: pageSize.value,
      actionType: actionType.value || undefined,
    })
    list.value = res?.list || []
    total.value = res?.total || 0
  } catch { /* ignore */ }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.article-cell {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.article-title {
  color: #1f2937;
  font-weight: 500;
}
.article-slug {
  color: #6366f1;
  font-size: 12px;
  text-decoration: none;
}
.article-slug:hover {
  text-decoration: underline;
}
.mode-tag {
  color: #6b7280;
  font-size: 13px;
}
.selected-text {
  color: #1f2937;
}
</style>
