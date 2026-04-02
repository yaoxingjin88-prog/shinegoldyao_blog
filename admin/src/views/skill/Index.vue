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
          <el-table-column prop="skillName" label="技术名称" width="120" />
          <el-table-column label="图标" width="60" align="center">
            <template #default="{ row }">
              <img v-if="row.iconUrl" :src="row.iconUrl" :alt="row.skillName" class="w-6 h-6 object-contain" @error="($event.target as HTMLImageElement).style.display='none'" />
            </template>
          </el-table-column>
          <el-table-column label="熟练度" width="180"><template #default="{ row }"><el-progress :percentage="row.proficiency" :stroke-width="12" /></template></el-table-column>
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

    <el-dialog v-model="skillDialog" :title="skillEditId ? '编辑技术' : '新增技术'" width="550px">
      <el-form :model="skillForm" label-width="80px">
        <el-form-item label="分类">
          <el-select v-model="skillForm.categoryId" style="width:100%">
            <el-option v-for="c in list" :key="c.id" :label="c.categoryName" :value="Number(c.id)" />
          </el-select>
        </el-form-item>
        <el-form-item label="名称"><el-input v-model="skillForm.skillName" placeholder="如：Vue、TypeScript" /></el-form-item>
        <el-form-item label="熟练度"><el-slider v-model="skillForm.proficiency" :max="100" /></el-form-item>
        <el-form-item label="简介"><el-input v-model="skillForm.description" type="textarea" :rows="2" placeholder="技术简介" /></el-form-item>
        <el-form-item label="图标URL">
          <el-input v-model="skillForm.iconUrl" placeholder="推荐使用 cdn.simpleicons.org">
            <template #append>
              <el-dropdown @command="selectIcon">
                <el-button>快速选择</el-button>
                <template #dropdown>
                  <el-dropdown-menu style="max-height:300px;overflow-y:auto">
                    <el-dropdown-item v-for="icon in commonIcons" :key="icon.name" :command="icon.url">
                      <div style="display:flex;align-items:center;gap:8px">
                        <img :src="icon.url" class="w-4 h-4" />
                        <span>{{ icon.name }}</span>
                      </div>
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </template>
          </el-input>
          <div v-if="skillForm.iconUrl" style="margin-top:8px">
            <img :src="skillForm.iconUrl" class="w-8 h-8 object-contain inline-block" @error="($event.target as HTMLImageElement).style.display='none'" />
            <span style="color:#999;font-size:12px;margin-left:8px">预览</span>
          </div>
        </el-form-item>
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

const commonIcons = [
  { name: 'HTML5', url: 'https://cdn.simpleicons.org/html5/E34F26' },
  { name: 'CSS3', url: 'https://cdn.simpleicons.org/css3/1572B6' },
  { name: 'JavaScript', url: 'https://cdn.simpleicons.org/javascript/F7DF1E' },
  { name: 'TypeScript', url: 'https://cdn.simpleicons.org/typescript/3178C6' },
  { name: 'Vue', url: 'https://cdn.simpleicons.org/vuedotjs/4FC08D' },
  { name: 'Nuxt', url: 'https://cdn.simpleicons.org/nuxtdotjs/00DC82' },
  { name: 'React', url: 'https://cdn.simpleicons.org/react/61DAFB' },
  { name: 'Node.js', url: 'https://cdn.simpleicons.org/nodedotjs/339933' },
  { name: 'NestJS', url: 'https://cdn.simpleicons.org/nestjs/E0234E' },
  { name: 'Express', url: 'https://cdn.simpleicons.org/express/000000' },
  { name: 'MySQL', url: 'https://cdn.simpleicons.org/mysql/4479A1' },
  { name: 'PostgreSQL', url: 'https://cdn.simpleicons.org/postgresql/4169E1' },
  { name: 'MongoDB', url: 'https://cdn.simpleicons.org/mongodb/47A248' },
  { name: 'Redis', url: 'https://cdn.simpleicons.org/redis/DC382D' },
  { name: 'Prisma', url: 'https://cdn.simpleicons.org/prisma/2D3748' },
  { name: 'Tailwind CSS', url: 'https://cdn.simpleicons.org/tailwindcss/06B6D4' },
  { name: 'Element Plus', url: 'https://cdn.simpleicons.org/element/409EFF' },
  { name: 'Git', url: 'https://cdn.simpleicons.org/git/F05032' },
  { name: 'GitHub', url: 'https://cdn.simpleicons.org/github/181717' },
  { name: 'Docker', url: 'https://cdn.simpleicons.org/docker/2496ED' },
  { name: 'Python', url: 'https://cdn.simpleicons.org/python/3776AB' },
  { name: 'Rust', url: 'https://cdn.simpleicons.org/rust/000000' },
  { name: 'Go', url: 'https://cdn.simpleicons.org/go/00ADD8' },
  { name: 'WebAssembly', url: 'https://cdn.simpleicons.org/webassembly/654FF0' },
  { name: 'Vite', url: 'https://cdn.simpleicons.org/vite/646CFF' },
  { name: 'Webpack', url: 'https://cdn.simpleicons.org/webpack/8DD6F9' },
  { name: 'Sass/SCSS', url: 'https://cdn.simpleicons.org/sass/CC6699' },
  { name: 'Axios', url: 'https://cdn.simpleicons.org/axios/5A29E4' },
  { name: 'Pinia', url: 'https://cdn.simpleicons.org/pinia/FFD859' },
  { name: 'Vitest', url: 'https://cdn.simpleicons.org/vitest/6E9F18' },
]

const list = ref<SkillCategory[]>([])
const activeNames = ref<string[]>([])
const catDialog = ref(false)
const catEditId = ref('')
const catForm = reactive({ categoryName: '', themeColor: '', sort: 0 })
const skillDialog = ref(false)
const skillEditId = ref('')
const skillForm = reactive({ categoryId: 0, skillName: '', proficiency: 50, iconUrl: '', description: '', sort: 0 })

function selectIcon(url: string) {
  skillForm.iconUrl = url
}

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

<style scoped>
.w-4 { width: 1rem; }
.h-4 { height: 1rem; }
.w-6 { width: 1.5rem; }
.h-6 { height: 1.5rem; }
.w-8 { width: 2rem; }
.h-8 { height: 2rem; }
.object-contain { object-fit: contain; }
.inline-block { display: inline-block; }
</style>
