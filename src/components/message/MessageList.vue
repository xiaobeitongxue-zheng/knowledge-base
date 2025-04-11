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
        <div class="message-header">
          <div class="message-title">{{ message.title }}</div>
          <div class="message-time">{{ message.time }}</div>
        </div>
        <div class="message-content">{{ message.content }}</div>
        <div class="message-footer">
          <el-button size="small" type="text" @click="markAsRead(message.id)">
            标为已读
          </el-button>
          <el-button size="small" type="text" @click="deleteMessage(message.id)">
            删除
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
// 定义消息类型接口
interface Message {
  id: number;
  title: string;
  content: string;
  time: string;
  isRead: boolean;
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

.message-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.message-title {
  font-weight: bold;
  font-size: 16px;
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

.message-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style> 