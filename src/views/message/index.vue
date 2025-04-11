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
        <el-tab-pane label="待办事项" name="todos">
          <message-list :messages="todoMessages" @read="handleRead" @delete="handleDelete" />
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Check, Delete } from '@element-plus/icons-vue'
import MessageList from '@/components/message/MessageList.vue'

// 定义消息类型接口
interface Message {
  id: number;
  title: string;
  content: string;
  time: string;
  type: string;
  isRead: boolean;
}

// 标签页
const activeTab = ref('all')

// 消息列表
const messages = ref<Message[]>([
  {
    id: 1,
    title: '您收到一条新的共享文档',
    content: '用户 张三 与您共享了文档 "产品需求说明书"',
    time: '2024-04-09 15:30',
    type: 'share',
    isRead: false
  },
  {
    id: 2,
    title: '系统维护通知',
    content: '系统将于2024-04-10 22:00-24:00进行例行维护，届时系统将暂停服务，请提前做好工作安排。',
    time: '2024-04-09 14:20',
    type: 'system',
    isRead: false
  },
  {
    id: 3,
    title: '待办任务提醒',
    content: '您有一个任务 "完成月度报告" 即将到期，请尽快处理。',
    time: '2024-04-09 10:15',
    type: 'todo',
    isRead: false
  },
  {
    id: 4,
    title: '文档更新通知',
    content: '您关注的文档 "技术架构设计" 已由用户 李四 更新。',
    time: '2024-04-08 16:45',
    type: 'update',
    isRead: true
  },
  {
    id: 5,
    title: '评论回复通知',
    content: '用户 王五 回复了您对文档 "项目计划书" 的评论。',
    time: '2024-04-08 11:30',
    type: 'comment',
    isRead: true
  }
])

// 根据不同类型筛选消息
const allMessages = computed(() => {
  return messages.value
})

const unreadMessages = computed(() => {
  return messages.value.filter(msg => !msg.isRead)
})

const systemMessages = computed(() => {
  return messages.value.filter(msg => msg.type === 'system')
})

const todoMessages = computed(() => {
  return messages.value.filter(msg => msg.type === 'todo')
})

// 标记消息为已读
const handleRead = (id: number) => {
  const message = messages.value.find(msg => msg.id === id)
  if (message) {
    message.isRead = true
    ElMessage.success('已标记为已读')
  }
}

// 删除消息
const handleDelete = (id: number) => {
  messages.value = messages.value.filter(msg => msg.id !== id)
  ElMessage.success('消息已删除')
}

// 标记所有为已读
const markAllRead = () => {
  messages.value.forEach(msg => {
    msg.isRead = true
  })
  ElMessage.success('全部标记为已读')
}

// 清空已读消息
const deleteAllRead = () => {
  messages.value = messages.value.filter(msg => !msg.isRead)
  ElMessage.success('已清空已读消息')
}
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