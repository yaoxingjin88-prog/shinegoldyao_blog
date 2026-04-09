<template>
  <div>
    <div style="display:flex;justify-content:space-between;margin-bottom:16px">
      <h3>工具导航管理</h3>
      <el-space>
        <el-button type="primary" @click="openCategoryDialog()">新增分类</el-button>
        <el-button type="success" @click="openItemDialog()">新增工具</el-button>
      </el-space>
    </div>

    <!-- 分类卡片列表 -->
    <div v-for="cat in categories" :key="cat.id" style="margin-bottom:24px">
      <el-card shadow="never" style="border-radius:12px">
        <template #header>
          <div style="display:flex;align-items:center;justify-content:space-between">
            <div style="display:flex;align-items:center;gap:8px">
              <span style="font-size:16px;font-weight:600">{{ cat.categoryName }}</span>
              <el-tag size="small" :type="cat.isEnable ? 'success' : 'info'">{{ cat.isEnable ? '启用' : '禁用' }}</el-tag>
              <el-tag size="small" type="info">排序: {{ cat.sort }}</el-tag>
            </div>
            <el-space>
              <el-button link type="primary" @click="openItemDialog(undefined, cat.id)">添加工具</el-button>
              <el-button link type="primary" @click="openCategoryDialog(cat)">编辑分类</el-button>
              <el-popconfirm title="确定删除该分类？" @confirm="handleDeleteCategory(cat.id)">
                <template #reference><el-button link type="danger">删除</el-button></template>
              </el-popconfirm>
            </el-space>
          </div>
        </template>
        <el-table :data="cat.tools || []" border stripe size="small" v-if="cat.tools?.length">
          <el-table-column prop="emoji" label="图标" width="60" align="center" />
          <el-table-column prop="name" label="名称" width="140" />
          <el-table-column prop="description" label="描述" />
          <el-table-column prop="url" label="链接" show-overflow-tooltip />
          <el-table-column prop="sort" label="排序" width="70" align="center" />
          <el-table-column label="启用" width="70" align="center">
            <template #default="{ row }"><el-tag :type="row.isEnable ? 'success' : 'info'" size="small">{{ row.isEnable ? '是' : '否' }}</el-tag></template>
          </el-table-column>
          <el-table-column label="操作" width="130">
            <template #default="{ row }">
              <el-button link type="primary" @click="openItemDialog(row)">编辑</el-button>
              <el-popconfirm title="确定删除？" @confirm="handleDeleteItem(row.id)">
                <template #reference><el-button link type="danger">删除</el-button></template>
              </el-popconfirm>
            </template>
          </el-table-column>
        </el-table>
        <div v-else style="text-align:center;color:#999;padding:12px 0">暂无工具，点击上方「添加工具」</div>
      </el-card>
    </div>

    <div v-if="!categories.length" style="text-align:center;color:#999;padding:40px 0">暂无工具分类，请先新增分类</div>

    <!-- 分类弹窗 -->
    <el-dialog v-model="categoryDialogVisible" :title="editCategoryId ? '编辑分类' : '新增分类'" width="480px">
      <el-form :model="categoryForm" label-width="90px">
        <el-form-item label="分类名称"><el-input v-model="categoryForm.categoryName" placeholder="如：开发工具" /></el-form-item>
        <el-form-item label="图标名"><el-input v-model="categoryForm.icon" placeholder="如：Code2（Lucide 图标名）" /></el-form-item>
        <el-form-item label="背景色类"><el-input v-model="categoryForm.bgClass" placeholder="如：bg-blue-100 dark:bg-blue-900/30" /></el-form-item>
        <el-form-item label="图标色类"><el-input v-model="categoryForm.iconClass" placeholder="如：text-blue-600 dark:text-blue-400" /></el-form-item>
        <el-form-item label="排序"><el-input-number v-model="categoryForm.sort" :min="0" /></el-form-item>
        <el-form-item label="启用"><el-switch v-model="categoryForm.isEnable" :active-value="1" :inactive-value="0" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="categoryDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitCategory">确定</el-button>
      </template>
    </el-dialog>

    <!-- 工具弹窗 -->
    <el-dialog v-model="itemDialogVisible" :title="editItemId ? '编辑工具' : '新增工具'" width="520px">
      <el-form :model="itemForm" label-width="90px">
        <el-form-item label="所属分类">
          <el-select v-model="itemForm.categoryId" placeholder="选择分类" style="width:100%">
            <el-option v-for="c in categories" :key="c.id" :label="c.categoryName" :value="c.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="工具名称"><el-input v-model="itemForm.name" placeholder="如：GitHub" /></el-form-item>
        <el-form-item label="Emoji"><el-input v-model="itemForm.emoji" placeholder="如：🐙" style="width:80px" /></el-form-item>
        <el-form-item label="描述"><el-input v-model="itemForm.description" placeholder="简短描述" /></el-form-item>
        <el-form-item label="链接"><el-input v-model="itemForm.url" placeholder="https://..." /></el-form-item>
        <el-form-item label="排序"><el-input-number v-model="itemForm.sort" :min="0" /></el-form-item>
        <el-form-item label="启用"><el-switch v-model="itemForm.isEnable" :active-value="1" :inactive-value="0" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="itemDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitItem">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { toolApi } from '../../api'

// ---- 数据 ----
const categories = ref<any[]>([])

async function loadData() {
  categories.value = (await toolApi.categories()) || []
}
onMounted(loadData)

// ---- 分类 ----
const categoryDialogVisible = ref(false)
const editCategoryId = ref('')
const categoryForm = reactive({ categoryName: '', icon: '', bgClass: '', iconClass: '', sort: 0, isEnable: 1 })

function openCategoryDialog(row?: any) {
  editCategoryId.value = row?.id || ''
  Object.assign(categoryForm, row || { categoryName: '', icon: '', bgClass: '', iconClass: '', sort: 0, isEnable: 1 })
  categoryDialogVisible.value = true
}

async function handleSubmitCategory() {
  if (editCategoryId.value) await toolApi.updateCategory(editCategoryId.value, categoryForm)
  else await toolApi.createCategory(categoryForm)
  ElMessage.success(editCategoryId.value ? '更新成功' : '创建成功')
  categoryDialogVisible.value = false
  loadData()
}

async function handleDeleteCategory(id: string) {
  await toolApi.removeCategory(id)
  ElMessage.success('删除成功')
  loadData()
}

// ---- 工具项 ----
const itemDialogVisible = ref(false)
const editItemId = ref('')
const itemForm = reactive({ categoryId: '', name: '', emoji: '🔗', description: '', url: '', sort: 0, isEnable: 1 })

function openItemDialog(row?: any, defaultCategoryId?: string) {
  editItemId.value = row?.id || ''
  if (row) {
    Object.assign(itemForm, row)
  } else {
    Object.assign(itemForm, { categoryId: defaultCategoryId || '', name: '', emoji: '🔗', description: '', url: '', sort: 0, isEnable: 1 })
  }
  itemDialogVisible.value = true
}

async function handleSubmitItem() {
  if (editItemId.value) await toolApi.updateItem(editItemId.value, itemForm)
  else await toolApi.createItem(itemForm)
  ElMessage.success(editItemId.value ? '更新成功' : '创建成功')
  itemDialogVisible.value = false
  loadData()
}

async function handleDeleteItem(id: string) {
  await toolApi.removeItem(id)
  ElMessage.success('删除成功')
  loadData()
}
</script>
