<template>
  <div class="home-container">
    <!-- 欢迎横幅 - 只有背景图片滚动的轮播样式 -->
    <div class="welcome-banner">
      <!-- 轮播背景 -->
      <el-carousel :interval="5000" arrow="always" class="background-carousel">
        <el-carousel-item v-for="item in carouselItems" :key="item.id">
          <div class="carousel-bg" :style="{ backgroundImage: `url(${item.image})` }"></div>
        </el-carousel-item>
      </el-carousel>
      
      <!-- 固定在轮播上方的内容 -->
      <div class="welcome-content">
        <div class="welcome-text">
          <h2>欢迎使用企业知识库系统</h2>
          <p>基于生成式文本摘要的智能化知识管理与协作平台</p>
          <div class="action-buttons">
            <!-- <el-button type="primary" @click="handleCreateKnowledge">创建知识文档</el-button>
            <el-button @click="handleBrowseKnowledge">浏览知识库</el-button> -->
          </div>
        </div>
      </div>
    </div>

    <!-- 快速操作区域 -->
    <div class="quick-actions">
      <el-row :gutter="20">
        <el-col :span="6" v-for="(action, index) in quickActions" :key="index">
          <el-card class="action-card" shadow="hover" @click="navigateTo(action.path)">
            <div class="action-icon">
              <el-icon :size="40"><component :is="action.icon" /></el-icon>
            </div>
            <div class="action-title">{{ action.title }}</div>
            <div class="action-desc">{{ action.description }}</div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 统计数据展示 -->
    <el-row :gutter="20" class="data-statistics">
      <el-col :span="6" v-for="(stat, index) in statistics" :key="index">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-value">{{ stat.value }}</div>
          <div class="stat-title">{{ stat.title }}</div>
          <div class="stat-trend" :class="stat.trend > 0 ? 'up' : 'down'" v-if="stat.trend !== 0">
            <el-icon><component :is="stat.trend > 0 ? 'ArrowUp' : 'ArrowDown'" /></el-icon>
            {{ Math.abs(stat.trend) }}%
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 最近活动 -->
    <el-card class="recent-activity">
      <template #header>
        <div class="card-header">
          <span>最近活动</span>
          <el-button text>查看全部</el-button>
        </div>
      </template>
      <el-timeline>
        <el-timeline-item 
          v-for="(activity, index) in recentActivities" 
          :key="index" 
          :timestamp="activity.time" 
          :type="activity.type"
          :color="activity.color"
        >
          {{ activity.content }}
        </el-timeline-item>
      </el-timeline>
    </el-card>

    <!-- 最近文档 -->
    <el-card class="recent-documents">
      <template #header>
        <div class="card-header">
          <span>最近文档</span>
          <el-button text>查看全部</el-button>
        </div>
      </template>
      <el-table :data="recentDocuments" style="width: 100%">
        <el-table-column prop="title" label="标题" width="320">
          <template #default="{ row }">
            <el-link @click="viewDocument(row)">{{ row.title }}</el-link>
          </template>
        </el-table-column>
        <el-table-column prop="author" label="作者" width="120" />
        <el-table-column prop="category" label="分类" width="120" />
        <el-table-column prop="updateTime" label="更新时间" width="180" />
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-button-group>
              <el-button link type="primary" @click="viewDocument(row)">查看</el-button>
              <el-button link type="primary" @click="editDocument(row)">编辑</el-button>
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 快速操作区数据
const quickActions = ref([
  {
    title: '知识管理',
    description: '创建、编辑和管理知识文档',
    icon: 'Document',
    path: '/knowledge/management'
  },
  {
    title: '文本摘要',
    description: '自动生成文档摘要',
    icon: 'Reading',
    path: '/summary'
  },
  {
    title: '知识检索',
    description: '快速查找所需信息',
    icon: 'Search',
    path: '/search'
  },
  {
    title: '团队协作',
    description: '促进团队成员间的知识共享',
    icon: 'UserFilled',
    path: '/team/management'
  }
])

// 统计数据
const statistics = ref([
  {
    title: '知识文档',
    value: '1,234',
    trend: 5
  },
  {
    title: '活跃用户',
    value: '598',
    trend: 12
  },
  {
    title: '团队数量',
    value: '46',
    trend: 3
  },
  {
    title: '本月新增文档',
    value: '128',
    trend: -2
  }
])

// 最近活动
const recentActivities = ref([
  {
    content: '李四创建了新文档《产品需求说明书》',
    time: '2024-04-09 14:30',
    type: 'primary',
    color: '#409EFF'
  },
  {
    content: '张三更新了文档《技术架构设计》',
    time: '2024-04-09 11:20',
    type: 'success',
    color: '#67C23A'
  },
  {
    content: '系统自动为《项目计划书》生成了摘要',
    time: '2024-04-08 16:45',
    type: 'info',
    color: '#909399'
  },
  {
    content: '王五在《月度总结报告》中提及了您',
    time: '2024-04-08 09:15',
    type: 'warning',
    color: '#E6A23C'
  }
])

// 最近文档
const recentDocuments = ref([
  {
    id: 1,
    title: '产品需求说明书',
    author: '李四',
    category: '产品文档',
    updateTime: '2024-04-09 14:30'
  },
  {
    id: 2,
    title: '技术架构设计',
    author: '张三',
    category: '技术文档',
    updateTime: '2024-04-09 11:20'
  },
  {
    id: 3,
    title: '项目计划书',
    author: '王五',
    category: '项目文档',
    updateTime: '2024-04-08 16:45'
  },
  {
    id: 4,
    title: '月度总结报告',
    author: '赵六',
    category: '总结报告',
    updateTime: '2024-04-08 09:15'
  }
])

// 轮播图数据（仅用于背景轮播）
const carouselItems = ref([
  {
    id: 1,
    image: new URL('@/assets/lb1.png', import.meta.url).href
  },
  {
    id: 2,
    image: new URL('@/assets/lb2.png', import.meta.url).href
  },
  {
    id: 3,
    image: new URL('@/assets/lb3.png', import.meta.url).href
  },
  {
    id: 4,
    image: new URL('@/assets/lb4.png', import.meta.url).href
  },
  {
    id: 5,
    image: new URL('@/assets/lb5.png', import.meta.url).href
  }
])

// 导航到指定路径
const navigateTo = (path: string) => {
  router.push(path)
}

// 创建知识文档
const handleCreateKnowledge = () => {
  router.push('/knowledge/management?action=create')
}

// 浏览知识库
const handleBrowseKnowledge = () => {
  router.push('/knowledge/browse')
}

// 查看文档
const viewDocument = (document: any) => {
  router.push(`/knowledge/browse?id=${document.id}`)
}

// 编辑文档
const editDocument = (document: any) => {
  router.push(`/knowledge/management?id=${document.id}&action=edit`)
}

// 导航到首页
const goToHome = () => {
  router.push('/')
}
</script>

<style scoped>
.home-container {
  padding: 20px;
  position: relative; /* 添加相对定位 */
}

/* 新的轮播样式 - 只有背景滚动 */
.welcome-banner {
  position: relative;
  height: 300px;
  margin-bottom: 20px;
  border-radius: 10px;
  overflow: hidden;
}

.background-carousel {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.carousel-bg {
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
}
.welcome-banner{
  margin-top: -35px;
}
.welcome-content {
  position: absolute;
  top: -10px; /* 向上移动10px */
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center; /* 修改为居中对齐 */
  align-items: center;
  padding: 40px;
  background: rgba(0, 0, 0, 0.4); /* 半透明暗色背景，增加文字可读性 */
  z-index: 1; /* 确保内容在轮播之上 */
}

.welcome-text {
  max-width: 80%;
  text-align: center; /* 文字内容也居中对齐 */
}

.welcome-text h2 {
  margin-top: -40px;
  margin-left: -90px;
  font-size: 50px;
  color: white;
  margin-bottom: 10px;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.5); /* 文字阴影增强可读性 */
}

.welcome-text p {
  font-size: 25px;
  color: white;
  opacity: 0.9;
  margin-bottom: 20px;
  margin-left: -90px;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
}

.action-buttons {
  display: flex;
  gap: 15px;
}

.quick-actions {
  margin-bottom: 10px;
}

.action-card {
  height: 150px; /* 调整为与 .stat-card 一致的高度 */
  text-align: center;
  cursor: pointer;
  transition: transform 0.3s;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.action-card:hover {
  transform: translateY(-5px);
}

.action-icon {
  margin-bottom: 15px;
  color: #409EFF;
}

.action-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 5px;
}

.action-desc {
  font-size: 14px;
  color: #909399;
}

.data-statistics {
  margin-bottom: 20px;
}

.stat-card {
  height: 150px; /* 确保与 .action-card 一致的高度 */
  text-align: center;
  padding: 20px;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 5px;
}

.stat-title {
  font-size: 14px;
  color: #909399;
  margin-bottom: 10px;
}

.stat-trend {
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
}

.stat-trend.up {
  color: #67C23A;
}

.stat-trend.down {
  color: #F56C6C;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.recent-activity {
  margin-bottom: 20px;
}

.recent-documents {
  margin-bottom: 20px;
}

.carousel-indicators {
  position: absolute;
  bottom: 20px; /* 增加了与底部的距离 */
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 8px; /* 增加了点之间的间隔 */
  z-index: 2;
}

.carousel-indicator {
  width: 8px; /* 缩小了一点点 */
  height: 8px; /* 缩小了一点点 */
  background-color: rgba(255, 255, 255, 0.4); /* 降低了非活动状态的不透明度 */
  border-radius: 50%;
  transition: all 0.3s ease; /* 添加了平滑过渡效果 */
  cursor: pointer; /* 鼠标悬停时显示指针 */
}

.carousel-indicator.active {
  width: 12px; /* 活动状态的点稍大一些 */
  height: 12px; /* 活动状态的点稍大一些 */
  background-color: #409EFF; /* 使用主题蓝色替代纯白色 */
  box-shadow: 0 0 5px rgba(64, 158, 255, 0.6); /* 添加轻微发光效果 */
}
</style>