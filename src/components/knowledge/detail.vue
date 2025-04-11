<template>
  <div class="knowledge-detail">
    <el-card class="detail-card">
      <template #header>
        <div class="card-header">
          <h2 class="title">{{ document.title }}</h2>
          <div class="meta-info">
            <span class="author">
              <el-icon><User /></el-icon>
              作者：{{ document.author }}
            </span>
            <span class="date">
              <el-icon><Calendar /></el-icon>
              更新时间：{{ document.updateTime }}
            </span>
            <span class="views">
              <el-icon><View /></el-icon>
              阅读数：{{ document.visitCount }}
            </span>
            <el-tag size="small" :type="getStatusType(document.status)">
              {{ getStatusText(document.status) }}
            </el-tag>
          </div>
          <div class="tags">
            <el-tag 
              v-for="tag in document.tags" 
              :key="tag" 
              effect="plain" 
              size="small" 
              class="tag-item"
            >
              {{ tag }}
            </el-tag>
          </div>
        </div>
      </template>
      
      <div class="document-content" v-html="document.content"></div>
      
      <div class="document-summary" v-if="document.summary">
        <h3>文档摘要</h3>
        <div class="summary-content">{{ document.summary }}</div>
      </div>
      
      <div class="document-actions">
        <el-button-group>
          <el-button type="primary" @click="handleEdit">
            <el-icon><Edit /></el-icon>编辑文档
          </el-button>
          <el-button @click="handleGenerateSummary">
            <el-icon><Reading /></el-icon>生成摘要
          </el-button>
          <el-button @click="handleShare">
            <el-icon><Share /></el-icon>分享文档
          </el-button>
          <el-button @click="handleFavorite" :type="document.isFavorite ? 'success' : ''">
            <el-icon><Star /></el-icon>{{ document.isFavorite ? '已收藏' : '收藏' }}
          </el-button>
        </el-button-group>
      </div>
    </el-card>
    
    <el-card class="comment-card">
      <template #header>
        <div class="comment-header">
          <h3>评论区 ({{ comments.length }})</h3>
        </div>
      </template>
      
      <div class="comment-list">
        <div v-if="comments.length === 0" class="no-comment">
          暂无评论，快来发表第一条评论吧!
        </div>
        <div 
          v-for="comment in comments" 
          :key="comment.id" 
          class="comment-item"
        >
          <div class="comment-user">
            <el-avatar :size="40" :src="comment.avatar"></el-avatar>
            <div class="comment-info">
              <div class="comment-author">{{ comment.author }}</div>
              <div class="comment-time">{{ comment.time }}</div>
            </div>
          </div>
          <div class="comment-content">{{ comment.content }}</div>
          <div class="comment-actions">
            <el-button text type="primary" size="small" @click="handleReply(comment)">
              回复
            </el-button>
            <el-button text type="primary" size="small" @click="handleLike(comment)">
              <el-icon><ThumbUp /></el-icon> {{ comment.likes }}
            </el-button>
          </div>
        </div>
      </div>
      
      <div class="comment-form">
        <el-input
          v-model="newComment"
          type="textarea"
          :rows="3"
          placeholder="请输入您的评论..."
        />
        <div class="form-actions">
          <el-button type="primary" @click="submitComment">发表评论</el-button>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script lang="ts" setup>
import { ref, defineProps, defineEmits } from 'vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  documentId: {
    type: [Number, String],
    required: true
  }
})

const emit = defineEmits(['update', 'edit'])

// 文档数据
const document = ref({
  id: 1,
  title: '产品需求说明书',
  author: '李四',
  createTime: '2024-04-01 10:30',
  updateTime: '2024-04-09 14:30',
  visitCount: 128,
  status: 'published',
  content: `<h2>1. 产品概述</h2>
            <p>这是一份关于产品需求说明的文档，详细描述了产品的功能和特性。</p>
            <h2>2. 功能需求</h2>
            <p>产品主要包含以下核心功能...</p>
            <h2>3. 非功能需求</h2>
            <p>性能、安全性、可用性等方面的要求...</p>`,
  summary: '这是一份产品需求说明文档，描述了产品的功能特性、需求和规格等内容。',
  tags: ['产品', '需求', '文档'],
  category: '产品文档',
  isFavorite: true
})

// 评论数据
const comments = ref([
  {
    id: 1,
    author: '张三',
    avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
    content: '这份文档写得很清晰，对我有很大帮助！',
    time: '2024-04-09 15:30',
    likes: 5
  },
  {
    id: 2,
    author: '王五',
    avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
    content: '建议在第二部分增加更多的用例说明。',
    time: '2024-04-09 16:45',
    likes: 2
  }
])

// 新评论
const newComment = ref('')

// 获取状态标签类型
const getStatusType = (status: string) => {
  switch (status) {
    case 'published':
      return 'success'
    case 'draft':
      return 'info'
    case 'pending':
      return 'warning'
    case 'archived':
      return 'danger'
    default:
      return 'info'
  }
}

// 获取状态文本
const getStatusText = (status: string) => {
  switch (status) {
    case 'published':
      return '已发布'
    case 'draft':
      return '草稿'
    case 'pending':
      return '待审核'
    case 'archived':
      return '已归档'
    default:
      return '未知'
  }
}

// 编辑文档
const handleEdit = () => {
  emit('edit', document.value.id)
}

// 生成摘要
const handleGenerateSummary = () => {
  // 生成摘要的逻辑
  ElMessage.success('开始生成摘要...')
}

// 分享文档
const handleShare = () => {
  // 分享文档的逻辑
  ElMessage.success('文档分享功能已启动')
}

// 收藏文档
const handleFavorite = () => {
  document.value.isFavorite = !document.value.isFavorite
  ElMessage.success(document.value.isFavorite ? '文档已收藏' : '已取消收藏')
}

// 回复评论
const handleReply = (comment: any) => {
  newComment.value = `@${comment.author} `
  // 滚动到评论框
  document.querySelector('.comment-form')?.scrollIntoView({ behavior: 'smooth' })
}

// 点赞评论
const handleLike = (comment: any) => {
  comment.likes++
  ElMessage.success('点赞成功')
}

// 提交评论
const submitComment = () => {
  if (!newComment.value.trim()) {
    ElMessage.warning('评论内容不能为空')
    return
  }
  
  // 添加新评论
  comments.value.push({
    id: comments.value.length + 1,
    author: '当前用户',
    avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
    content: newComment.value,
    time: new Date().toLocaleString(),
    likes: 0
  })
  
  ElMessage.success('评论发表成功')
  newComment.value = ''
}
</script>

<style lang="scss" scoped>
.knowledge-detail {
  .detail-card {
    margin-bottom: 20px;
  }
  
  .card-header {
    .title {
      margin: 0 0 15px;
      font-size: 22px;
      font-weight: 600;
    }
    
    .meta-info {
      display: flex;
      flex-wrap: wrap;
      gap: 15px;
      margin-bottom: 10px;
      font-size: 14px;
      color: #606266;
      
      .author, .date, .views {
        display: flex;
        align-items: center;
        gap: 5px;
      }
    }
    
    .tags {
      margin-top: 10px;
      
      .tag-item {
        margin-right: 5px;
        margin-bottom: 5px;
      }
    }
  }
  
  .document-content {
    margin-bottom: 30px;
    line-height: 1.8;
  }
  
  .document-summary {
    background-color: #f5f7fa;
    padding: 15px;
    border-radius: 4px;
    margin-bottom: 20px;
    
    h3 {
      margin-top: 0;
      margin-bottom: 10px;
      font-size: 16px;
      color: #606266;
    }
    
    .summary-content {
      color: #606266;
      line-height: 1.6;
    }
  }
  
  .document-actions {
    margin-top: 20px;
    display: flex;
    justify-content: center;
  }
  
  .comment-card {
    margin-bottom: 20px;
    
    .comment-header {
      h3 {
        margin: 0;
        font-size: 18px;
        font-weight: 500;
      }
    }
    
    .no-comment {
      text-align: center;
      color: #909399;
      padding: 30px 0;
    }
    
    .comment-list {
      margin-bottom: 20px;
    }
    
    .comment-item {
      padding: 15px 0;
      border-bottom: 1px solid #ebeef5;
      
      &:last-child {
        border-bottom: none;
      }
    }
    
    .comment-user {
      display: flex;
      margin-bottom: 10px;
      
      .comment-info {
        margin-left: 10px;
        
        .comment-author {
          font-weight: 500;
          font-size: 14px;
        }
        
        .comment-time {
          font-size: 12px;
          color: #909399;
          margin-top: 5px;
        }
      }
    }
    
    .comment-content {
      margin-bottom: 10px;
      line-height: 1.6;
    }
    
    .comment-actions {
      display: flex;
      justify-content: flex-end;
    }
    
    .comment-form {
      margin-top: 20px;
      
      .form-actions {
        margin-top: 10px;
        display: flex;
        justify-content: flex-end;
      }
    }
  }
}
</style> 