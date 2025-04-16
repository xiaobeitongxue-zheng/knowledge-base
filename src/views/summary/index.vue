<template>
  <div class="summary-container">
    <div class="page-header">
      <h2>文档摘要</h2>
      <el-button type="primary" @click="refreshSummaries">
        <el-icon><Refresh /></el-icon> 刷新
      </el-button>
    </div>

    <el-card class="main-card">
      <el-form :inline="true" class="search-form">
        <el-form-item>
          <el-input 
            v-model="searchKeyword" 
            placeholder="搜索文档标题" 
            prefix-icon="Search"
            clearable
            @keyup.enter="searchSummaries"
          />
        </el-form-item>
        <el-form-item>
          <el-select v-model="filterType" placeholder="文档类型" clearable>
            <el-option label="全部" value="" />
            <el-option label="文档" value="document" />
            <el-option label="表格" value="spreadsheet" />
            <el-option label="幻灯片" value="presentation" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="searchSummaries">查询</el-button>
          <el-button @click="resetFilters">重置</el-button>
        </el-form-item>
      </el-form>

      <el-tabs v-model="activeTab">
        <el-tab-pane label="最近文档" name="recent">
          <document-summary-list 
            :summaries="recentSummaries" 
            @favorite="toggleFavorite"
            @view="viewDocument"
            @download="downloadDocument"
            @share="shareDocument"
            @delete="deleteDocument"
          />
        </el-tab-pane>
        <el-tab-pane label="收藏文档" name="favorite">
          <document-summary-list 
            :summaries="favoriteSummaries" 
            @favorite="toggleFavorite"
            @view="viewDocument"
            @download="downloadDocument"
            @share="shareDocument"
            @delete="deleteDocument"
          />
        </el-tab-pane>
        <el-tab-pane label="团队文档" name="team">
          <document-summary-list 
            :summaries="teamSummaries" 
            @favorite="toggleFavorite"
            @view="viewDocument"
            @download="downloadDocument"
            @share="shareDocument"
            @delete="deleteDocument"
          />
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { Search, Refresh } from '@element-plus/icons-vue'
import DocumentSummaryList from '@/components/summary/DocumentSummaryList.vue'

// 标签页
const activeTab = ref('recent')

// 搜索和筛选
const searchKeyword = ref('')
const filterType = ref('')

// 定义文档摘要类型
interface DocumentSummary {
  id: number;
  title: string;
  summary: string;
  type: string;
  author: string;
  updateTime: string;
  favorite: boolean;
  team: string;
}

// 文档摘要列表
const summaries = ref<DocumentSummary[]>([
  {
    id: 1,
    title: '产品需求说明书',
    summary: '本文档详细描述了产品的功能需求、用户故事、技术规格和开发计划...',
    type: 'document',
    author: '张三',
    updateTime: '2024-04-09 15:30',
    favorite: true,
    team: '产品部'
  },
  {
    id: 2,
    title: '2024年Q1财务报表',
    summary: '本表格包含2024年第一季度的收入报表、支出明细和财务分析...',
    type: 'spreadsheet',
    author: '李四',
    updateTime: '2024-04-08 16:45',
    favorite: false,
    team: '财务部'
  },
  {
    id: 3,
    title: '团队工作计划',
    summary: '本文档包含团队近期工作计划、任务分配和重要里程碑...',
    type: 'document',
    author: '王五',
    updateTime: '2024-04-07 11:30',
    favorite: true,
    team: '研发部'
  },
  {
    id: 4,
    title: '公司介绍演示文稿',
    summary: '本演示文稿包含公司介绍、产品线展示、团队介绍和未来规划...',
    type: 'presentation',
    author: '赵六',
    updateTime: '2024-04-06 14:20',
    favorite: false,
    team: '营销部'
  },
  {
    id: 5,
    title: '技术架构设计',
    summary: '本文档详细介绍了系统架构设计、技术选型、数据流程和部署方案...',
    type: 'document',
    author: '孙七',
    updateTime: '2024-04-05 10:15',
    favorite: true,
    team: '研发部'
  }
])

// 根据不同类型筛选摘要
const recentSummaries = computed(() => {
  return filterSummaries(summaries.value)
})

const favoriteSummaries = computed(() => {
  return filterSummaries(summaries.value.filter(summary => summary.favorite))
})

const teamSummaries = computed(() => {
  return filterSummaries(summaries.value.filter(summary => summary.team))
})

// 过滤逻辑
function filterSummaries(list: DocumentSummary[]): DocumentSummary[] {
  let filtered = list
  
  if (searchKeyword.value) {
    filtered = filtered.filter((item: DocumentSummary) => 
      item.title.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
      item.summary.toLowerCase().includes(searchKeyword.value.toLowerCase())
    )
  }
  
  if (filterType.value) {
    filtered = filtered.filter((item: DocumentSummary) => item.type === filterType.value)
  }
  
  return filtered
}

// 刷新摘要
const refreshSummaries = () => {
  // 这里应该调用API获取最新摘要
  console.log('刷新文档摘要')
}

// 搜索摘要
const searchSummaries = () => {
  // 触发筛选
  console.log('搜索关键词:', searchKeyword.value, '文档类型:', filterType.value)
}

// 重置筛选条件
const resetFilters = () => {
  searchKeyword.value = ''
  filterType.value = ''
}

// 切换收藏状态
const toggleFavorite = (id: number) => {
  const summary = summaries.value.find(summary => summary.id === id)
  if (summary) {
    summary.favorite = !summary.favorite
    console.log(`${summary.favorite ? '添加' : '取消'}收藏:`, summary.title)
  }
}

// 查看文档
const viewDocument = (id: number) => {
  const summary = summaries.value.find(summary => summary.id === id)
  if (summary) {
    console.log('查看文档:', summary.title)
    // 这里应该实现跳转到文档详情页或打开预览窗口
  }
}

// 下载文档
const downloadDocument = (id: number) => {
  const summary = summaries.value.find(summary => summary.id === id)
  if (summary) {
    console.log('下载文档:', summary.title)
    // 这里应该调用API下载文档
  }
}

// 分享文档
const shareDocument = (id: number) => {
  const summary = summaries.value.find(summary => summary.id === id)
  if (summary) {
    console.log('分享文档:', summary.title)
    // 这里应该打开分享对话框
  }
}

// 删除文档
const deleteDocument = (id: number) => {
  summaries.value = summaries.value.filter(summary => summary.id !== id)
  console.log('文档已删除')
}
</script>

<style scoped>
.summary-container {
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

.main-card {
  margin-bottom: 20px;
}

.search-form {
  margin-bottom: 20px;
}

:deep(.el-input) {
  width: 260px;
}

:deep(.el-select) {
  width: 180px;
}
</style>