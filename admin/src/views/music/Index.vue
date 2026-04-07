<template>
  <div>
    <div style="display:flex;justify-content:space-between;margin-bottom:16px">
      <h3>音乐管理</h3>
      <el-button type="primary" @click="openDialog()">添加音乐</el-button>
    </div>
    <el-table :data="list" border stripe>
      <el-table-column prop="title" label="歌曲名称" min-width="150" />
      <el-table-column prop="artist" label="歌手" width="120" />
      <el-table-column prop="url" label="音乐链接" min-width="200" show-overflow-tooltip />
      <el-table-column label="渐变色" width="100" align="center">
        <template #default="{ row }">
          <div v-if="row.gradient" class="w-8 h-8 rounded-lg mx-auto" :style="{ background: row.gradient }"></div>
          <span v-else class="text-gray-400 text-xs">无</span>
        </template>
      </el-table-column>
      <el-table-column prop="sort" label="排序" width="70" align="center" />
      <el-table-column label="启用" width="70" align="center">
        <template #default="{ row }">
          <el-tag :type="row.isEnable ? 'success' : 'info'" size="small">{{ row.isEnable ? '是' : '否' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="150">
        <template #default="{ row }">
          <el-button link type="primary" @click="openDialog(row)">编辑</el-button>
          <el-popconfirm title="确定删除？" @confirm="handleDelete(row.id)">
            <template #reference><el-button link type="danger">删除</el-button></template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialogVisible" :title="editingId ? '编辑音乐' : '添加音乐'" width="550px" destroy-on-close>
      <el-form :model="form" label-width="90px">
        <el-form-item label="歌曲名称"><el-input v-model="form.title" placeholder="如：渐渐遗忘的哈叶" /></el-form-item>
        <el-form-item label="歌手"><el-input v-model="form.artist" placeholder="如：Akie秋绘" /></el-form-item>
        <el-form-item label="音乐链接"><el-input v-model="form.url" placeholder="mp3 直链地址" /></el-form-item>
        <el-form-item label="封面链接"><el-input v-model="form.coverUrl" placeholder="封面图片URL（可选）" /></el-form-item>
        <el-form-item label="渐变色">
          <el-input v-model="form.gradient" placeholder="如：linear-gradient(135deg, #667eea, #764ba2)" />
          <div v-if="form.gradient" class="mt-2 w-full h-8 rounded-lg" :style="{ background: form.gradient }"></div>
        </el-form-item>
        <el-form-item label="预设渐变">
          <div class="flex gap-2 flex-wrap">
            <button
              v-for="g in presetGradients" :key="g.value"
              type="button"
              class="w-8 h-8 rounded-lg cursor-pointer border-2 hover:scale-110 transition-transform"
              :class="form.gradient === g.value ? 'border-blue-500' : 'border-transparent'"
              :style="{ background: g.value }"
              @click="form.gradient = g.value"
            ></button>
          </div>
        </el-form-item>
        <el-form-item label="排序"><el-input-number v-model="form.sort" :min="0" /></el-form-item>
        <el-form-item label="启用"><el-switch v-model="form.isEnable" :active-value="1" :inactive-value="0" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="handleSave">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { musicApi } from '../../api'

const list = ref<any[]>([])
const dialogVisible = ref(false)
const editingId = ref<string | null>(null)
const saving = ref(false)
const form = reactive({ title: '', artist: '', url: '', coverUrl: '', gradient: '', sort: 0, isEnable: 1 })

const presetGradients = [
  { value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  { value: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
  { value: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
  { value: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' },
  { value: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' },
  { value: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)' },
  { value: 'linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)' },
  { value: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)' },
]

function openDialog(row?: any) {
  if (row) {
    editingId.value = String(row.id)
    Object.assign(form, { title: row.title, artist: row.artist || '', url: row.url, coverUrl: row.coverUrl || '', gradient: row.gradient || '', sort: row.sort || 0, isEnable: row.isEnable ?? 1 })
  } else {
    editingId.value = null
    Object.assign(form, { title: '', artist: '', url: '', coverUrl: '', gradient: '', sort: 0, isEnable: 1 })
  }
  dialogVisible.value = true
}

async function handleSave() {
  if (!form.title || !form.url) { ElMessage.warning('请填写歌曲名称和链接'); return }
  saving.value = true
  try {
    if (editingId.value) {
      await musicApi.update(editingId.value, { ...form })
      ElMessage.success('更新成功')
    } else {
      await musicApi.create({ ...form })
      ElMessage.success('添加成功')
    }
    dialogVisible.value = false
    loadData()
  } finally { saving.value = false }
}

async function handleDelete(id: string) {
  await musicApi.remove(id)
  ElMessage.success('删除成功')
  loadData()
}

async function loadData() { list.value = (await musicApi.list()) || [] }
onMounted(loadData)
</script>
