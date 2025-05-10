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
            <el-tab-pane label="全部帖子" name="all"></el-tab-pane>
            <el-tab-pane label="我的帖子" name="myPosts"></el-tab-pane>
            <el-tab-pane label="我的点赞" name="myLikes"></el-tab-pane>
            <el-tab-pane label="我的收藏" name="myCollections"></el-tab-pane>
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
        <div class="post-list" v-loading="loading" element-loading-text="正在加载帖子...">
          <template v-if="postList.length > 0">
            <el-card v-for="post in postList" :key="post.id" class="post-card" shadow="hover" :data-id="post.id">
              <div class="post-header">
                <div class="post-avatar">
                  <el-avatar :size="40" :src="post.author.avatar"></el-avatar>
                </div>
                <div class="post-info">
                  <div class="post-title">
                    <router-link :to="'/community/post/' + post.id">{{ post.title }}</router-link>
                    <el-dropdown 
                      v-if="activeTab === 'myPosts'" 
                      trigger="click" 
                      @command="(command: 'public' | 'team' | 'private') => updatePostVisibility(post, command)"
                      class="visibility-dropdown"
                    >
                      <el-tag size="small" :type="getVisibilityTagType(post.visibility)" class="visibility-tag">
                        {{ getVisibilityLabel(post.visibility) }} <el-icon class="el-icon--right"><arrow-down /></el-icon>
                      </el-tag>
                      <template #dropdown>
                        <el-dropdown-menu>
                          <el-dropdown-item command="public">
                            <el-tag size="small" type="success">公开</el-tag>
                          </el-dropdown-item>
                          <el-dropdown-item command="team">
                            <el-tag size="small" type="info">团队</el-tag>
                          </el-dropdown-item>
                          <el-dropdown-item command="private">
                            <el-tag size="small" type="danger">私密</el-tag>
                          </el-dropdown-item>
                        </el-dropdown-menu>
                      </template>
                    </el-dropdown>
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
                  <span class="thumb-icon" :class="{ 'liked': post.liked }">
                    <i class="thumb-up"></i>
                  </span>
                  <span>{{ post.likeCount }}</span>
                </div>
                <div 
                  class="action-item" 
                  :class="{ 'is-active': post.collected }"
                  @click="toggleCollect(post)"
                >
                  <el-icon>
                    <component :is="post.collected ? 'StarFilled' : 'Star'" />
                  </el-icon>
                  <span>{{ post.collectCount }}</span>
                </div>
                <div v-if="activeTab === 'myPosts'" class="post-operations">
                  <span class="action-item delete-action" @click="confirmDeletePost(post)" title="删除帖子">
                    <el-icon><Delete /></el-icon>
                  </span>
                </div>
              </div>
            </el-card>
          </template>
          <template v-else>
            <el-empty :description="getEmptyDescription()" class="empty-posts">
              <el-button v-if="activeTab !== 'all'" type="primary" @click="activeTab = 'all'">
                浏览全部帖子
              </el-button>
            </el-empty>
          </template>
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
      :title="dialogTitle"
      width="700px"
      class="post-dialog"
      :append-to-body="true"
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
        <el-form-item label="可见范围" prop="visibility">
          <el-radio-group v-model="postForm.visibility">
            <el-radio label="public">所有人可见</el-radio>
            <el-radio label="team">仅团队可见</el-radio>
            <el-radio label="private">仅自己可见</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="postForm.visibility === 'team'" label="选择团队" prop="teamId">
          <el-select v-model="postForm.teamId" placeholder="请选择团队">
            <el-option
              v-for="team in teamOptions"
              :key="team.id"
              :label="team.name"
              :value="team.id"
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
import { ref, reactive, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { 
  EditPen, Search, View, ChatDotRound, Star, StarFilled,
  Bell, User, Document, MoreFilled, Delete, Edit, ArrowDown
} from '@element-plus/icons-vue'
import { useFavoritesStore } from '@/store/modules/favorites'

const router = useRouter()

// 标签页
const activeTab = ref('all')

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
  tags: [] as string[],
  visibility: 'public', // 默认所有人可见
  teamId: null as number | null,
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
  ],
  visibility: [
    { required: true, message: '请选择可见范围', trigger: 'change' }
  ],
  teamId: [
    { required: true, message: '请选择团队', trigger: 'change', 
      validator: (rule, value, callback) => {
        if (postForm.visibility === 'team' && !value) {
          callback(new Error('请选择团队'))
        } else {
          callback()
        }
      }
    }
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

// 团队选项
const teamOptions = [
  { id: 1, name: '研发团队' },
  { id: 2, name: '产品团队' },
  { id: 3, name: '设计团队' },
  { id: 4, name: '市场团队' },
  { id: 5, name: '运营团队' }
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

// 我的帖子数据
const myPosts = ref([
  {
    id: 5,
    title: '如何提高团队协作效率？',
    author: {
      name: '当前用户',
      avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'
    },
    createTime: '2024-04-10 14:25',
    summary: '分享一些提高团队协作效率的方法和工具，帮助团队更好地完成项目目标。',
    category: 'experience',
    tags: ['团队协作', '效率提升', '项目管理'],
    viewCount: 78,
    commentCount: 12,
    likeCount: 24,
    collectCount: 15,
    liked: false,
    collected: false,
    visibility: 'public',
    teamId: null
  },
  {
    id: 6,
    title: '前端代码规范与最佳实践',
    author: {
      name: '当前用户',
      avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'
    },
    createTime: '2024-04-05 09:40',
    summary: '整理了一份前端开发的代码规范和最佳实践，包括命名规范、代码结构、性能优化等方面的内容。',
    category: 'tech',
    tags: ['前端', '代码规范', '最佳实践'],
    viewCount: 146,
    commentCount: 18,
    likeCount: 45,
    collectCount: 36,
    liked: false,
    collected: false,
    visibility: 'team',
    teamId: 1
  },
  {
    id: 7,
    title: '工作与生活的平衡',
    author: {
      name: '当前用户',
      avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'
    },
    createTime: '2024-04-02 18:15',
    summary: '探讨如何在繁忙的工作中保持生活平衡，避免职业倦怠，保持身心健康。',
    category: 'career',
    tags: ['工作平衡', '健康', '时间管理'],
    viewCount: 89,
    commentCount: 23,
    likeCount: 37,
    collectCount: 19,
    liked: false,
    collected: false,
    visibility: 'private',
    teamId: null
  },
  {
    id: 8,
    title: '2024年技术趋势展望',
    author: {
      name: '当前用户',
      avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'
    },
    createTime: '2024-03-28 11:05',
    summary: '分析2024年技术发展趋势，包括人工智能、Web3、云原生等领域的最新进展和未来方向。',
    category: 'tech',
    tags: ['技术趋势', 'AI', 'Web3', '云原生'],
    viewCount: 215,
    commentCount: 34,
    likeCount: 67,
    collectCount: 52,
    liked: true,
    collected: true,
    visibility: 'public',
    teamId: null
  }
])

// 原始帖子数据
const originalPostList = ref([
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
    liked: false,
    collected: true,
    visibility: 'public',
    teamId: null
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
    liked: true,
    collected: false,
    visibility: 'team',
    teamId: 1
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
    liked: false,
    collected: false,
    visibility: 'public',
    teamId: null
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
    liked: false,
    collected: false,
    visibility: 'private',
    teamId: null
  }
])

// 显示的帖子列表
const postList = ref(originalPostList.value)

const favoritesStore = useFavoritesStore()

// 是否正在加载
const loading = ref(false)

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
  loading.value = true
  
  // 实际应用中这里应该调用API加载数据
  console.log('加载帖子列表：', {
    tab: activeTab.value,
    keyword: searchKeyword.value,
    category: categoryFilter.value,
    page: currentPage.value,
    pageSize: pageSize.value
  })
  
  // 模拟网络请求延迟
  setTimeout(() => {
    let filteredPosts = [];
    
    // 根据标签页筛选
    if (activeTab.value === 'myLikes') {
      // 获取所有点赞的帖子，包括全部帖子和我的帖子
      const likedPublicPosts = originalPostList.value.filter(post => post.liked);
      const likedMyPosts = myPosts.value.filter(post => post.liked);
      filteredPosts = [...likedPublicPosts, ...likedMyPosts];
    } else if (activeTab.value === 'myCollections') {
      // 获取所有收藏的帖子，包括全部帖子和我的帖子
      const collectedPublicPosts = originalPostList.value.filter(post => post.collected);
      const collectedMyPosts = myPosts.value.filter(post => post.collected);
      filteredPosts = [...collectedPublicPosts, ...collectedMyPosts];
    } else if (activeTab.value === 'myPosts') {
      // 加载我的帖子
      filteredPosts = [...myPosts.value];
    } else {
      // 全部帖子
      filteredPosts = [...originalPostList.value];
    }
    
    // 关键词搜索
    if (searchKeyword.value) {
      const keyword = searchKeyword.value.toLowerCase();
      filteredPosts = filteredPosts.filter(post => 
        post.title.toLowerCase().includes(keyword) || 
        post.summary.toLowerCase().includes(keyword) ||
        post.tags.some(tag => tag.toLowerCase().includes(keyword))
      );
    }
    
    // 分类过滤
    if (categoryFilter.value) {
      filteredPosts = filteredPosts.filter(post => post.category === categoryFilter.value);
    }
    
    // 移除重复的帖子（根据ID）
    filteredPosts = removeDuplicatePosts(filteredPosts);
    
    // 更新列表和总数
    postList.value = filteredPosts;
    total.value = filteredPosts.length;
    loading.value = false;
  }, 300); // 模拟300ms延迟
}

// 移除重复帖子（根据ID）
const removeDuplicatePosts = (posts: any[]) => {
  const uniquePosts = [];
  const seenIds = new Set();
  
  for (const post of posts) {
    if (!seenIds.has(post.id)) {
      seenIds.add(post.id);
      uniquePosts.push(post);
    }
  }
  
  return uniquePosts;
}

// 根据分类值获取分类标签
const getCategoryLabel = (value: string) => {
  const category = categories.find(item => item.value === value)
  return category ? category.label : value
}

// 点赞帖子
const toggleLike = (post: any) => {
  const isLiking = !post.liked;
  post.liked = isLiking;
  post.likeCount += isLiking ? 1 : -1;
  
  // 添加点赞动效
  if (isLiking) {
    const icon = document.querySelector(`.post-card[data-id="${post.id}"] .thumb-icon`);
    if (icon) {
      icon.classList.add('like-animation');
      setTimeout(() => {
        icon.classList.remove('like-animation');
      }, 500);
    }
  }
  
  // 同步更新其他列表中的相同帖子
  updatePostStatusInAllLists(post.id, { liked: isLiking });
  
  // 如果在"我的点赞"标签页，且取消了点赞，则需要刷新列表
  if (activeTab.value === 'myLikes' && !isLiking) {
    loadPosts();
  }
  
  ElMessage.success(isLiking ? '点赞成功' : '已取消点赞');
}

// 收藏帖子
const toggleCollect = (post: any) => {
  const isCollecting = !post.collected;
  post.collected = isCollecting;
  post.collectCount += isCollecting ? 1 : -1;
  
  if (isCollecting) {
    // 添加到收藏
    const favoriteItem = {
      id: post.id,
      title: post.title,
      abstract: post.summary,
      content: post.content || '',
      category: getCategoryLabel(post.category),
      author: post.author.name,
      source: 'community' as const,
      sourceUrl: `/community/post/${post.id}`,
      tags: post.tags,
      favoriteTime: new Date().toLocaleString()
    }
    
    // 使用store添加收藏
    favoritesStore.addFavorite(favoriteItem);
    ElMessage.success('收藏成功');
  } else {
    // 从收藏中移除
    favoritesStore.removeFavorite(post.id, 'community');
    ElMessage.success('已取消收藏');
  }
  
  // 同步更新其他列表中的相同帖子
  updatePostStatusInAllLists(post.id, { collected: isCollecting });
  
  // 如果在"我的收藏"标签页，且取消了收藏，则需要刷新列表
  if (activeTab.value === 'myCollections' && !isCollecting) {
    loadPosts();
  }
}

// 更新所有列表中的帖子状态
const updatePostStatusInAllLists = (postId: number, status: { liked?: boolean, collected?: boolean }) => {
  // 更新全部帖子列表中的状态
  const publicPost = originalPostList.value.find(p => p.id === postId);
  if (publicPost) {
    if (status.liked !== undefined) publicPost.liked = status.liked;
    if (status.collected !== undefined) publicPost.collected = status.collected;
  }
  
  // 更新我的帖子列表中的状态
  const myPost = myPosts.value.find(p => p.id === postId);
  if (myPost) {
    if (status.liked !== undefined) myPost.liked = status.liked;
    if (status.collected !== undefined) myPost.collected = status.collected;
  }
}

// 按话题筛选
const filterByTopic = (topic: string) => {
  searchKeyword.value = topic
  handleSearch()
}

// 创建帖子
const createPost = () => {
  // 重置表单
  postForm.title = ''
  postForm.content = ''
  postForm.category = ''
  postForm.tags = []
  postForm.visibility = 'public'
  postForm.teamId = null
  
  // 重置编辑状态
  currentEditPostId.value = null
  
  // 更新对话框标题
  dialogTitle.value = '发布帖子'
  
  dialogVisible.value = true
}

// 对话框标题
const dialogTitle = ref('发布帖子')

// 提交发布帖子
const submitPost = async () => {
  if (!postFormRef.value) return

  await postFormRef.value.validate(async (valid, fields) => {
    if (valid) {
      // 实际应用中这里应该调用API提交数据
      console.log('提交帖子:', postForm, '编辑ID:', currentEditPostId.value)
      
      // 获取团队名称
      let teamName = null
      if (postForm.visibility === 'team' && postForm.teamId) {
        const team = teamOptions.find(t => t.id === postForm.teamId)
        teamName = team ? team.name : null
      }
      
      if (currentEditPostId.value) {
        // 更新已有帖子
        const postIndex = myPosts.value.findIndex(p => p.id === currentEditPostId.value)
        if (postIndex !== -1) {
          // 更新帖子内容
          myPosts.value[postIndex] = {
            ...myPosts.value[postIndex],
            title: postForm.title,
            summary: postForm.content,
            category: postForm.category,
            tags: [...postForm.tags],
            visibility: postForm.visibility,
            teamId: postForm.teamId
          }
          
          // 刷新列表以显示更新后的帖子
          loadPosts()
          
          ElMessage.success('帖子更新成功')
        }
      } else {
        // 添加新帖子
        const newPost = {
          id: Date.now(), // 使用时间戳作为临时ID
          title: postForm.title,
          author: {
            name: '当前用户',
            avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'
          },
          createTime: new Date().toLocaleString(),
          summary: postForm.content.substring(0, 100) + '...',
          category: postForm.category,
          tags: [...postForm.tags],
          viewCount: 0,
          commentCount: 0,
          likeCount: 0,
          collectCount: 0,
          liked: false,
          collected: false,
          visibility: postForm.visibility,
          teamId: postForm.teamId
        }
        
        // 添加到我的帖子列表
        myPosts.value.unshift(newPost)
        
        // 同时添加到全部帖子列表首位
        originalPostList.value.unshift({...newPost})
        
        // 重置到第一页
        resetToFirstPage()
        
        // 保证在关闭对话框之前已经完成数据更新
        await nextTick()
        
        // 先关闭对话框
        dialogVisible.value = false
        
        // 发送成功消息
        ElMessage.success('帖子发布成功')
        
        // 如果当前不在"全部帖子"或"我的帖子"标签页，切换到"全部帖子"
        if (activeTab.value !== 'all' && activeTab.value !== 'myPosts') {
          activeTab.value = 'all'
        }
        
        // 刷新列表显示新发布的帖子
        loadPosts()
        
        // 如果发布的是私密帖子或团队帖子，给用户提示
        if (postForm.visibility === 'private') {
          ElMessage.info('该帖子设为仅自己可见')
        } else if (postForm.visibility === 'team') {
          ElMessage.info(`该帖子设为仅"${teamName}"团队成员可见`)
        }
      }
    }
  })
}

// 重置到第一页
const resetToFirstPage = () => {
  currentPage.value = 1;
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

// 获取空状态描述
const getEmptyDescription = () => {
  if (activeTab.value === 'myLikes') {
    return '您还没有点赞过任何帖子';
  } else if (activeTab.value === 'myCollections') {
    return '您还没有收藏过任何帖子';
  } else if (activeTab.value === 'myPosts') {
    return '您还没有发布过帖子';
  } else if (searchKeyword.value || categoryFilter.value) {
    return '未找到符合条件的帖子';
  } else {
    return '暂无帖子';
  }
}

// 获取可见性标签类型
const getVisibilityTagType = (visibility: string) => {
  switch (visibility) {
    case 'public':
      return 'success'
    case 'team':
      return 'info'
    case 'private':
      return 'danger'
    default:
      return 'info'
  }
}

// 获取可见性标签文本
const getVisibilityLabel = (visibility: string) => {
  switch (visibility) {
    case 'public':
      return '公开'
    case 'team':
      return '团队'
    case 'private':
      return '私密'
    default:
      return '未知'
  }
}

// 处理下拉菜单命令
const handleCommand = (command: string, post: any) => {
  if (command === 'delete') {
    confirmDeletePost(post);
  } else if (command === 'edit') {
    editPost(post);
  }
}

// 确认删除帖子
const confirmDeletePost = (post: any) => {
  ElMessageBox.confirm(
    '确定要删除这篇帖子吗？删除后将无法恢复。',
    '删除帖子',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    deletePost(post);
  }).catch(() => {
    // 取消删除
  });
}

// 删除帖子
const deletePost = (post: any) => {
  // 从我的帖子列表中删除
  const index = myPosts.value.findIndex(p => p.id === post.id);
  if (index !== -1) {
    myPosts.value.splice(index, 1);
  }
  
  // 刷新当前帖子列表
  loadPosts();
  
  ElMessage.success('帖子已成功删除');
}

// 编辑帖子
const editPost = (post: any) => {
  // 初始化表单数据
  postForm.title = post.title;
  postForm.content = post.summary;
  postForm.category = post.category;
  postForm.tags = [...post.tags];
  postForm.visibility = post.visibility;
  postForm.teamId = post.teamId;
  
  // 记录当前编辑的帖子ID
  currentEditPostId.value = post.id;
  
  // 设置对话框标题
  dialogTitle.value = '编辑帖子';
  
  // 打开编辑对话框
  dialogVisible.value = true;
}

// 当前正在编辑的帖子ID
const currentEditPostId = ref<number | null>(null);

// 更新帖子可见性
const updatePostVisibility = (post: any, command: 'public' | 'team' | 'private') => {
  post.visibility = command;
  
  // 如果是设为团队可见但没有团队ID，默认设为第一个团队
  if (command === 'team' && !post.teamId) {
    post.teamId = teamOptions[0]?.id || null;
  }
  
  // 提示用户已更改可见性
  ElMessage.success(`已将帖子可见性更改为${getVisibilityLabel(command)}`);
  
  // 刷新列表
  loadPosts();
}
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
  font-weight: 600;
}

.action-item .el-icon {
  font-size: 16px;
}

/* 点赞图标样式 */
.thumb-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  margin-right: 2px;
  position: relative;
}

.thumb-up {
  display: block;
  width: 18px;
  height: 18px;
  background: currentColor;
  mask-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z"/></svg>');
  -webkit-mask-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z"/></svg>');
  mask-size: cover;
  -webkit-mask-size: cover;
  mask-repeat: no-repeat;
  -webkit-mask-repeat: no-repeat;
  color: #909399;
}

.action-item.is-active .thumb-up,
.thumb-icon.liked .thumb-up {
  color: #409EFF;
}

.action-item.is-active .thumb-icon {
  transform: scale(1.2);
  transition: transform 0.2s ease;
}

.like-animation {
  animation: like-bounce 0.5s;
}

@keyframes like-bounce {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.4);
  }
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

.empty-posts {
  padding: 40px 0;
  background-color: #f9f9f9;
  border-radius: 8px;
}

.empty-posts .el-empty__description {
  font-size: 16px;
  color: #909399;
}

.post-operations {
  display: flex;
  margin-left: 5px;
}

.post-operations .action-item {
  margin-left: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.post-operations .action-item:hover {
  transform: scale(1.2);
}

.delete-action:hover {
  color: #f56c6c;
}

.post-dialog :deep(.el-dialog) {
  margin-top: 5vh !important; /* 默认是15vh，减小这个值使对话框上移 */
}

.visibility-dropdown {
  display: inline-block;
  margin-left: 5px;
}
</style> 