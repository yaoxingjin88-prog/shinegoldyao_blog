<template>
  <div>
    <div style="display:flex;justify-content:space-between;margin-bottom:16px">
      <h3>技术栈管理</h3>
      <el-space><el-button type="primary" @click="openCatDialog()">新增分类</el-button><el-button @click="openSkillDialog()">新增技术</el-button></el-space>
    </div>
    <el-collapse v-model="activeNames">
      <el-collapse-item v-for="cat in list" :key="cat.id" :name="cat.id">
        <template #title>
          <div style="display:flex;align-items:center;gap:8px">
            <el-tag :color="cat.themeColor" size="small" style="color:#fff">{{ cat.categoryName }}</el-tag>
            <span style="color:#999;font-size:12px">({{ cat.skills?.length || 0 }}项)</span>
            <el-button link type="primary" size="small" @click.stop="openCatDialog(cat)">编辑</el-button>
            <el-popconfirm title="确定删除该分类？" @confirm="deleteCat(cat.id)"><template #reference><el-button link type="danger" size="small" @click.stop>删除</el-button></template></el-popconfirm>
          </div>
        </template>
        <el-table :data="cat.skills || []" size="small" border>
          <el-table-column prop="skillName" label="技术名称" />
          <el-table-column label="熟练度" width="200"><template #default="{ row }"><el-progress :percentage="row.proficiency" :stroke-width="12" /></template></el-table-column>
          <el-table-column prop="sort" label="排序" width="70" align="center" />
          <el-table-column label="操作" width="130">
            <template #default="{ row }">
              <el-button link type="primary" size="small" @click="openSkillDialog(row, cat.id)">编辑</el-button>
              <el-popconfirm title="确定删除该技术？" @confirm="deleteSkill(row.id)"><template #reference><el-button link type="danger" size="small">删除</el-button></template></el-popconfirm>
            </template>
          </el-table-column>
        </el-table>
      </el-collapse-item>
    </el-collapse>

    <el-dialog v-model="catDialog" :title="catEditId ? '编辑分类' : '新增分类'" width="450px">
      <el-form :model="catForm" label-width="80px">
        <el-form-item label="名称"><el-input v-model="catForm.categoryName" /></el-form-item>
        <el-form-item label="颜色"><el-color-picker v-model="catForm.themeColor" /></el-form-item>
        <el-form-item label="排序"><el-input-number v-model="catForm.sort" :min="0" /></el-form-item>
      </el-form>
      <template #footer><el-button @click="catDialog=false">取消</el-button><el-button type="primary" @click="submitCat">确定</el-button></template>
    </el-dialog>

    <el-dialog v-model="skillDialog" :title="skillEditId ? '编辑技术' : '新增技术'" width="500px">
      <el-form :model="skillForm" label-width="80px">
        <el-form-item label="分类">
          <el-select v-model="skillForm.categoryId" style="width:100%">
            <el-option v-for="c in list" :key="c.id" :label="c.categoryName" :value="Number(c.id)" />
          </el-select>
        </el-form-item>
        <el-form-item label="名称"><el-input v-model="skillForm.skillName" /></el-form-item>
        <el-form-item label="熟练度"><el-slider v-model="skillForm.proficiency" :max="100" /></el-form-item>
        <el-form-item label="简介"><el-input v-model="skillForm.description" type="textarea" :rows="2" placeholder="技术简介" /></el-form-item>
        <el-form-item label="图标URL"><el-input v-model="skillForm.iconUrl" /></el-form-item>
        <el-form-item label="排序"><el-input-number v-model="skillForm.sort" :min="0" /></el-form-item>
      </el-form>
      <template #footer><el-button @click="skillDialog=false">取消</el-button><el-button type="primary" @click="submitSkill">确定</el-button></template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { skillApi } from '../../api'
import type { SkillCategory, Skill } from '../../types'

const list = ref<SkillCategory[]>([])
const activeNames = ref<string[]>([])
const catDialog = ref(false)
const catEditId = ref('')
const catForm = reactive({ categoryName: '', themeColor: '', sort: 0 })
const skillDialog = ref(false)
const skillEditId = ref('')
const skillForm = reactive({ categoryId: 0, skillName: '', proficiency: 50, iconUrl: '', description: '', sort: 0 })

function openCatDialog(row?: SkillCategory) {
  catEditId.value = row?.id || ''
  Object.assign(catForm, row || { categoryName: '', themeColor: '', sort: 0 })
  catDialog.value = true
}
function openSkillDialog(row?: Skill, catId?: string) {
  skillEditId.value = row?.id || ''
  Object.assign(skillForm, row || { categoryId: catId ? Number(catId) : 0, skillName: '', proficiency: 50, iconUrl: '', description: '', sort: 0 })
  skillDialog.value = true
}
async function submitCat() {
  if (catEditId.value) await skillApi.updateCategory(catEditId.value, catForm)
  else await skillApi.createCategory(catForm)
  ElMessage.success('操作成功'); catDialog.value = false; loadData()
}
async function submitSkill() {
  if (skillEditId.value) await skillApi.updateSkill(skillEditId.value, skillForm)
  else await skillApi.createSkill(skillForm)
  ElMessage.success('操作成功'); skillDialog.value = false; loadData()
}
async function deleteCat(id: string) { await skillApi.removeCategory(id); ElMessage.success('删除成功'); loadData() }
async function deleteSkill(id: string) { await skillApi.removeSkill(id); ElMessage.success('删除成功'); loadData() }
async function loadData() { list.value = (await skillApi.categories()) || [] }
onMounted(loadData)
</script>
