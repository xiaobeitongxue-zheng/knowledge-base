<template>
  <div class="message-container">
    <div class="page-header">
      <h2>消息推送</h2>
    </div>

    <el-card class="main-card">
      <template #header>
        <div class="card-header">
          <div class="header-title">我的消息</div>
          <div class="header-actions">
            <el-button size="small" type="primary" @click="markAllRead">
              <el-icon><Check /></el-icon> 全部标为已读
            </el-button>
            <el-button size="small" @click="deleteAllRead">
              <el-icon><Delete /></el-icon> 清空已读消息
            </el-button>
          </div>
        </div>
      </template>

      <el-tabs v-model="activeTab">
        <el-tab-pane label="全部消息" name="all">
          <message-list :messages="allMessages" @read="handleRead" @delete="handleDelete" />
        </el-tab-pane>
        <el-tab-pane label="未读消息" name="unread">
          <message-list :messages="unreadMessages" @read="handleRead" @delete="handleDelete" />
        </el-tab-pane>
        <el-tab-pane label="系统通知" name="system">
          <message-list :messages="systemMessages" @read="handleRead" @delete="handleDelete" />
        </el-tab-pane>
        <el-tab-pane label="团队消息" name="team">
          <message-list :messages="teamMessages" @read="handleRead" @delete="handleDelete" />
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Check, Delete } from '@element-plus/icons-vue'
import MessageList from '@/components/message/MessageList.vue'
import messageStore from '@/store/message'

// 标签页
const activeTab = ref('all')

// 根据不同类型筛选消息
const allMessages = computed(() => {
  return messageStore.messages.value
})

const unreadMessages = computed(() => {
  return messageStore.messages.value.filter(msg => !msg.isRead)
})

const systemMessages = computed(() => {
  return messageStore.messages.value.filter(msg => msg.type === 'system')
})

const teamMessages = computed(() => {
  return messageStore.messages.value.filter(msg => msg.type === 'team')
})

// 标记消息为已读
const handleRead = (id: number) => {
  messageStore.markAsRead(id)
  ElMessage.success('已标记为已读')
}

// 删除消息
const handleDelete = (id: number) => {
  messageStore.deleteMessage(id)
  ElMessage.success('消息已删除')
}

// 标记所有为已读
const markAllRead = () => {
  messageStore.markAllAsRead()
  ElMessage.success('全部标记为已读')
}

// 清空已读消息
const deleteAllRead = () => {
  const readMessages = messageStore.messages.value.filter(msg => msg.isRead)
  readMessages.forEach(msg => {
    messageStore.deleteMessage(msg.id)
  })
  ElMessage.success('已清空已读消息')
}

// 组件挂载时，如果从通知栏点击进入，自动切换到未读消息标签
onMounted(() => {
  const hasUnread = messageStore.unreadCount.value > 0
  if (hasUnread) {
    activeTab.value = 'unread'
  }
})
</script>

<style scoped>
.message-container {
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

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-title {
  font-size: 16px;
  font-weight: 500;
}

.header-actions {
  display: flex;
  gap: 10px;
}
</style>