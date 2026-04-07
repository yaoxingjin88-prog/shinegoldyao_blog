<template>
  <div>
    <div style="display:flex;justify-content:space-between;margin-bottom:16px">
      <h3>留言管理</h3>
      <el-select v-model="query.isRead" placeholder="状态筛选" clearable style="width:140px" @change="loadData">
        <el-option label="未读" :value="0" /><el-option label="已读" :value="1" />
      </el-select>
    </div>
    <el-table :data="list" border stripe>
      <el-table-column prop="nickname" label="昵称" width="120" />
      <el-table-column prop="email" label="邮箱" width="180" />
      <el-table-column prop="content" label="内容" min-width="250" show-overflow-tooltip />
      <el-table-column prop="contact" label="联系方式" width="120" />
      <el-table-column prop="ipAddress" label="IP" width="120" />
      <el-table-column label="状态" width="80" align="center"><template #default="{ row }"><el-tag :type="row.isRead ? 'success' : 'warning'" size="small">{{ row.isRead ? '已读' : '未读' }}</el-tag></template></el-table-column>
      <el-table-column label="时间" width="170"><template #default="{ row }">{{ formatDate(row.createTime) }}</template></el-table-column>
      <el-table-column label="操作" width="140">
        <template #default="{ row }">
          <el-button v-if="!row.isRead" link type="primary" @click="handleRead(row.id)">标记已读</el-button>
          <el-popconfirm title="确定删除？" @confirm="handleDelete(row.id)"><template #reference><el-button link type="danger">删除</el-button></template></el-popconfirm>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination style="margin-top:16px;justify-content:flex-end" v-model:current-page="query.page" v-model:page-size="query.pageSize" :total="total" layout="total, prev, pager, next" @current-change="loadData" />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { messageApi } from '../../api'
import type { Message } from '../../types'

const list = ref<Message[]>([])
const total = ref(0)
const query = reactive({ page: 1, pageSize: 10, isRead: undefined as number | undefined })

async function loadData() {
  const res = await messageApi.list(query)
  list.value = res.list; total.value = res.total
}
function formatDate(d: string) {
  if (!d) return ''
  const date = new Date(d)
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const h = String(date.getHours()).padStart(2, '0')
  const min = String(date.getMinutes()).padStart(2, '0')
  return `${y}-${m}-${day} ${h}:${min}`
}

async function handleRead(id: string) { await messageApi.markRead(id); ElMessage.success('已标记'); loadData() }
async function handleDelete(id: string) { await messageApi.remove(id); ElMessage.success('删除成功'); loadData() }
onMounted(loadData)
</script>
