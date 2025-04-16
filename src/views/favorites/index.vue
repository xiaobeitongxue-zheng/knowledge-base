<template>
  <div class="favorites-container">
    <!-- 筛选栏 -->
    <el-card class="filter-card">
      <div class="filter-container">
        <div class="filter-item">
          <span class="filter-label">来源：</span>
          <el-select v-model="filterSource" placeholder="选择来源" class="filter-select">
            <el-option label="全部" value="all" />
            <el-option label="个人知识库" value="personal" />
            <el-option label="团队知识库" value="team" />
            <el-option label="社区交流" value="community" />
          </el-select>
        </div>
        <div class="filter-item">
          <span class="filter-label">分类：</span>
          <el-select v-model="filterCategory" placeholder="选择分类" class="filter-select">
            <el-option label="全部" value="" />
            <el-option label="技术文档" value="技术文档" />
            <el-option label="产品文档" value="产品文档" />
            <el-option label="市场文档" value="市场文档" />
            <el-option label="研究报告" value="研究报告" />
            <el-option label="其他文档" value="其他文档" />
          </el-select>
          <el-button type="primary" size="small" class="refresh-btn" @click="refreshData">
            <el-icon><RefreshRight /></el-icon> 刷新
          </el-button>
        </div>
        <div class="filter-item">
          <span class="filter-label">收藏时间：</span>
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            class="date-picker"
          />
        </div>
        <div class="filter-item">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索标题、内容或标签"
            class="search-input"
            clearable
            @keyup.enter="handleSearch"
          >
            <template #suffix>
              <el-icon class="search-icon" @click="handleSearch"><Search /></el-icon>
            </template>
          </el-input>
        </div>
      </div>
    </el-card>

    <!-- 收藏列表 -->
    <el-card v-if="filteredFavorites.length > 0" class="favorites-card">
      <el-table :data="paginatedFavorites" style="width: 100%">
        <el-table-column type="expand">
          <template #default="props">
            <div class="expanded-content">
              <div class="content-preview">
                <p>{{ props.row.abstract }}</p>
              </div>
              <div class="content-tags">
                <el-tag
                  v-for="tag in props.row.tags"
                  :key="tag"
                  class="content-tag"
                  size="small"
                >
                  {{ tag }}
                </el-tag>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="title" label="标题" min-width="250">
          <template #default="scope">
            <div class="title-cell">
              <el-icon :class="getSourceIconClass(scope.row.source)"><component :is="getSourceIcon(scope.row.source)" /></el-icon>
              <router-link :to="scope.row.sourceUrl" class="title-link">
                {{ scope.row.title }}
              </router-link>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="category" label="分类" width="120" />
        <el-table-column prop="author" label="作者" width="100" />
        <el-table-column prop="source" label="来源" width="120">
          <template #default="scope">
            <el-tag :type="getSourceTagType(scope.row.source)" size="small">
              {{ getSourceName(scope.row.source) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="favoriteTime" label="收藏时间" width="180" sortable />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="scope">
            <el-button type="primary" link size="small" @click="viewDetail(scope.row)">
              <el-icon><View /></el-icon> 查看
            </el-button>
            <el-popconfirm
              title="确定要取消收藏吗？"
              @confirm="removeFavorite(scope.$index, scope.row)"
            >
              <template #reference>
                <el-button type="danger" link size="small">
                  <el-icon><Star /></el-icon> 取消收藏
                </el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
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

    <!-- 空状态 -->
    <el-empty
      v-else
      description="暂无收藏内容"
      :image-size="200"
      class="empty-state"
    >
      <el-button type="primary" @click="goToExplore">去探索</el-button>
    </el-empty>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { 
  RefreshRight, Search, View, Star, 
  Document, Folder, ChatDotSquare 
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useFavoritesStore, type FavoriteItem } from '@/store/modules/favorites'

const router = useRouter()
const favoritesStore = useFavoritesStore()

// 筛选条件
const filterSource = ref('all')
const filterCategory = ref('')
const dateRange = ref([])
const searchKeyword = ref('')

// 分页
const currentPage = ref(1)
const pageSize = ref(10)
const total = computed(() => filteredFavorites.value.length)

// 筛选后的收藏列表
const filteredFavorites = computed(() => {
  let result = favoritesStore.allFavorites

  // 筛选来源
  if (filterSource.value !== 'all') {
    result = favoritesStore.favoritesBySource(filterSource.value)
  }
  
  // 筛选分类
  if (filterCategory.value) {
    result = result.filter((item: FavoriteItem) => item.category === filterCategory.value)
  }
  
  // 筛选日期范围
  if (dateRange.value && dateRange.value.length === 2) {
    result = result.filter((item: FavoriteItem) => {
      const favoriteDate = new Date(item.favoriteTime.split(' ')[0])
      const startDate = new Date(dateRange.value[0])
      const endDate = new Date(dateRange.value[1])
      
      return favoriteDate >= startDate && favoriteDate <= endDate
    })
  }
  
  // 搜索关键词
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter((item: FavoriteItem) => 
      item.title.toLowerCase().includes(keyword) ||
      item.abstract.toLowerCase().includes(keyword) ||
      item.tags.some((tag: string) => tag.toLowerCase().includes(keyword))
    )
  }
  
  return result
})

// 分页后的收藏列表
const paginatedFavorites = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredFavorites.value.slice(start, end)
})

// 获取来源对应的图标
const getSourceIcon = (source: string) => {
  switch (source) {
    case 'personal':
      return 'Document'
    case 'team':
      return 'Folder'
    case 'community':
      return 'ChatDotSquare'
    default:
      return 'Document'
  }
}

// 获取来源图标的CSS类
const getSourceIconClass = (source: string) => {
  return `source-icon ${source}-icon`
}

// 获取来源标签类型
const getSourceTagType = (source: string) => {
  switch (source) {
    case 'personal':
      return 'info'
    case 'team':
      return 'success'
    case 'community':
      return 'warning'
    default:
      return ''
  }
}

// 获取来源名称
const getSourceName = (source: string) => {
  switch (source) {
    case 'personal':
      return '个人知识库'
    case 'team':
      return '团队知识库'
    case 'community':
      return '社区交流'
    default:
      return '未知来源'
  }
}

// 搜索处理
const handleSearch = () => {
  console.log('搜索关键词:', searchKeyword.value)
  // 实际应用中可能需要调用API重新获取数据
}

// 刷新数据
const refreshData = () => {
  ElMessage.success('数据已刷新')
  // 实际应用中这里应该重新调用API获取数据
}

// 查看详情
const viewDetail = (row: FavoriteItem) => {
  console.log('查看详情:', row)
  router.push(row.sourceUrl)
}

// 取消收藏
const removeFavorite = (index: number, row: FavoriteItem) => {
  favoritesStore.removeFavorite(row.id, row.source)
  ElMessage.success('已取消收藏')
}

// 前往探索页面
const goToExplore = () => {
  router.push('/home')
}

// 分页处理
const handleSizeChange = (val: number) => {
  pageSize.value = val
  // 实际项目中这里应该重新加载数据
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
  // 实际项目中这里应该重新加载数据
}

// 组件挂载后初始化
onMounted(() => {
  console.log('我的收藏组件已加载')
})
</script>

<style scoped>
.favorites-container {
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

.filter-card {
  margin-bottom: 20px;
}

.filter-container {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  align-items: center;
}

.filter-item {
  display: flex;
  align-items: center;
}

.filter-label {
  margin-right: 8px;
  font-size: 14px;
  color: #606266;
}

.filter-select {
  width: 140px;
}

.date-picker {
  width: 300px;
}

.search-input {
  width: 250px;
}

.search-icon {
  cursor: pointer;
}

.favorites-card {
  margin-bottom: 20px;
}

.expanded-content {
  padding: 15px;
  background-color: #f8f8f8;
  border-radius: 4px;
}

.content-preview {
  margin-bottom: 10px;
}

.content-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.title-cell {
  display: flex;
  align-items: center;
}

.source-icon {
  margin-right: 8px;
  font-size: 16px;
}

.personal-icon {
  color: #409EFF;
}

.team-icon {
  color: #67C23A;
}

.community-icon {
  color: #E6A23C;
}

.title-link {
  color: #2468f2;
  text-decoration: none;
}

.title-link:hover {
  text-decoration: underline;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.refresh-btn {
  margin-left: 10px;
}

.empty-state {
  margin-top: -15px;
  padding-top: 0;
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
}

.empty-state :deep(.el-empty__image) {
  margin-bottom: 10px;
}

.empty-state :deep(.el-empty__description) {
  margin-top: 0;
  margin-bottom: 20px;
}
</style> 