<template>
  <div class="knowledge-browse">
    <div class="page-header">
      <h2>知识浏览</h2>
      <div class="header-actions">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索文档"
          clearable
          class="search-input"
          @keyup.enter="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-select v-model="categoryFilter" placeholder="分类" clearable @change="filterByCategory">
          <el-option
            v-for="item in categories"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </div>
    </div>

    <el-card class="filter-card">
      <div class="filter-header">
        <div class="filter-title">
          <el-icon><Filter /></el-icon> 筛选条件
        </div>
        <div class="view-mode">
          <el-radio-group v-model="viewMode" size="small">
            <el-radio-button label="grid">
              <el-icon><Grid /></el-icon>
            </el-radio-button>
            <el-radio-button label="list">
              <el-icon><List /></el-icon>
            </el-radio-button>
          </el-radio-group>
        </div>
      </div>
      <el-divider />
      <div class="filter-tags">
        <div class="filter-group">
          <div class="group-title">热门标签:</div>
          <div class="tag-list">
            <el-tag
              v-for="tag in popularTags"
              :key="tag.name"
              :type="selectedTags.includes(tag.name) ? 'primary' : ''"
              effect="plain"
              class="filter-tag"
              @click="toggleTag(tag.name)"
            >
              {{ tag.name }} ({{ tag.count }})
            </el-tag>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 网格视图 -->
    <template v-if="viewMode === 'grid'">
      <el-row :gutter="20" class="document-grid">
        <el-col :xs="24" :sm="12" :md="8" :lg="6" v-for="doc in documents" :key="doc.id">
          <el-card 
            class="document-card" 
            shadow="hover" 
            @click="viewDocument(doc)"
          >
            <div class="document-icon">
              <el-icon :size="40"><Document /></el-icon>
            </div>
            <div class="document-title">{{ doc.title }}</div>
            <div class="document-meta">
              <div class="author">作者: {{ doc.author }}</div>
              <div class="update-time">更新: {{ doc.updateTime }}</div>
            </div>
            <div class="document-tags">
              <el-tag 
                v-for="tag in doc.tags" 
                :key="tag" 
                size="small" 
                effect="plain" 
                class="doc-tag"
              >
                {{ tag }}
              </el-tag>
            </div>
            <div class="document-summary">{{ doc.summary }}</div>
          </el-card>
        </el-col>
      </el-row>
    </template>

    <!-- 列表视图 -->
    <template v-else>
      <el-card class="document-list">
        <el-table :data="documents" style="width: 100%">
          <el-table-column prop="title" label="标题" min-width="250">
            <template #default="{ row }">
              <div class="document-title-cell">
                <el-icon><Document /></el-icon>
                <el-link @click.prevent="viewDocument(row)">{{ row.title }}</el-link>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="author" label="作者" width="120" />
          <el-table-column prop="category" label="分类" width="120" />
          <el-table-column prop="updateTime" label="更新时间" width="160" sortable />
          <el-table-column label="标签" width="220">
            <template #default="{ row }">
              <div class="tag-container">
                <el-tag 
                  v-for="tag in row.tags" 
                  :key="tag" 
                  size="small" 
                  effect="plain" 
                  class="doc-tag"
                >
                  {{ tag }}
                </el-tag>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="visitCount" label="阅读量" width="100" sortable />
        </el-table>
      </el-card>
    </template>

    <!-- 分页组件 -->
    <div class="pagination-container">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[12, 24, 48, 96]"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 文档详情 -->
    <el-dialog 
      v-model="dialogVisible" 
      title="文档详情" 
      width="80%" 
      fullscreen
    >
      <knowledge-detail :document-id="selectedDocumentId" />
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Document, Search, Filter, Grid, List } from '@element-plus/icons-vue'
import KnowledgeDetail from '@/components/knowledge/detail.vue'

const router = useRouter()

// 视图模式
const viewMode = ref('grid')

// 搜索与筛选
const searchKeyword = ref('')
const categoryFilter = ref('')
const selectedTags = ref<string[]>([])

// 分页
const currentPage = ref(1)
const pageSize = ref(12)
const total = ref(120)

// 对话框
const dialogVisible = ref(false)
const selectedDocumentId = ref(0)

// 分类列表
const categories = [
  { label: '产品文档', value: 'product' },
  { label: '技术文档', value: 'tech' },
  { label: '营销文档', value: 'marketing' },
  { label: '管理制度', value: 'management' },
  { label: '研发规范', value: 'development' }
]

// 热门标签
const popularTags = [
  { name: '产品', count: 42 },
  { name: '技术', count: 38 },
  { name: '研发', count: 24 },
  { name: '规范', count: 18 },
  { name: '流程', count: 15 },
  { name: '方案', count: 12 },
  { name: '总结', count: 10 }
]

// 文档数据
const documents = ref([
  {
    id: 1,
    title: '产品需求说明书',
    author: '李四',
    category: '产品文档',
    updateTime: '2024-04-09 14:30',
    tags: ['产品', '需求', '文档'],
    visitCount: 128,
    summary: '本文档描述了产品功能需求、用户场景和界面规划等内容。'
  },
  {
    id: 2,
    title: '技术架构设计',
    author: '张三',
    category: '技术文档',
    updateTime: '2024-04-09 11:20',
    tags: ['技术', '架构', '设计'],
    visitCount: 89,
    summary: '详细说明系统架构设计、技术选型和实现方案。'
  },
  {
    id: 3,
    title: '项目开发计划',
    author: '王五',
    category: '项目文档',
    updateTime: '2024-04-08 16:45',
    tags: ['项目', '计划', '开发'],
    visitCount: 56,
    summary: '项目整体规划、里程碑和资源分配方案。'
  },
  {
    id: 4,
    title: '用户界面设计规范',
    author: '赵六',
    category: '设计文档',
    updateTime: '2024-04-08 09:15',
    tags: ['设计', '规范', 'UI'],
    visitCount: 72,
    summary: '统一的UI设计规范，包括色彩、布局、控件使用等。'
  },
  {
    id: 5,
    title: '数据库设计文档',
    author: '张三',
    category: '技术文档',
    updateTime: '2024-04-07 15:40',
    tags: ['技术', '数据库', '设计'],
    visitCount: 63,
    summary: '详细的数据库表结构设计与关系说明。'
  },
  {
    id: 6,
    title: '接口规范文档',
    author: '李四',
    category: '技术文档',
    updateTime: '2024-04-07 10:20',
    tags: ['技术', 'API', '规范'],
    visitCount: 58,
    summary: 'RESTful API设计规范与接口文档说明。'
  }
])

// 切换标签
const toggleTag = (tag: string) => {
  const index = selectedTags.value.indexOf(tag)
  if (index === -1) {
    selectedTags.value.push(tag)
  } else {
    selectedTags.value.splice(index, 1)
  }
  // 触发筛选
  filterDocuments()
}

// 按分类筛选
const filterByCategory = () => {
  filterDocuments()
}

// 搜索
const handleSearch = () => {
  filterDocuments()
}

// 筛选文档
const filterDocuments = () => {
  // 实际项目中这里应该调用API进行筛选
  console.log('筛选条件:', {
    keyword: searchKeyword.value,
    category: categoryFilter.value,
    tags: selectedTags.value
  })
}

// 查看文档
const viewDocument = (document: any) => {
  selectedDocumentId.value = document.id
  dialogVisible.value = true
}

// 处理分页变化
const handleSizeChange = (val: number) => {
  pageSize.value = val
  // 重新加载数据
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
  // 重新加载数据
}

// 组件挂载时加载数据
onMounted(() => {
  // 实际项目中这里应该调用API加载数据
})
</script>

<style scoped>
.knowledge-browse {
  padding: 0;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
  font-size: 22px;
  font-weight: 500;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.search-input {
  width: 250px;
}

.filter-card {
  margin-bottom: 20px;
}

.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.filter-title {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 16px;
  font-weight: 500;
}

.filter-tags {
  margin-top: 10px;
}

.filter-group {
  margin-bottom: 15px;
}

.group-title {
  font-weight: 500;
  margin-bottom: 10px;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.filter-tag {
  cursor: pointer;
  margin-right: 5px;
}

.document-grid {
  margin-bottom: 20px;
}

.document-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  margin-bottom: 20px;
  transition: transform 0.3s;
}

.document-card:hover {
  transform: translateY(-5px);
}

.document-icon {
  display: flex;
  justify-content: center;
  margin-bottom: 15px;
  color: #409EFF;
}

.document-title {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 10px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
}

.document-meta {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #909399;
  margin-bottom: 10px;
}

.document-tags {
  margin-bottom: 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.doc-tag {
  margin-right: 5px;
}

.document-summary {
  font-size: 13px;
  color: #606266;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
}

.document-title-cell {
  display: flex;
  align-items: center;
  gap: 5px;
}

.tag-container {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
  margin-bottom: 20px;
}
</style> 