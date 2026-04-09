<template>
  <div>
    <div style="display:flex;justify-content:space-between;margin-bottom:16px">
      <h3>轮播图管理</h3>
      <el-button type="primary" @click="openDialog()">新增轮播图</el-button>
    </div>
    <el-table :data="list" border stripe>
      <el-table-column label="预览" width="180">
        <template #default="{ row }">
          <el-image v-if="row.imageUrl" :src="row.imageUrl" style="width:80px;height:45px" fit="cover" />
          <div v-else style="display:flex;gap:4px">
            <div :style="{ background: row.bgColor || 'linear-gradient(135deg,#e0e7ff,#f3e8ff)', width:'80px', height:'45px', borderRadius:'4px' }" title="亮色"></div>
            <div :style="{ background: row.bgColorDark || 'linear-gradient(135deg,#1e1b4b,#312e81)', width:'80px', height:'45px', borderRadius:'4px' }" title="暗色"></div>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="title" label="标题" />
      <el-table-column prop="description" label="描述" show-overflow-tooltip />
      <el-table-column prop="sort" label="排序" width="70" align="center" />
      <el-table-column label="启用" width="70" align="center">
        <template #default="{ row }"><el-tag :type="row.isEnable?'success':'info'" size="small">{{ row.isEnable?'是':'否' }}</el-tag></template>
      </el-table-column>
      <el-table-column label="操作" width="150">
        <template #default="{ row }">
          <el-button link type="primary" @click="openDialog(row)">编辑</el-button>
          <el-popconfirm title="确定删除？" @confirm="handleDelete(row.id)"><template #reference><el-button link type="danger">删除</el-button></template></el-popconfirm>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialogVisible" :title="editId ? '编辑轮播图' : '新增轮播图'" width="580px">
      <el-form :model="form" label-width="90px">
        <el-form-item label="标题"><el-input v-model="form.title" /></el-form-item>
        <el-form-item label="描述"><el-input v-model="form.description" type="textarea" :rows="2" /></el-form-item>
        <el-form-item label="背景模式">
          <el-radio-group v-model="bgMode">
            <el-radio value="image">图片</el-radio>
            <el-radio value="gradient">渐变色</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="bgMode === 'image'" label="图片URL">
          <el-input v-model="form.imageUrl" placeholder="https://..." />
        </el-form-item>
        <el-form-item v-if="bgMode === 'gradient'" label="亮色背景">
          <el-select v-model="form.bgColor" placeholder="选择亮色预设渐变" style="width:100%">
            <el-option v-for="g in gradientPresetsLight" :key="g.value" :label="g.label" :value="g.value">
              <div style="display:flex;align-items:center;gap:8px">
                <div :style="{ background: g.preview, width:'40px', height:'16px', borderRadius:'4px' }"></div>
                {{ g.label }}
              </div>
            </el-option>
          </el-select>
          <div v-if="form.bgColor" :style="{ background: form.bgColor, height:'40px', borderRadius:'6px', marginTop:'8px' }"></div>
        </el-form-item>
        <el-form-item v-if="bgMode === 'gradient'" label="暗色背景">
          <el-select v-model="form.bgColorDark" placeholder="选择暗色预设渐变" style="width:100%">
            <el-option v-for="g in gradientPresetsDark" :key="g.value" :label="g.label" :value="g.value">
              <div style="display:flex;align-items:center;gap:8px">
                <div :style="{ background: g.preview, width:'40px', height:'16px', borderRadius:'4px' }"></div>
                {{ g.label }}
              </div>
            </el-option>
          </el-select>
          <div v-if="form.bgColorDark" :style="{ background: form.bgColorDark, height:'40px', borderRadius:'6px', marginTop:'8px', border: '1px solid rgba(255,255,255,0.1)' }">
            <div style="height:100%;background:linear-gradient(to top, rgba(0,0,0,0.6), transparent);border-radius:6px;display:flex;align-items:flex-end;padding:4px 8px">
              <span style="color:white;font-size:11px;opacity:0.7">暗色效果预览</span>
            </div>
          </div>
        </el-form-item>
        <el-form-item label="跳转链接"><el-input v-model="form.linkUrl" /></el-form-item>
        <el-form-item label="排序"><el-input-number v-model="form.sort" :min="0" /></el-form-item>
        <el-form-item label="启用"><el-switch v-model="form.isEnable" :active-value="1" :inactive-value="0" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible=false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { bannerApi } from '../../api'
import type { Banner } from '../../types'

const list = ref<Banner[]>([])
const dialogVisible = ref(false)
const editId = ref('')
const bgMode = ref<'image' | 'gradient'>('image')
const form = reactive({ title: '', description: '', imageUrl: '', bgColor: '', bgColorDark: '', linkUrl: '#', sort: 0, isEnable: 1 })

const gradientPresetsLight = [
  { label: '蓝紫渐变', value: 'linear-gradient(135deg, #e0e7ff 0%, #f3e8ff 50%, #fce7f3 100%)', preview: 'linear-gradient(135deg,#e0e7ff,#f3e8ff,#fce7f3)' },
  { label: '青蓝渐变', value: 'linear-gradient(135deg, #cffafe 0%, #e0f2fe 50%, #ede9fe 100%)', preview: 'linear-gradient(135deg,#cffafe,#e0f2fe,#ede9fe)' },
  { label: '绿青渐变', value: 'linear-gradient(135deg, #d1fae5 0%, #cffafe 50%, #e0f2fe 100%)', preview: 'linear-gradient(135deg,#d1fae5,#cffafe,#e0f2fe)' },
  { label: '橙粉渐变', value: 'linear-gradient(135deg, #fef3c7 0%, #fce7f3 50%, #ede9fe 100%)', preview: 'linear-gradient(135deg,#fef3c7,#fce7f3,#ede9fe)' },
]

const gradientPresetsDark = [
  { label: '深蓝紫', value: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%)', preview: 'linear-gradient(135deg,#1e1b4b,#312e81,#4c1d95)' },
  { label: '深青蓝', value: 'linear-gradient(135deg, #0c4a6e 0%, #1e3a5f 50%, #1e1b4b 100%)', preview: 'linear-gradient(135deg,#0c4a6e,#1e3a5f,#1e1b4b)' },
  { label: '深绿青', value: 'linear-gradient(135deg, #064e3b 0%, #0c4a6e 50%, #1e1b4b 100%)', preview: 'linear-gradient(135deg,#064e3b,#0c4a6e,#1e1b4b)' },
  { label: '深红紫', value: 'linear-gradient(135deg, #4c0519 0%, #4c1d95 50%, #1e1b4b 100%)', preview: 'linear-gradient(135deg,#4c0519,#4c1d95,#1e1b4b)' },
  { label: '纯暗黑', value: 'linear-gradient(135deg, #0a0a0a 0%, #111827 50%, #0f172a 100%)', preview: 'linear-gradient(135deg,#0a0a0a,#111827,#0f172a)' },
]

function openDialog(row?: any) {
  editId.value = row?.id || ''
  Object.assign(form, row || { title: '', description: '', imageUrl: '', bgColor: '', bgColorDark: '', linkUrl: '#', sort: 0, isEnable: 1 })
  bgMode.value = row?.imageUrl ? 'image' : 'gradient'
  dialogVisible.value = true
}

async function handleSubmit() {
  const data = { ...form }
  if (bgMode.value === 'image') { data.bgColor = ''; data.bgColorDark = '' }
  else data.imageUrl = ''
  if (editId.value) await bannerApi.update(editId.value, data)
  else await bannerApi.create(data)
  ElMessage.success(editId.value ? '更新成功' : '创建成功')
  dialogVisible.value = false
  loadData()
}

async function handleDelete(id: string) { await bannerApi.remove(id); ElMessage.success('删除成功'); loadData() }
async function loadData() { list.value = (await bannerApi.list()) || [] }
onMounted(loadData)
</script>
