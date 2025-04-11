<template>
  <div class="search-container">
    <div class="page-header">
      <h2>知识检索</h2>
    </div>

    <!-- 搜索框区域 -->
    <el-card class="search-card">
      <div class="search-box">
        <el-input
          v-model="searchKeyword"
          placeholder="输入关键词进行全文搜索"
          clearable
          class="main-search-input"
          @keyup.enter="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
          <template #append>
            <el-button type="primary" @click="handleSearch">搜索</el-button>
          </template>
        </el-input>
      </div>

      <div class="search-options">
        <div class="option-row">
          <span class="option-label">搜索范围:</span>
          <el-radio-group v-model="searchScope" size="small">
            <el-radio-button label="all">全部</el-radio-button>
            <el-radio-button label="title">标题</el-radio-button>
            <el-radio-button label="content">内容</el-radio-button>
            <el-radio-button label="tag">标签</el-radio-button>
            <el-radio-button label="author">作者</el-radio-button>
          </el-radio-group>
        </div>

        <div class="option-row">
          <span class="option-label">文档类型:</span>
          <el-checkbox-group v-model="docTypes" size="small">
            <el-checkbox-button label="document">文档</el-checkbox-button>
            <el-checkbox-button label="image">图片</el-checkbox-button>
            <el-checkbox-button label="video">视频</el-checkbox-button>
            <el-checkbox-button label="audio">音频</el-checkbox-button>
            <el-checkbox-button label="other">其他</el-checkbox-button>
          </el-checkbox-group>
        </div>

        <div class="option-row">
          <span class="option-label">时间范围:</span>
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            size="small"
            class="date-picker"
          />
          <span class="option-label category-label">分类:</span>
          <el-select
            v-model="categoryFilter"
            placeholder="个人知识检索"
            clearable
            size="small"
            class="category-dropdown"
          >
            <el-option
              v-for="item in categories"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </div>

        <div class="advanced-search">
          <el-link type="primary" @click="advancedSearch = !advancedSearch">
            {{ advancedSearch ? '收起高级搜索' : '展开高级搜索' }}
            <el-icon>
              <component :is="advancedSearch ? 'ArrowUp' : 'ArrowDown'" />
            </el-icon>
          </el-link>
        </div>

        <el-collapse-transition>
          <div v-show="advancedSearch" class="advanced-options">
            <div class="option-row">
              <span class="option-label">精确匹配:</span>
              <el-switch v-model="exactMatch" size="small" />

              <span class="option-label">包含附件:</span>
              <el-switch v-model="includeAttachments" size="small" />
              
              <span class="option-label">仅我的文档:</span>
              <el-switch v-model="onlyMyDocs" size="small" />
            </div>

            <div class="option-row">
              <span class="option-label">排序方式:</span>
              <el-radio-group v-model="sortBy" size="small">
                <el-radio-button label="relevance">相关度</el-radio-button>
                <el-radio-button label="time_desc">最新创建</el-radio-button>
                <el-radio-button label="time_asc">最早创建</el-radio-button>
                <el-radio-button label="visits">访问量</el-radio-button>
              </el-radio-group>
            </div>

            <div class="option-row">
              <el-button size="small" @click="resetSearch">重置</el-button>
              <el-button type="primary" size="small" @click="handleSearch">搜索</el-button>
            </div>
          </div>
        </el-collapse-transition>
      </div>
    </el-card>

    <!-- 搜索历史和推荐 -->
    <el-card v-if="!hasSearched" class="history-card">
      <template #header>
        <div class="card-header">
          <span>搜索历史</span>
          <el-link type="danger" @click="clearHistory">清空历史</el-link>
        </div>
      </template>
      <div class="history-list">
        <div v-for="(item, index) in searchHistory" :key="index" class="history-item" @click="useHistoryItem(item)">
          <el-icon><Clock /></el-icon>
          <span>{{ item.keyword }}</span>
          <span class="history-time">{{ item.time }}</span>
        </div>
      </div>

      <el-divider>热门搜索</el-divider>
      <div class="hot-keywords">
        <el-tag
          v-for="(keyword, index) in hotKeywords"
          :key="index"
          @click="searchKeyword = keyword; handleSearch()"
          class="hot-keyword-tag"
          effect="plain"
        >
          {{ keyword }}
        </el-tag>
      </div>
    </el-card>

    <!-- 搜索结果 -->
    <template v-if="hasSearched">
      <div class="search-result-header">
        <div class="result-summary">
          找到 <span class="highlight">{{ total }}</span> 条结果 (用时 {{ searchTime }}秒)
        </div>
      </div>

      <el-card v-if="searchResults.length === 0" class="empty-result">
        <el-empty description="没有找到匹配的结果">
          <template #description>
            <p>没有找到与"{{ searchKeyword }}"相关的内容</p>
            <p class="suggestion">建议：</p>
            <ul>
              <li>请检查您的拼写</li>
              <li>尝试使用更为简洁的关键词</li>
              <li>尝试使用更通用的关键词</li>
              <li>减少筛选条件</li>
            </ul>
          </template>
        </el-empty>
      </el-card>

      <el-card v-else class="result-list-card">
        <div class="result-filters">
          <div class="filter-pills">
            <el-tag
              v-if="searchKeyword"
              closable
              @close="searchKeyword = ''; handleSearch()"
            >
              关键词: {{ searchKeyword }}
            </el-tag>
            <el-tag
              v-if="categoryFilter"
              closable
              @close="categoryFilter = ''; handleSearch()"
            >
              分类: {{ getCategoryLabel(categoryFilter) }}
            </el-tag>
            <el-tag
              v-if="dateRange && dateRange.length === 2"
              closable
              @close="dateRange = null; handleSearch()"
            >
              时间: {{ formatDateRange(dateRange) }}
            </el-tag>
          </div>
        </div>

        <el-tabs v-model="resultTab" class="result-tabs">
          <el-tab-pane label="全部" name="all"></el-tab-pane>
          <el-tab-pane :label="`文档(${docCount})`" name="document"></el-tab-pane>
          <el-tab-pane :label="`图片(${imageCount})`" name="image"></el-tab-pane>
          <el-tab-pane :label="`视频(${videoCount})`" name="video"></el-tab-pane>
        </el-tabs>

        <div class="search-result-list">
          <div 
            v-for="result in filteredResults" 
            :key="result.id" 
            class="result-item"
            @click="openResult(result)"
          >
            <div class="result-icon">
              <el-icon :size="24">
                <component :is="getResultIcon(result.type)"></component>
              </el-icon>
            </div>
            <div class="result-content">
              <div class="result-title">
                <span v-html="highlightText(result.title, searchKeyword)"></span>
                <el-tag size="small" effect="plain" class="result-type-tag">{{ result.type }}</el-tag>
              </div>
              <div class="result-preview" v-html="highlightText(result.preview, searchKeyword)"></div>
              <div class="result-meta">
                <span class="meta-item">
                  <el-icon><User /></el-icon> {{ result.author }}
                </span>
                <span class="meta-item">
                  <el-icon><Calendar /></el-icon> {{ result.updateTime }}
                </span>
                <span class="meta-item">
                  <el-icon><View /></el-icon> {{ result.viewCount }}次阅读
                </span>
                <span class="meta-tag" v-for="tag in result.tags" :key="tag">
                  <el-tag size="small" effect="plain">#{{ tag }}</el-tag>
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- 分页 -->
        <div class="pagination-container">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[10, 20, 50, 100]"
            :total="total"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </el-card>
    </template>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { 
  Search, ArrowUp, ArrowDown, Clock, Document, Picture, 
  VideoCamera, Headset, User, Calendar, View, Files
} from '@element-plus/icons-vue'

const router = useRouter()

// 搜索参数
const searchKeyword = ref('')
const searchScope = ref('all')
const docTypes = ref(['document', 'image', 'video', 'audio', 'other'])
const dateRange = ref<Date[] | null>(null)
const categoryFilter = ref('')
const advancedSearch = ref(false)
const exactMatch = ref(false)
const includeAttachments = ref(true)
const onlyMyDocs = ref(false)
const sortBy = ref('relevance')

// 搜索历史
const searchHistory = ref([
  { keyword: '文本摘要算法', time: '2024-04-09' },
  { keyword: '知识库设计', time: '2024-04-08' },
  { keyword: '团队协作', time: '2024-04-08' },
  { keyword: '产品需求', time: '2024-04-07' }
])

// 热门搜索关键词
const hotKeywords = ref([
  '知识管理', '文本摘要', '企业知识库', '团队协作',
  '智能搜索', '用户权限', '研发规范', '产品设计'
])

// 分类列表
const categories = [
  { label: '个人知识检索', value: 'personal' },
  { label: '团队知识检索', value: 'team' },
  { label: '社区知识检索', value: 'community' }
]

// 搜索结果状态
const hasSearched = ref(false)
const searchTime = ref(0.35)
const resultTab = ref('all')
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 搜索结果
const searchResults = ref([
  {
    id: 1,
    title: '基于深度学习的文本摘要算法研究',
    preview: '本文研究了基于深度学习的文本摘要技术，包括抽取式摘要和生成式摘要两种方法，并对比了BERT、GPT等模型在摘要任务上的表现。',
    author: '张三',
    updateTime: '2024-04-09 14:30',
    viewCount: 128,
    type: 'document',
    category: 'tech',
    tags: ['深度学习', '文本摘要', 'BERT', 'GPT']
  },
  {
    id: 2,
    title: '企业知识库系统设计方案',
    preview: '该方案详细阐述了企业知识库系统的总体架构、功能模块、数据模型和技术选型，为知识管理平台的开发提供了完整的设计依据。',
    author: '李四',
    updateTime: '2024-04-08 16:45',
    viewCount: 96,
    type: 'document',
    category: 'product',
    tags: ['系统设计', '知识库', '架构']
  },
  {
    id: 3,
    title: '知识管理平台功能演示视频',
    preview: '这是一个展示企业知识管理平台主要功能的演示视频，包括文档创建、编辑、分享、摘要生成等核心功能的操作流程。',
    author: '王五',
    updateTime: '2024-04-08 11:20',
    viewCount: 75,
    type: 'video',
    category: 'product',
    tags: ['演示', '知识管理', '视频教程']
  },
  {
    id: 4,
    title: '团队协作最佳实践指南',
    preview: '本指南总结了团队协作过程中的最佳实践，包括知识共享、文档协作、版本管理和成员沟通等方面的经验和建议。',
    author: '赵六',
    updateTime: '2024-04-07 15:10',
    viewCount: 83,
    type: 'document',
    category: 'management',
    tags: ['团队协作', '最佳实践', '知识共享']
  },
  {
    id: 5,
    title: '知识库系统原型设计图',
    preview: '知识库系统的UI设计原型图，展示了系统的页面布局、交互设计和视觉风格，为前端开发提供了直观的参考。',
    author: '钱七',
    updateTime: '2024-04-07 10:30',
    viewCount: 67,
    type: 'image',
    category: 'product',
    tags: ['原型设计', 'UI', '知识库']
  },
  {
    id: 6,
    title: '用户需求分析会议录音',
    preview: '这是与客户进行的需求分析会议的录音文件，内容包括客户对知识管理平台的功能需求、使用场景和关键痛点。',
    author: '孙八',
    updateTime: '2024-04-06 14:20',
    viewCount: 45,
    type: 'audio',
    category: 'product',
    tags: ['需求分析', '会议记录', '用户反馈']
  }
])

// 根据类型统计结果数量
const docCount = computed(() => searchResults.value.filter(item => item.type === 'document').length)
const imageCount = computed(() => searchResults.value.filter(item => item.type === 'image').length)
const videoCount = computed(() => searchResults.value.filter(item => item.type === 'video').length)

// 根据Tab筛选结果
const filteredResults = computed(() => {
  if (resultTab.value === 'all') {
    return searchResults.value
  } else {
    return searchResults.value.filter(item => item.type === resultTab.value)
  }
})

// 根据资源类型获取图标
const getResultIcon = (type: string) => {
  const iconMap: Record<string, string> = {
    document: 'Document',
    image: 'Picture',
    video: 'VideoCamera',
    audio: 'Headset',
    other: 'Files'
  }
  return iconMap[type] || 'Document'
}

// 根据分类值获取分类标签
const getCategoryLabel = (value: string) => {
  const category = categories.find((item: {label: string, value: string}) => item.value === value)
  return category ? category.label : value
}

// 格式化日期范围
const formatDateRange = (range: Date[] | null) => {
  if (!range || range.length !== 2) return ''
  const startDate = range[0].toLocaleDateString()
  const endDate = range[1].toLocaleDateString()
  return `${startDate} 至 ${endDate}`
}

// 搜索关键词高亮
const highlightText = (text: string, keyword: string) => {
  if (!keyword) return text
  const reg = new RegExp(`(${keyword})`, 'gi')
  return text.replace(reg, '<span class="highlight">$1</span>')
}

// 执行搜索
const handleSearch = () => {
  // 实际应用中这里应该调用API进行搜索
  console.log('执行搜索', {
    keyword: searchKeyword.value,
    scope: searchScope.value,
    docTypes: docTypes.value,
    dateRange: dateRange.value,
    category: categoryFilter.value,
    exactMatch: exactMatch.value,
    includeAttachments: includeAttachments.value,
    onlyMyDocs: onlyMyDocs.value,
    sortBy: sortBy.value,
    page: currentPage.value,
    pageSize: pageSize.value
  })

  // 模拟搜索结果
  hasSearched.value = true
  total.value = searchResults.value.length
  
  // 添加到搜索历史
  if (searchKeyword.value) {
    const now = new Date().toLocaleDateString()
    const existingIndex = searchHistory.value.findIndex(item => item.keyword === searchKeyword.value)
    
    if (existingIndex >= 0) {
      searchHistory.value.splice(existingIndex, 1)
    }
    
    searchHistory.value.unshift({
      keyword: searchKeyword.value,
      time: now
    })
    
    // 限制历史记录条数
    if (searchHistory.value.length > 10) {
      searchHistory.value = searchHistory.value.slice(0, 10)
    }
  }
}

// 重置搜索条件
const resetSearch = () => {
  searchKeyword.value = ''
  searchScope.value = 'all'
  docTypes.value = ['document', 'image', 'video', 'audio', 'other']
  dateRange.value = null
  categoryFilter.value = ''
  exactMatch.value = false
  includeAttachments.value = true
  onlyMyDocs.value = false
  sortBy.value = 'relevance'
}

// 清空搜索历史
const clearHistory = () => {
  searchHistory.value = []
}

// 使用历史搜索项
const useHistoryItem = (item: any) => {
  searchKeyword.value = item.keyword
  handleSearch()
}

// 打开搜索结果
const openResult = (result: any) => {
  // 根据不同类型的结果执行不同的打开方式
  switch (result.type) {
    case 'document':
      router.push(`/knowledge/browse?id=${result.id}`)
      break
    case 'image':
    case 'video':
    case 'audio':
      // 可以打开预览对话框
      console.log('预览文件:', result)
      break
    default:
      router.push(`/knowledge/browse?id=${result.id}`)
  }
}

// 分页处理
const handleSizeChange = (val: number) => {
  pageSize.value = val
  handleSearch()
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
  handleSearch()
}

// 监听路由查询参数
watch(() => router.currentRoute.value.query, (query) => {
  if (query.keyword) {
    searchKeyword.value = query.keyword as string
    handleSearch()
  }
}, { immediate: true })

// 组件挂载时初始化
onMounted(() => {
  // 从URL参数读取搜索关键词
  const query = router.currentRoute.value.query
  if (query.keyword) {
    searchKeyword.value = query.keyword as string
    handleSearch()
  }
})
</script>

<style scoped>
.search-container {
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

.search-card {
  margin-bottom: 20px;
}

.search-box {
  display: flex;
  justify-content: center;
  margin-bottom: 15px;
}

.main-search-input {
  width: 80%;
  max-width: 800px;
}

.search-options {
  padding: 0 20px;
}

.option-row {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  flex-wrap: wrap;
}

.option-label {
  margin-right: 10px;
  color: #606266;
  min-width: 70px;
}

.time-label {
  margin-left: 20px;
}

.advanced-search {
  display: flex;
  justify-content: center;
  margin: 10px 0;
}

.advanced-options {
  background-color: #f5f7fa;
  padding: 15px;
  border-radius: 4px;
  margin-top: 10px;
}

.history-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.history-list {
  margin-bottom: 20px;
}

.history-item {
  display: flex;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #ebeef5;
  cursor: pointer;
}

.history-item:hover {
  background-color: #f5f7fa;
}

.history-item .el-icon {
  margin-right: 10px;
  color: #909399;
}

.history-time {
  margin-left: auto;
  color: #909399;
  font-size: 12px;
}

.hot-keywords {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.hot-keyword-tag {
  cursor: pointer;
  margin-right: 5px;
  margin-bottom: 5px;
}

.search-result-header {
  margin-bottom: 20px;
}

.result-summary {
  font-size: 14px;
  color: #606266;
}

.highlight {
  color: #409EFF;
  font-weight: bold;
}

.empty-result {
  padding: 40px 0;
}

.suggestion {
  margin-top: 20px;
  text-align: left;
  color: #909399;
}

.result-list-card {
  margin-bottom: 20px;
}

.result-filters {
  padding: 0 0 15px 0;
}

.filter-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.search-result-list {
  margin-top: 10px;
}

.result-item {
  display: flex;
  padding: 15px 0;
  border-bottom: 1px solid #ebeef5;
  cursor: pointer;
}

.result-item:hover {
  background-color: #f5f7fa;
}

.result-icon {
  margin-right: 15px;
  color: #409EFF;
}

.result-content {
  flex: 1;
}

.result-title {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 8px;
  color: #303133;
  display: flex;
  align-items: center;
}

.result-type-tag {
  margin-left: 10px;
}

.result-preview {
  margin-bottom: 10px;
  color: #606266;
  line-height: 1.6;
}

.result-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  font-size: 12px;
  color: #909399;
}

.meta-item {
  display: flex;
  align-items: center;
  margin-right: 15px;
}

.meta-item .el-icon {
  margin-right: 4px;
}

.meta-tag {
  margin-right: 5px;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.date-picker {
  width: 250px; /* 调整日期选择框宽度以适应日期显示 */
  margin-right: 10px; /* 添加间距 */
}

.category-label {
  margin-left: 20px; /* 调整分类文字与日期选择框的间距 */
}

.category-dropdown {
  width: auto; /* 自动调整宽度 */
  min-width: 120px; /* 设置最小宽度以适应文字 */
}
</style>