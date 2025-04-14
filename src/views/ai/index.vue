<template>
  <div class="qa-container">

    <!-- 聊天内容区域 -->
    <div class="chat-container" ref="chatContainer">
      <!-- 欢迎消息 -->
      <div v-if="chatMessages.length === 0" class="welcome-container">
        <div class="welcome-header">
          <h3>知识库AI助手</h3>
          <p>基于知识库内容，智能回答您的问题</p>
        </div>
        <div class="example-questions">
          <h4>您可以尝试问我：</h4>
          <div class="question-chips">
            <div 
              v-for="(question, index) in exampleQuestions" 
              :key="index" 
              class="question-chip"
              @click="useExampleQuestion(question)"
            >
              {{ question }}
            </div>
          </div>
        </div>
      </div>

      <!-- 聊天消息列表 -->
      <div v-else class="message-list">
        <div 
          v-for="(message, index) in chatMessages" 
          :key="index" 
          :class="['message-item', message.role === 'user' ? 'user-message' : 'ai-message']"
        >
          <div class="message-avatar">
            <el-avatar :size="40" :icon="message.role === 'user' ? 'User' : 'ChatDotRound'" />
          </div>
          <div class="message-content">
            <div class="message-header">
              <span class="message-sender">{{ message.role === 'user' ? '我' : 'AI助手' }}</span>
              <span class="message-time">{{ message.time }}</span>
            </div>
            <div class="message-body" v-html="formatMessage(message.content)"></div>
            <div v-if="message.sources && message.sources.length > 0" class="message-sources">
              <div class="sources-header">参考来源:</div>
              <div 
                v-for="(source, sourceIndex) in message.sources" 
                :key="sourceIndex" 
                class="source-item"
                @click="openSource(source)"
              >
                <el-icon><Document /></el-icon>
                <span>{{ source.title }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 加载中 -->
      <div v-if="isLoading" class="loading-container">
        <el-icon class="loading-icon"><Loading /></el-icon>
        <span>思考中...</span>
      </div>
    </div>

    <!-- 输入区域 -->
    <div class="input-container">
      <div class="input-box">
        <el-input
          v-model="userInput"
          type="textarea"
          :rows="2"
          placeholder="输入问题，按回车发送..."
          resize="none"
          class="question-input"
          @keyup.enter.exact="handleSendMessage"
        />
        <div class="send-button-container">
          <el-button 
            type="primary" 
            :icon="Position" 
            circle 
            :disabled="!userInput.trim() || isLoading"
            @click="handleSendMessage"
          />
        </div>
      </div>

      <div class="input-options">
        <div class="option-label">搜索范围:</div>
        <el-radio-group v-model="searchScope" size="small">
          <el-radio-button label="personal">个人知识库</el-radio-button>
          <el-radio-button label="team">团队知识库</el-radio-button>
          <el-radio-button label="all">全部</el-radio-button>
        </el-radio-group>

        <div class="right-options">
          <el-tooltip content="清空对话" placement="top">
            <el-button 
              type="text" 
              :icon="Delete" 
              @click="clearConversation"
            />
          </el-tooltip>
          <el-tooltip content="导出对话" placement="top">
            <el-button 
              type="text" 
              :icon="Download" 
              @click="exportConversation"
            />
          </el-tooltip>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import { 
  Search, Document, User, ChatDotRound, Loading, 
  Position, Delete, Download, Link
} from '@element-plus/icons-vue'

const router = useRouter()

// 聊天消息
interface Message {
  role: 'user' | 'assistant'
  content: string
  time: string
  sources?: Array<{
    id: number
    title: string
    url: string
  }>
}

const chatContainer = ref<HTMLElement | null>(null)
const userInput = ref('')
const chatMessages = ref<Message[]>([])
const isLoading = ref(false)
const searchScope = ref('all')

// 示例问题
const exampleQuestions = [
  '如何构建企业知识库系统?',
  '文本摘要算法有哪些类型?',
  '团队知识共享的最佳实践是什么?',
  '知识管理平台的核心功能有哪些?'
]

// 使用示例问题
const useExampleQuestion = (question: string) => {
  userInput.value = question
  handleSendMessage()
}

// 发送消息
const handleSendMessage = async () => {
  const trimmedInput = userInput.value.trim()
  if (!trimmedInput || isLoading.value) return
  
  // 防止按Enter键重复发送
  if (event instanceof KeyboardEvent && event.key === 'Enter') {
    if (event.shiftKey) return // 允许Shift+Enter换行
    event.preventDefault()
  }
  
  // 添加用户消息
  const userMessage = {
    role: 'user' as const,
    content: trimmedInput,
    time: new Date().toLocaleTimeString()
  }
  chatMessages.value.push(userMessage)
  userInput.value = ''
  
  // 滚动到底部
  await scrollToBottom()
  
  // 显示加载状态
  isLoading.value = true
  
  try {
    // 模拟API调用获取AI回复
    await simulateAIResponse(trimmedInput)
  } catch (error) {
    console.error('获取AI回复失败:', error)
    // 添加错误消息
    chatMessages.value.push({
      role: 'assistant' as const,
      content: '抱歉，处理您的问题时出现了错误，请稍后再试。',
      time: new Date().toLocaleTimeString()
    })
  } finally {
    isLoading.value = false
    await scrollToBottom()
  }
}

// 模拟AI回复
const simulateAIResponse = async (question: string) => {
  // 在实际应用中，这里应该调用后端API
  return new Promise<void>((resolve) => {
    const delay = 1000 + Math.random() * 2000 // 1-3秒随机延迟
    
    setTimeout(() => {
      let aiResponse: Message
      
      // 根据问题模拟不同的回答
      if (question.includes('知识库')) {
        aiResponse = {
          role: 'assistant',
          content: `企业知识库系统是集中存储、管理和共享组织知识资产的平台。构建一个有效的知识库系统需要考虑以下几个方面：

1. **明确目标和需求**：确定知识库的主要用途和目标用户
2. **选择适当的技术架构**：根据需求选择集中式或分布式架构
3. **设计知识分类体系**：建立清晰的分类标准和标签系统
4. **实现搜索和检索功能**：提供高效的全文搜索和语义搜索能力
5. **建立权限管理机制**：确保信息安全和适当的访问控制
6. **集成AI技术**：利用智能推荐和自动分类提升用户体验

成功的知识库系统不仅需要技术支持，还需要组织文化和管理流程的配合，鼓励知识共享和持续更新。`,
          time: new Date().toLocaleTimeString(),
          sources: [
            {
              id: 1,
              title: '企业知识库系统设计方案',
              url: '/knowledge/browse?id=2'
            },
            {
              id: 2,
              title: '知识管理平台功能演示视频',
              url: '/knowledge/browse?id=3'
            }
          ]
        }
      } else if (question.includes('摘要') || question.includes('算法')) {
        aiResponse = {
          role: 'assistant',
          content: `文本摘要算法主要分为两大类：

1. **抽取式摘要(Extractive Summarization)**
   - 从原文中直接选择关键句子组成摘要
   - 主要方法：TF-IDF、TextRank、LexRank等
   - 优点：保持原文表述，不会产生语法错误
   - 缺点：摘要间可能缺乏连贯性

2. **生成式摘要(Abstractive Summarization)**
   - 理解原文后重新生成摘要内容
   - 主要方法：基于Seq2Seq、BERT、GPT等深度学习模型
   - 优点：生成更流畅自然的摘要
   - 缺点：可能出现幻觉内容(hallucination)

近年来，预训练大型语言模型如BART、T5和GPT系列在生成式摘要任务上表现尤为突出，能够生成更加连贯和准确的摘要。`,
          time: new Date().toLocaleTimeString(),
          sources: [
            {
              id: 1,
              title: '基于深度学习的文本摘要算法研究',
              url: '/knowledge/browse?id=1'
            }
          ]
        }
      } else if (question.includes('团队') || question.includes('协作')) {
        aiResponse = {
          role: 'assistant',
          content: `团队知识共享的最佳实践包括：

1. **建立知识共享文化**
   - 领导层以身作则，积极分享知识
   - 设立知识共享激励机制和奖励

2. **选择合适的工具和平台**
   - 统一的知识管理平台
   - 协作文档和实时沟通工具
   - 版本控制系统

3. **标准化流程和模板**
   - 制定一致的文档结构和命名规范
   - 明确的知识贡献和审核流程

4. **定期知识交流活动**
   - 团队分享会和技术沙龙
   - 经验总结和复盘会议

5. **持续迭代和更新**
   - 定期审核和更新知识库内容
   - 收集用户反馈改进系统

结合这些实践，可以显著提高团队协作效率和知识传承质量。`,
          time: new Date().toLocaleTimeString(),
          sources: [
            {
              id: 1,
              title: '团队协作最佳实践指南',
              url: '/knowledge/browse?id=4'
            }
          ]
        }
      } else {
        aiResponse = {
          role: 'assistant',
          content: `感谢您的提问。基于您的问题，我从知识库中找到了以下信息：

现代知识管理平台的核心功能通常包括：

1. **内容创建与编辑**：支持多种格式的文档创建和协作编辑
2. **智能分类与标签**：自动和手动分类系统，支持多维度标签
3. **全文检索**：强大的搜索功能，支持语义和关键词搜索
4. **版本控制**：追踪文档变更历史，支持版本对比和回滚
5. **权限管理**：细粒度的访问控制和权限分配
6. **智能推荐**：基于用户行为和内容相关性的推荐系统
7. **数据分析**：知识使用情况统计和可视化报表
8. **集成能力**：与其他企业系统无缝集成

选择适合您组织的平台时，应考虑团队规模、技术环境和特定业务需求。`,
          time: new Date().toLocaleTimeString(),
          sources: [
            {
              id: 1,
              title: '企业知识库系统设计方案',
              url: '/knowledge/browse?id=2'
            }
          ]
        }
      }
      
      chatMessages.value.push(aiResponse)
      resolve()
    }, delay)
  })
}

// 消息格式化，解析链接和换行
const formatMessage = (content: string) => {
  // 将URL转换为链接
  const urlRegex = /(https?:\/\/[^\s]+)/g
  let formattedContent = content.replace(urlRegex, '<a href="$1" target="_blank">$1</a>')
  
  // 保留换行
  formattedContent = formattedContent.replace(/\n/g, '<br>')
  
  return formattedContent
}

// 滚动到底部
const scrollToBottom = async () => {
  await nextTick()
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight
  }
}

// 打开参考来源
const openSource = (source: any) => {
  router.push(source.url)
}

// 清空对话
const clearConversation = () => {
  chatMessages.value = []
}

// 导出对话
const exportConversation = () => {
  if (chatMessages.value.length === 0) return
  
  // 格式化对话内容
  let content = '# 知识问答对话记录\n\n'
  content += `导出时间: ${new Date().toLocaleString()}\n\n`
  
  chatMessages.value.forEach(message => {
    const role = message.role === 'user' ? '我' : 'AI助手'
    content += `## ${role} (${message.time})\n\n${message.content}\n\n`
    
    if (message.sources && message.sources.length > 0) {
      content += '参考来源:\n'
      message.sources.forEach(source => {
        content += `- ${source.title}\n`
      })
      content += '\n'
    }
  })
  
  // 创建下载链接
  const blob = new Blob([content], { type: 'text/markdown' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `知识问答对话_${new Date().toISOString().slice(0, 10)}.md`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// 监听滚动
onMounted(() => {
  // 从本地存储加载历史对话
  const savedMessages = localStorage.getItem('qaMessages')
  if (savedMessages) {
    try {
      chatMessages.value = JSON.parse(savedMessages)
    } catch (e) {
      console.error('Failed to load saved messages:', e)
    }
  }
})

// 保存对话到本地存储
watch(chatMessages, (newMessages) => {
  localStorage.setItem('qaMessages', JSON.stringify(newMessages))
}, { deep: true })
</script>

<style scoped>
.qa-container {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 130px);
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

.chat-container {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background-color: #f5f7fa;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.05);
}

.welcome-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.welcome-header {
  text-align: center;
  margin-bottom: 30px;
}

.welcome-header h3 {
  font-size: 24px;
  margin-bottom: 10px;
  color: #303133;
}

.welcome-header p {
  color: #606266;
}

.example-questions {
  width: 100%;
  max-width: 600px;
}

.example-questions h4 {
  margin-bottom: 15px;
  color: #606266;
  text-align: center;
}

.question-chips {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;
}

.question-chip {
  padding: 10px 16px;
  background-color: #fff;
  border: 1px solid #dcdfe6;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s;
}

.question-chip:hover {
  background-color: #ecf5ff;
  border-color: #409eff;
  color: #409eff;
}

.message-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.message-item {
  display: flex;
  gap: 12px;
  max-width: 90%;
}

.user-message {
  align-self: flex-end;
  flex-direction: row-reverse;
}

.ai-message {
  align-self: flex-start;
}

.message-avatar {
  flex-shrink: 0;
}

.message-content {
  background-color: #fff;
  padding: 12px 16px;
  border-radius: 12px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

.user-message .message-content {
  background-color: #ecf5ff;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.message-sender {
  font-weight: 500;
  color: #303133;
}

.message-time {
  font-size: 12px;
  color: #909399;
}

.message-body {
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
}

.message-sources {
  margin-top: 12px;
  padding-top: 8px;
  border-top: 1px solid #ebeef5;
}

.sources-header {
  font-size: 12px;
  color: #909399;
  margin-bottom: 6px;
}

.source-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 0;
  font-size: 13px;
  color: #409eff;
  cursor: pointer;
}

.source-item:hover {
  text-decoration: underline;
}

.loading-container {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  color: #909399;
}

.loading-icon {
  animation: rotate 1s linear infinite;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.input-container {
  margin-top: auto;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
}

.input-box {
  position: relative;
  padding: 15px;
}

.question-input {
  padding-right: 50px;
}

.send-button-container {
  position: absolute;
  right: 20px;
  bottom: 20px;
}

.input-options {
  display: flex;
  align-items: center;
  padding: 0 15px 15px;
  border-top: 1px solid #f0f0f0;
}

.option-label {
  margin-right: 10px;
  color: #606266;
}

.right-options {
  margin-left: auto;
  display: flex;
  gap: 10px;
}

/* Override element UI styles for textarea */
:deep(.el-textarea__inner) {
  border-radius: 20px;
  padding: 12px 20px;
  resize: none;
  min-height: 60px;
}
</style>