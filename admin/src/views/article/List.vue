<template>
  <div>
    <div style="display:flex;justify-content:space-between;margin-bottom:16px">
      <el-space>
        <el-input v-model="query.keyword" placeholder="搜索文章" clearable style="width:200px" @clear="loadData" @keyup.enter="loadData" />
        <el-select v-model="query.categoryId" placeholder="分类" clearable style="width:150px" @change="loadData">
          <el-option v-for="c in categories" :key="c.id" :label="c.categoryName" :value="c.id" />
        </el-select>
        <el-select v-model="query.isPublish" placeholder="状态" clearable style="width:120px" @change="loadData">
          <el-option label="已发布" :value="1" /><el-option label="草稿" :value="0" />
        </el-select>
        <el-button type="primary" @click="loadData">搜索</el-button>
      </el-space>
      <el-space>
        <el-button type="primary" @click="$router.push('/article/create')">新增文章</el-button>
        <el-button type="success" @click="showImportDialog = true">从Gitee导入</el-button>
      </el-space>
    </div>
    <el-table :data="list" border stripe>
      <el-table-column prop="title" label="标题" min-width="200" />
      <el-table-column label="分类" width="120"><template #default="{ row }">{{ row.category?.categoryName }}</template></el-table-column>
      <el-table-column prop="viewCount" label="阅读" width="80" align="center" />
      <el-table-column label="置顶" width="70" align="center"><template #default="{ row }"><el-tag :type="row.isTop ? 'warning' : 'info'" size="small">{{ row.isTop ? '是' : '否' }}</el-tag></template></el-table-column>
      <el-table-column label="状态" width="80" align="center"><template #default="{ row }"><el-tag :type="row.isPublish ? 'success' : 'info'" size="small">{{ row.isPublish ? '已发布' : '草稿' }}</el-tag></template></el-table-column>
      <el-table-column label="创建时间" width="170"><template #default="{ row }">{{ formatDate(row.createTime) }}</template></el-table-column>
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="$router.push(`/article/edit/${row.id}`)">编辑</el-button>
          <el-popconfirm title="确定删除？" @confirm="handleDelete(row.id)"><template #reference><el-button link type="danger">删除</el-button></template></el-popconfirm>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination style="margin-top:16px;justify-content:flex-end" v-model:current-page="query.page" v-model:page-size="query.pageSize" :total="total" :page-sizes="[10,20,50]" layout="total, sizes, prev, pager, next" @size-change="loadData" @current-change="loadData" />

    <!-- Gitee导入弹窗 -->
    <el-dialog v-model="showImportDialog" title="从Gitee导入文章" width="600px" destroy-on-close>
      <el-form label-width="100px">
        <el-form-item label="仓库地址">
          <el-input v-model="giteeForm.repoUrl" placeholder="如 https://gitee.com/owner/repo" />
        </el-form-item>
        <el-form-item label="Access Token">
          <el-input v-model="giteeForm.token" placeholder="Gitee私人令牌（私有仓库需要）" type="password" show-password />
          <div style="font-size:12px;color:#999;margin-top:4px">私有仓库需要，公开仓库可留空。在 Gitee → 设置 → 私人令牌 中获取</div>
        </el-form-item>
        <el-form-item label="文件路径">
          <el-input v-model="giteeForm.path" placeholder="仓库内md文件路径，如 docs/article.md" />
          <div style="font-size:12px;color:#999;margin-top:4px">留空则浏览仓库目录选择文件</div>
        </el-form-item>
      </el-form>

      <!-- 仓库文件浏览 -->
      <div v-if="giteeFiles.length" style="margin-top:12px">
        <div style="margin-bottom:8px;font-weight:600;font-size:14px">
          <span v-if="giteeBreadcrumb.length" style="cursor:pointer;color:#409eff" @click="browseGiteeDir('')">根目录</span>
          <template v-for="(seg, i) in giteeBreadcrumb" :key="i">
            <span style="margin:0 4px;color:#ccc">/</span>
            <span style="cursor:pointer;color:#409eff" @click="browseGiteeDir(giteeBreadcrumb.slice(0, i+1).join('/'))">{{ seg }}</span>
          </template>
        </div>
        <el-table :data="giteeFiles" size="small" max-height="300" @row-click="handleGiteeFileClick" style="cursor:pointer">
          <el-table-column label="文件名" min-width="200">
            <template #default="{ row }">
              <span>{{ row.type === 'dir' ? '📁' : '📄' }} {{ row.name }}</span>
            </template>
          </el-table-column>
          <el-table-column label="大小" width="100"><template #default="{ row }">{{ row.type === 'file' ? formatSize(row.size) : '-' }}</template></el-table-column>
        </el-table>
      </div>

      <template #footer>
        <el-space>
          <el-button @click="showImportDialog = false">取消</el-button>
          <el-button type="warning" :loading="importLoading" @click="browseGiteeDir(giteeForm.path || '')">浏览仓库</el-button>
          <el-button type="primary" :loading="importLoading" @click="handleImport">导入</el-button>
        </el-space>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { articleApi, categoryApi } from '../../api'
import type { Article, ArticleCategory } from '../../types'

const router = useRouter()
const list = ref<Article[]>([])
const categories = ref<ArticleCategory[]>([])
const total = ref(0)
const query = reactive({ page: 1, pageSize: 10, keyword: '', categoryId: undefined as string | undefined, isPublish: undefined as number | undefined })

async function loadData() {
  const res = await articleApi.list(query)
  list.value = res.list
  total.value = res.total
}

async function handleDelete(id: string) {
  await articleApi.remove(id)
  ElMessage.success('删除成功')
  loadData()
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

function formatSize(bytes: number) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / 1024 / 1024).toFixed(1) + ' MB'
}

// === Gitee 导入 ===
const showImportDialog = ref(false)
const importLoading = ref(false)
const giteeForm = reactive({ repoUrl: '', token: '', path: '' })
const giteeFiles = ref<any[]>([])
const giteeCurrentDir = ref('')
const giteeBreadcrumb = computed(() => giteeCurrentDir.value ? giteeCurrentDir.value.split('/') : [])

function parseGiteeRepo(url: string) {
  const match = url.replace(/\/+$/, '').match(/gitee\.com\/([^/]+)\/([^/]+)/)
  if (!match) return null
  return { owner: match[1], repo: match[2] }
}

async function browseGiteeDir(path: string) {
  const info = parseGiteeRepo(giteeForm.repoUrl)
  if (!info) { ElMessage.warning('请输入正确的Gitee仓库地址'); return }
  importLoading.value = true
  try {
    const url = `https://gitee.com/api/v5/repos/${info.owner}/${info.repo}/contents/${path}`
    const params = giteeForm.token ? `?access_token=${giteeForm.token}` : ''
    const res = await fetch(url + params)
    if (!res.ok) throw new Error(`请求失败: ${res.status}`)
    const data = await res.json()
    if (Array.isArray(data)) {
      // sort: dirs first, then files
      giteeFiles.value = data
        .map((f: any) => ({ name: f.name, path: f.path, type: f.type, size: f.size || 0 }))
        .sort((a: any, b: any) => (a.type === 'dir' ? -1 : 1) - (b.type === 'dir' ? -1 : 1))
      giteeCurrentDir.value = path
    } else {
      // single file returned, set path
      giteeForm.path = path
      ElMessage.success('已选中文件: ' + path)
    }
  } catch (e: any) {
    ElMessage.error(e.message || '获取仓库目录失败')
  } finally { importLoading.value = false }
}

function handleGiteeFileClick(row: any) {
  if (row.type === 'dir') {
    browseGiteeDir(row.path)
  } else if (row.name.endsWith('.md') || row.name.endsWith('.markdown')) {
    giteeForm.path = row.path
    ElMessage.success('已选中: ' + row.name)
  } else {
    ElMessage.warning('请选择 Markdown 文件（.md）')
  }
}

async function handleImport() {
  const info = parseGiteeRepo(giteeForm.repoUrl)
  if (!info) { ElMessage.warning('请输入正确的Gitee仓库地址'); return }
  if (!giteeForm.path) { ElMessage.warning('请输入或选择文件路径'); return }

  importLoading.value = true
  try {
    const url = `https://gitee.com/api/v5/repos/${info.owner}/${info.repo}/contents/${giteeForm.path}`
    const params = giteeForm.token ? `?access_token=${giteeForm.token}` : ''
    const res = await fetch(url + params)
    if (!res.ok) throw new Error(`获取文件失败: ${res.status}`)
    const data = await res.json()

    if (!data.content) throw new Error('文件内容为空')
    const content = decodeURIComponent(escape(atob(data.content)))

    // 从 markdown 提取标题（第一个 # 标题）
    const titleMatch = content.match(/^#\s+(.+)$/m)
    const title = titleMatch ? titleMatch[1].trim() : giteeForm.path.replace(/.*\//, '').replace(/\.md$/, '')

    // 生成 slug
    const slug = giteeForm.path.replace(/.*\//, '').replace(/\.md$/, '').replace(/[^a-zA-Z0-9\u4e00-\u9fa5-]/g, '-').toLowerCase()

    // 跳转到新增页面并携带导入数据
    sessionStorage.setItem('gitee_import', JSON.stringify({ title, slug, content }))
    showImportDialog.value = false
    router.push('/article/create?from=gitee')
    ElMessage.success('导入成功，请完善文章信息后发布')
  } catch (e: any) {
    ElMessage.error(e.message || '导入失败')
  } finally { importLoading.value = false }
}

onMounted(async () => {
  categories.value = (await categoryApi.list()) || []
  loadData()
})
</script>
