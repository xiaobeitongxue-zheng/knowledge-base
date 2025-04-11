<template>
  <div class="summary-list">
    <div v-if="summaries.length === 0" class="empty-summary">
      <el-empty description="暂无文档摘要" />
    </div>
    <div v-else class="summary-items">
      <el-card 
        v-for="summary in summaries" 
        :key="summary.id"
        class="summary-item"
        shadow="hover"
      >
        <template #header>
          <div class="summary-header">
            <div class="summary-title">{{ summary.title }}</div>
            <div class="summary-actions">
              <el-button circle size="small" @click="toggleFavorite(summary.id)">
                <el-icon :color="summary.favorite ? '#E6A23C' : '#909399'">
                  <Star />
                </el-icon>
              </el-button>
              <el-dropdown trigger="click" @command="handleCommand($event, summary.id)">
                <el-button circle size="small">
                  <el-icon><More /></el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="view">查看全文</el-dropdown-item>
                    <el-dropdown-item command="download">下载文档</el-dropdown-item>
                    <el-dropdown-item command="share">分享</el-dropdown-item>
                    <el-dropdown-item command="delete" divided>删除</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </div>
        </template>
        <div class="summary-content">
          <div class="summary-text">{{ summary.summary }}</div>
          <div class="summary-meta">
            <div class="meta-item">
              <el-icon><Document /></el-icon>
              <span>{{ summary.type }}</span>
            </div>
            <div class="meta-item">
              <el-icon><User /></el-icon>
              <span>{{ summary.author }}</span>
            </div>
            <div class="meta-item">
              <el-icon><Timer /></el-icon>
              <span>{{ summary.updateTime }}</span>
            </div>
            <div v-if="summary.team" class="meta-item">
              <el-icon><UserFilled /></el-icon>
              <span>{{ summary.team }}</span>
            </div>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ElMessage, ElMessageBox } from 'element-plus'
import { Document, User, Star, More, Timer, UserFilled } from '@element-plus/icons-vue'

// 定义文档摘要类型接口
interface DocumentSummary {
  id: number;
  title: string;
  summary: string;
  type: string;
  author: string;
  updateTime: string;
  favorite: boolean;
  team?: string;
}

const props = defineProps<{
  summaries: DocumentSummary[];
}>()

const emit = defineEmits<{
  (e: 'favorite', id: number): void;
  (e: 'view', id: number): void;
  (e: 'download', id: number): void;
  (e: 'share', id: number): void;
  (e: 'delete', id: number): void;
}>()

// 切换收藏状态
const toggleFavorite = (id: number) => {
  emit('favorite', id)
}

// 处理下拉菜单命令
const handleCommand = (command: string, id: number) => {
  switch (command) {
    case 'view':
      emit('view', id)
      break
    case 'download':
      emit('download', id)
      break
    case 'share':
      emit('share', id)
      break
    case 'delete':
      ElMessageBox.confirm(
        '确定要删除这个文档摘要吗？',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(() => {
        emit('delete', id)
      }).catch(() => {
        // 取消删除
      })
      break
  }
}
</script>

<style scoped>
.summary-list {
  width: 100%;
}

.empty-summary {
  padding: 30px 0;
}

.summary-items {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.summary-item {
  transition: all 0.3s;
}

.summary-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.summary-title {
  font-weight: bold;
  font-size: 16px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
  margin-right: 10px;
}

.summary-actions {
  display: flex;
  gap: 5px;
}

.summary-content {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.summary-text {
  color: #606266;
  line-height: 1.6;
  margin-bottom: 5px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.summary-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  color: #909399;
  font-size: 13px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.meta-item .el-icon {
  font-size: 14px;
}
</style> 