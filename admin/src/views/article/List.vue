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
      <el-button type="primary" @click="$router.push('/article/create')">新增文章</el-button>
    </div>
    <el-table :data="list" border stripe>
      <el-table-column prop="title" label="标题" min-width="200" />
      <el-table-column label="分类" width="120"><template #default="{ row }">{{ row.category?.categoryName }}</template></el-table-column>
      <el-table-column prop="viewCount" label="阅读" width="80" align="center" />
      <el-table-column label="置顶" width="70" align="center"><template #default="{ row }"><el-tag :type="row.isTop ? 'warning' : 'info'" size="small">{{ row.isTop ? '是' : '否' }}</el-tag></template></el-table-column>
      <el-table-column label="状态" width="80" align="center"><template #default="{ row }"><el-tag :type="row.isPublish ? 'success' : 'info'" size="small">{{ row.isPublish ? '已发布' : '草稿' }}</el-tag></template></el-table-column>
      <el-table-column prop="createTime" label="创建时间" width="170" />
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="$router.push(`/article/edit/${row.id}`)">编辑</el-button>
          <el-popconfirm title="确定删除？" @confirm="handleDelete(row.id)"><template #reference><el-button link type="danger">删除</el-button></template></el-popconfirm>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination style="margin-top:16px;justify-content:flex-end" v-model:current-page="query.page" v-model:page-size="query.pageSize" :total="total" :page-sizes="[10,20,50]" layout="total, sizes, prev, pager, next" @size-change="loadData" @current-change="loadData" />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { articleApi, categoryApi } from '../../api'
import type { Article, ArticleCategory } from '../../types'

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

onMounted(async () => {
  categories.value = (await categoryApi.list()) || []
  loadData()
})
</script>
