import { ref, computed } from 'vue'

// 定义消息接口
export interface Message {
  id: number
  title: string
  content: string
  sender: string
  sendTime: string
  isRead: boolean
  type: 'system' | 'user' | 'team' // 消息类型：系统消息、用户消息、团队消息
}

// 创建消息状态和方法
const messages = ref<Message[]>([
  {
    id: 1,
    title: '系统通知',
    content: '您有新的知识文档需要审核',
    sender: '系统',
    sendTime: '2025-04-14 10:30',
    isRead: false,
    type: 'system'
  },
  {
    id: 2,
    title: '团队消息',
    content: '研发团队有一个新的文档分享给您',
    sender: '研发团队',
    sendTime: '2025-04-13 16:45',
    isRead: false,
    type: 'team'
  },
  {
    id: 3,
    title: '用户消息',
    content: '张三在您的文档中添加了评论',
    sender: '张三',
    sendTime: '2025-04-12 09:15',
    isRead: false,
    type: 'user'
  },
  {
    id: 4,
    title: '系统通知',
    content: '您的账户权限已更新',
    sender: '系统',
    sendTime: '2025-04-10 14:20',
    isRead: true,
    type: 'system'
  },
  {
    id: 5,
    title: '用户消息',
    content: '李四向您发送了一条私信',
    sender: '李四',
    sendTime: '2025-04-09 11:30',
    isRead: true,
    type: 'user'
  }
])

// 计算未读消息数量
const unreadCount = computed(() => {
  return messages.value.filter(msg => !msg.isRead).length
})

// 获取所有消息
const getAllMessages = computed(() => {
  return messages.value
})

// 获取未读消息
const getUnreadMessages = computed(() => {
  return messages.value.filter(msg => !msg.isRead)
})

// 标记消息为已读
const markAsRead = (id: number) => {
  const message = messages.value.find(msg => msg.id === id)
  if (message) {
    message.isRead = true
  }
}

// 标记所有消息为已读
const markAllAsRead = () => {
  messages.value.forEach(msg => {
    msg.isRead = true
  })
}

// 添加新消息
const addMessage = (message: Omit<Message, 'id'>) => {
  const newId = messages.value.length > 0 
    ? Math.max(...messages.value.map(msg => msg.id)) + 1 
    : 1
  
  messages.value.push({
    ...message,
    id: newId
  })
}

// 删除消息
const deleteMessage = (id: number) => {
  const index = messages.value.findIndex(msg => msg.id === id)
  if (index !== -1) {
    messages.value.splice(index, 1)
  }
}

export default {
  messages,
  unreadCount,
  getAllMessages,
  getUnreadMessages,
  markAsRead,
  markAllAsRead,
  addMessage,
  deleteMessage
}