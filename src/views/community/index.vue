<template>
  <div class="community-container">
    <div class="page-header">
      <h2>社区服务</h2>
      <el-button type="primary" @click="createPost">
        <el-icon><EditPen /></el-icon> 发布帖子
      </el-button>
    </div>

    <el-row :gutter="20">
      <!-- 左侧内容区 -->
      <el-col :span="18">
        <el-card class="filter-card">
          <el-tabs v-model="activeTab" @tab-click="handleTabClick">
            <el-tab-pane label="最新帖子" name="latest"></el-tab-pane>
            <el-tab-pane label="热门讨论" name="hot"></el-tab-pane>
            <el-tab-pane label="精华帖子" name="featured"></el-tab-pane>
            <el-tab-pane label="我的关注" name="following"></el-tab-pane>
          </el-tabs>

          <div class="filter-row">
            <el-input
              v-model="searchKeyword"
              placeholder="搜索帖子"
              clearable
              class="search-input"
              @keyup.enter="handleSearch"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
            <el-select v-model="categoryFilter" placeholder="分类" clearable>
              <el-option
                v-for="item in categories"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
            <el-button type="primary" @click="handleSearch">搜索</el-button>
          </div>
        </el-card>

        <!-- 帖子列表 -->
        <div class="post-list">
          <el-card v-for="post in postList" :key="post.id" class="post-card" shadow="hover">
            <div class="post-header">
              <div class="post-avatar">
                <el-avatar :size="40" :src="post.author.avatar"></el-avatar>
              </div>
              <div class="post-info">
                <div class="post-title">
                  <router-link :to="'/community/post/' + post.id">{{ post.title }}</router-link>
                  <el-tag v-if="post.featured" size="small" type="danger">精华</el-tag>
                </div>
                <div class="post-meta">
                  <span class="author">{{ post.author.name }}</span>
                  <span class="time">{{ post.createTime }}</span>
                  <span class="category">{{ getCategoryLabel(post.category) }}</span>
                </div>
              </div>
            </div>
            <div class="post-content">{{ post.summary }}</div>
            <div class="post-tags">
              <el-tag
                v-for="tag in post.tags"
                :key="tag"
                size="small"
                effect="plain"
                class="post-tag"
              >{{ tag }}</el-tag>
            </div>
            <div class="post-actions">
              <div class="action-item">
                <el-icon><View /></el-icon>
                <span>{{ post.viewCount }}</span>
              </div>
              <div class="action-item">
                <el-icon><ChatDotRound /></el-icon>
                <span>{{ post.commentCount }}</span>
              </div>
              <div 
                class="action-item" 
                :class="{ 'is-active': post.liked }"
                @click="toggleLike(post)"
              >
                <el-icon><component is="Thumb" /></el-icon>
                <span>{{ post.likeCount }}</span>
              </div>
              <div 
                class="action-item" 
                :class="{ 'is-active': post.collected }"
                @click="toggleCollect(post)"
              >
                <el-icon><Star /></el-icon>
                <span>{{ post.collectCount }}</span>
              </div>
            </div>
          </el-card>
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
      </el-col>

      <!-- 右侧边栏 -->
      <el-col :span="6">
        <!-- 社区公告 -->
        <el-card class="sidebar-card notice-card">
          <template #header>
            <div class="card-header">
              <el-icon><Bell /></el-icon>
              <span>社区公告</span>
            </div>
          </template>
          <div class="notice-item" v-for="(notice, index) in notices" :key="index">
            <div class="notice-title">{{ notice.title }}</div>
            <div class="notice-time">{{ notice.time }}</div>
          </div>
        </el-card>

        <!-- 热门话题 -->
        <el-card class="sidebar-card">
          <template #header>
            <div class="card-header">
              <el-icon><component is="Collection" /></el-icon>
              <span>热门话题</span>
            </div>
          </template>
          <div class="hot-topics">
            <el-tag
              v-for="topic in hotTopics"
              :key="topic.name"
              class="topic-tag"
              effect="plain"
              @click="filterByTopic(topic.name)"
            >
              # {{ topic.name }} ({{ topic.count }})
            </el-tag>
          </div>
        </el-card>

        <!-- 活跃用户 -->
        <el-card class="sidebar-card">
          <template #header>
            <div class="card-header">
              <el-icon><User /></el-icon>
              <span>活跃用户</span>
            </div>
          </template>
          <div class="active-users">
            <div v-for="user in activeUsers" :key="user.id" class="user-item">
              <el-avatar :size="30" :src="user.avatar"></el-avatar>
              <span class="user-name">{{ user.name }}</span>
              <span class="user-score">{{ user.score }}分</span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 发布帖子对话框 -->
    <el-dialog
      v-model="dialogVisible"
      title="发布帖子"
      width="800px"
    >
      <el-form :model="postForm" :rules="postRules" ref="postFormRef" label-width="80px">
        <el-form-item label="标题" prop="title">
          <el-input v-model="postForm.title" placeholder="请输入帖子标题"></el-input>
        </el-form-item>
        <el-form-item label="分类" prop="category">
          <el-select v-model="postForm.category" placeholder="请选择分类">
            <el-option
              v-for="item in categories"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="内容" prop="content">
          <el-input
            v-model="postForm.content"
            type="textarea"
            :rows="10"
            placeholder="请输入帖子内容"
          ></el-input>
        </el-form-item>
        <el-form-item label="标签">
          <el-select
            v-model="postForm.tags"
            multiple
            filterable
            allow-create
            default-first-option
            placeholder="请选择或添加标签"
          >
            <el-option
              v-for="tag in recommendTags"
              :key="tag"
              :label="tag"
              :value="tag"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitPost">发布</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { 
  EditPen, Search, View, ChatDotRound, Star, 
  Bell, User
} from '@element-plus/icons-vue'

const router = useRouter()

// 标签页
const activeTab = ref('latest')

// 搜索和筛选
const searchKeyword = ref('')
const categoryFilter = ref('')

// 分页
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(123)

// 发布帖子对话框
const dialogVisible = ref(false)
const postFormRef = ref<FormInstance>()
const postForm = reactive({
  title: '',
  content: '',
  category: '',
  tags: [] as string[]
})

// 帖子表单验证规则
const postRules: FormRules = {
  title: [
    { required: true, message: '请输入帖子标题', trigger: 'blur' },
    { min: 3, max: 50, message: '标题长度应在3-50个字符之间', trigger: 'blur' }
  ],
  category: [
    { required: true, message: '请选择帖子分类', trigger: 'change' }
  ],
  content: [
    { required: true, message: '请输入帖子内容', trigger: 'blur' },
    { min: 10, message: '内容不能少于10个字符', trigger: 'blur' }
  ]
}

// 分类列表
const categories = [
  { label: '技术讨论', value: 'tech' },
  { label: '经验分享', value: 'experience' },
  { label: '疑难解答', value: 'question' },
  { label: '产品反馈', value: 'feedback' },
  { label: '职场交流', value: 'career' },
  { label: '闲聊灌水', value: 'chat' }
]

// 推荐标签
const recommendTags = [
  '前端', '后端', '数据库', '架构', '算法', '云计算',
  '人工智能', '大数据', '区块链', '安全', '测试', '运维'
]

// 社区公告
const notices = [
  { title: '社区规范更新通知', time: '2024-04-09' },
  { title: '4月技术分享活动预告', time: '2024-04-08' },
  { title: '招募社区版主公告', time: '2024-04-07' }
]

// 热门话题
const hotTopics = [
  { name: '人工智能', count: 128 },
  { name: '前端框架', count: 95 },
  { name: '微服务', count: 87 },
  { name: '大数据分析', count: 76 },
  { name: '云原生', count: 64 },
  { name: '安全攻防', count: 58 }
]

// 活跃用户
const activeUsers = [
  { id: 1, name: '技术大牛', avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png', score: 9876 },
  { id: 2, name: '算法高手', avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png', score: 8765 },
  { id: 3, name: '前端达人', avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png', score: 7654 },
  { id: 4, name: '数据专家', avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png', score: 6543 },
  { id: 5, name: '运维大师', avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png', score: 5432 }
]

// 帖子列表数据
const postList = ref([
  {
    id: 1,
    title: '如何优化大型前端项目的构建速度？',
    author: {
      name: '前端达人',
      avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'
    },
    createTime: '2024-04-09 10:30',
    summary: '随着项目规模的增长，构建时间越来越长，严重影响开发效率。本文分享一些实用的优化技巧，帮助你提升构建速度。',
    category: 'tech',
    tags: ['前端', 'webpack', '性能优化'],
    viewCount: 245,
    commentCount: 32,
    likeCount: 78,
    collectCount: 45,
    featured: true,
    liked: false,
    collected: true
  },
  {
    id: 2,
    title: '人工智能在企业知识管理中的应用实践',
    author: {
      name: '技术大牛',
      avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'
    },
    createTime: '2024-04-08 16:20',
    summary: '分享一下我们团队在企业知识管理系统中引入AI技术的经验，重点介绍智能搜索、文本摘要和内容推荐的实现方案。',
    category: 'experience',
    tags: ['人工智能', '知识管理', '文本摘要'],
    viewCount: 189,
    commentCount: 24,
    likeCount: 56,
    collectCount: 34,
    featured: true,
    liked: true,
    collected: false
  },
  {
    id: 3,
    title: '微服务架构下的认证与授权设计',
    author: {
      name: '架构师小王',
      avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'
    },
    createTime: '2024-04-08 09:15',
    summary: '探讨微服务架构中常见的认证授权方案，比较JWT、OAuth2.0和OIDC等技术的优缺点，并分享实际项目中的最佳实践。',
    category: 'tech',
    tags: ['微服务', '安全', '认证授权'],
    viewCount: 156,
    commentCount: 18,
    likeCount: 42,
    collectCount: 28,
    featured: false,
    liked: false,
    collected: false
  },
  {
    id: 4,
    title: '开发者如何有效提升英语水平？',
    author: {
      name: '全栈工程师',
      avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'
    },
    createTime: '2024-04-07 14:30',
    summary: '作为开发者，良好的英语水平对职业发展至关重要。分享一些实用的学习方法和资源，帮助大家突破英语瓶颈。',
    category: 'career',
    tags: ['职业发展', '英语学习', '自我提升'],
    viewCount: 210,
    commentCount: 35,
    likeCount: 64,
    collectCount: 39,
    featured: false,
    liked: false,
    collected: false
  }
])

// 处理标签页切换
const handleTabClick = () => {
  loadPosts()
}

// 搜索帖子
const handleSearch = () => {
  loadPosts()
}

// 加载帖子列表
const loadPosts = () => {
  // 实际应用中这里应该调用API加载数据
  console.log('加载帖子列表：', {
    tab: activeTab.value,
    keyword: searchKeyword.value,
    category: categoryFilter.value,
    page: currentPage.value,
    pageSize: pageSize.value
  })
}

// 根据分类值获取分类标签
const getCategoryLabel = (value: string) => {
  const category = categories.find(item => item.value === value)
  return category ? category.label : value
}

// 点赞帖子
const toggleLike = (post: any) => {
  post.liked = !post.liked
  post.likeCount += post.liked ? 1 : -1
  ElMessage.success(post.liked ? '点赞成功' : '已取消点赞')
}

// 收藏帖子
const toggleCollect = (post: any) => {
  post.collected = !post.collected
  post.collectCount += post.collected ? 1 : -1
  ElMessage.success(post.collected ? '收藏成功' : '已取消收藏')
}

// 按话题筛选
const filterByTopic = (topic: string) => {
  searchKeyword.value = topic
  handleSearch()
}

// 创建帖子
const createPost = () => {
  dialogVisible.value = true
}

// 提交发布帖子
const submitPost = async () => {
  if (!postFormRef.value) return

  await postFormRef.value.validate((valid, fields) => {
    if (valid) {
      // 实际应用中这里应该调用API提交数据
      console.log('提交帖子:', postForm)
      ElMessage.success('帖子发布成功')
      dialogVisible.value = false
      
      // 添加到列表中（实际应用中应该重新加载数据）
      postList.value.unshift({
        id: postList.value.length + 1,
        title: postForm.title,
        author: {
          name: '当前用户',
          avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'
        },
        createTime: new Date().toLocaleString(),
        summary: postForm.content.substring(0, 100) + '...',
        category: postForm.category,
        tags: postForm.tags,
        viewCount: 0,
        commentCount: 0,
        likeCount: 0,
        collectCount: 0,
        featured: false,
        liked: false,
        collected: false
      })
      
      // 清空表单
      postForm.title = ''
      postForm.content = ''
      postForm.category = ''
      postForm.tags = []
    }
  })
}

// 分页处理
const handleSizeChange = (val: number) => {
  pageSize.value = val
  loadPosts()
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
  loadPosts()
}

// 组件挂载时加载数据
onMounted(() => {
  loadPosts()
})
</script>

<style scoped>
.community-container {
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

.filter-row {
  display: flex;
  gap: 10px;
  margin-top: 15px;
}

.search-input {
  width: 250px;
}

.post-list {
  margin-bottom: 20px;
}

.post-card {
  margin-bottom: 15px;
}

.post-header {
  display: flex;
  margin-bottom: 10px;
}

.post-avatar {
  margin-right: 15px;
}

.post-info {
  flex: 1;
}

.post-title {
  font-size: 18px;
  font-weight: 500;
  margin-bottom: 5px;
  display: flex;
  align-items: center;
}

.post-title a {
  color: #303133;
  text-decoration: none;
  margin-right: 10px;
}

.post-title a:hover {
  color: #409EFF;
}

.post-meta {
  display: flex;
  font-size: 13px;
  color: #909399;
  margin-bottom: 5px;
}

.post-meta span {
  margin-right: 15px;
}

.post-content {
  margin-bottom: 10px;
  color: #606266;
  line-height: 1.6;
}

.post-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-bottom: 10px;
}

.post-tag {
  margin-right: 5px;
}

.post-actions {
  display: flex;
  justify-content: flex-end;
  gap: 20px;
  color: #909399;
}

.action-item {
  display: flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
}

.action-item:hover {
  color: #409EFF;
}

.action-item.is-active {
  color: #409EFF;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
  margin-bottom: 20px;
}

.sidebar-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 5px;
  font-weight: 500;
}

.notice-card {
  background-color: #f5f7fa;
}

.notice-item {
  margin-bottom: 10px;
  padding-bottom: 10px;
  border-bottom: 1px solid #ebeef5;
}

.notice-item:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.notice-title {
  font-size: 14px;
  margin-bottom: 5px;
}

.notice-time {
  font-size: 12px;
  color: #909399;
}

.hot-topics {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.topic-tag {
  cursor: pointer;
  margin-bottom: 5px;
}

.topic-tag:hover {
  background-color: #ecf5ff;
  color: #409EFF;
}

.active-users {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.user-item {
  display: flex;
  align-items: center;
}

.user-name {
  margin-left: 10px;
  flex: 1;
}

.user-score {
  color: #e6a23c;
  font-weight: 500;
}
</style> 