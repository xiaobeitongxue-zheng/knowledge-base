<template>
  <div class="message-list">
    <div v-if="messages.length === 0" class="empty-message">
      <el-empty description="暂无消息" />
    </div>
    <div v-else class="message-items">
      <div 
        v-for="message in messages" 
        :key="message.id" 
        class="message-item"
        :class="{ 'unread': !message.isRead }"
      >
        <div class="message-icon" :class="message.type" v-if="message.type">
          <el-icon v-if="message.type === 'system'"><Histogram /></el-icon>
          <el-icon v-else-if="message.type === 'user'"><User /></el-icon>
          <el-icon v-else-if="message.type === 'team'"><UserFilled /></el-icon>
        </div>
        <div class="message-content-wrapper">
          <div class="message-header">
            <div class="message-title">
              {{ message.title }}
              <el-icon v-if="message.isRead" class="read-icon"><CircleCheck /></el-icon>
            </div>
            <div class="message-time">{{ message.time || message.sendTime }}</div>
          </div>
          <div class="message-content">{{ message.content }}</div>
          <div v-if="message.sender" class="message-sender">发送人: {{ message.sender }}</div>
          <div class="message-footer">
            <el-button 
              v-if="!message.isRead" 
              size="small" 
              type="primary" 
              link 
              @click="markAsRead(message.id)"
            >
              标为已读
            </el-button>
            <span v-else class="read-status">
              <el-icon class="read-check"><CircleCheck /></el-icon>
              已读
            </span>
            <el-button size="small" type="danger" link @click="deleteMessage(message.id)">
              删除
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Histogram, User, UserFilled, CircleCheck } from '@element-plus/icons-vue'

// 定义消息类型接口
interface Message {
  id: number;
  title: string;
  content: string;
  time?: string;
  sendTime?: string;
  isRead: boolean;
  type?: 'system' | 'user' | 'team';
  sender?: string;
}

const props = defineProps<{
  messages: Message[];
}>()

const emit = defineEmits<{
  (e: 'read', id: number): void;
  (e: 'delete', id: number): void;
}>()

// 标记为已读
const markAsRead = (id: number) => {
  emit('read', id)
}

// 删除消息
const deleteMessage = (id: number) => {
  emit('delete', id)
}
</script>

<style scoped>
.message-list {
  width: 100%;
}

.empty-message {
  padding: 30px 0;
}

.message-items {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.message-item {
  display: flex;
  gap: 15px;
  padding: 15px;
  border-radius: 8px;
  background-color: #f8f9fa;
  transition: all 0.3s;
}

.message-item:hover {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.message-item.unread {
  border-left: 3px solid #409EFF;
  background-color: #ecf5ff;
}

.message-icon {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  flex-shrink: 0;
}

.message-icon.system {
  background-color: #409EFF;
  color: white;
}

.message-icon.user {
  background-color: #67C23A;
  color: white;
}

.message-icon.team {
  background-color: #E6A23C;
  color: white;
}

.message-content-wrapper {
  flex: 1;
}

.message-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.message-title {
  display: flex;
  align-items: center;
  gap: 5px;
  font-weight: bold;
  font-size: 16px;
}

.read-icon {
  color: #67C23A;
  font-size: 14px;
}

.message-time {
  color: #909399;
  font-size: 12px;
}

.message-content {
  color: #606266;
  margin-bottom: 10px;
  line-height: 1.5;
}

.message-sender {
  font-size: 12px;
  color: #909399;
  margin-bottom: 10px;
}

.message-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  align-items: center;
}

.read-status {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #67C23A;
  font-size: 12px;
}

.read-check {
  color: #67C23A;
}
</style>