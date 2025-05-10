<template>
  <div class="qa-container">
    <!-- 添加历史记录侧边栏和主聊天区域容器 -->
    <div class="page-layout">
      <!-- 历史记录侧边栏 -->
      <div class="history-sidebar" :class="{ 'history-sidebar-collapsed': !showHistory }">
        <ChatHistory
          :histories="chatHistories"
          :selectedHistoryIndex="currentHistoryIndex"
          @select="loadHistory"
          @delete="deleteHistory"
          @rename="renameHistory"
          @clear-all="clearAllHistories"
          @close="toggleHistorySidebar"
        />
      </div>

      <!-- 主聊天区域 -->
      <div class="main-chat-area">

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
              <div class="message-content">
                <div class="message-header">
                  
            </div>
                <div class="message-body" v-html="formatMessage(message.content)"></div>
                
                <!-- 用户问题的操作按钮 -->
                <div v-if="message.role === 'user'" class="message-actions">
                  <el-tooltip content="复制问题" placement="top">
                    <el-button 
                      type="text" 
                      size="small" 
                      @click="copyToClipboard(message.content)"
                    >
                      <el-icon><CopyDocument /></el-icon>
                    </el-button>
                  </el-tooltip>
                  <el-tooltip content="编辑问题" placement="top">
                    <el-button 
                      type="text" 
                      size="small" 
                      @click="editQuestion(index, message.content)"
                    >
                      <el-icon><Edit /></el-icon>
                    </el-button>
                  </el-tooltip>
          </div>
                
                <!-- AI回答的操作按钮 -->
                <div v-else class="message-actions">
                  <el-tooltip content="复制回答" placement="top">
                    <el-button 
                      type="text" 
                      size="small" 
                      @click="copyToClipboard(message.content)"
                    >
                      <el-icon><CopyDocument /></el-icon>
                    </el-button>
                  </el-tooltip>
                  <el-tooltip content="语音播放" placement="top">
                    <el-button 
                      type="text" 
                      size="small" 
                      :disabled="isPlaying && currentPlayingIndex === index"
                      @click="playAudio(message.content, index)"
                    >
                      <el-icon v-if="isPlaying && currentPlayingIndex === index"><VideoPlay /></el-icon>
                      <el-icon v-else><Microphone /></el-icon>
                    </el-button>
                  </el-tooltip>
               <el-tooltip content="重新生成" placement="top">
                    <el-button 
                      type="text" 
                      size="small" 
                      @click="regenerateAnswer(index)"
                    >
                      <el-icon><Refresh /></el-icon>
                    </el-button>
               </el-tooltip>
        </div>
                
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
              <el-dropdown trigger="click" @command="handleModelChange" class="model-selector">
                <el-button type="default" size="small" class="model-button">
                  <span>{{ currentModel }}</span>
                  <el-icon class="el-icon--right"><arrow-down /></el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item v-for="model in availableModels" :key="model.name" :command="model.name" :class="{ 'active-model': currentModel === model.name }">
                      <el-icon v-if="model.isDefault"><Check /></el-icon>
                      {{ model.name }}
                    </el-dropdown-item>
                  </el-dropdown-menu>
      </template>
              </el-dropdown>
              <el-button 
                v-if="isLoading"
                type="danger" 
                :icon="CircleClose" 
                circle 
                @click="stopGeneration"
              />
              <el-button 
                v-else
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
              <el-radio-button label="community">社区知识库</el-radio-button>
              <el-radio-button label="all">全部</el-radio-button>
            </el-radio-group>

            <!-- 添加按钮到这里 -->
            <div class="right-options">
              <el-button 
                type="primary" 
                plain
                :icon="Plus" 
                @click="startNewChat"
              >新对话</el-button>
              <el-tooltip content="历史会话" placement="top">
                <el-button 
                  type="text" 
                  :icon="Clock" 
                  @click="toggleHistorySidebar"
                />
              </el-tooltip>
            </div>
          </div>
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
  Position, Delete, Download, Link, Plus, List, CaretLeft, 
  CopyDocument, Edit, VideoPlay, Headset, CircleClose, Microphone, Refresh,
  Clock, Check, ArrowDown
} from '@element-plus/icons-vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import ChatHistory from '@/components/ai/ChatHistory.vue'

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

// 历史记录接口
interface ChatHistoryItem {
  id: string
  title?: string
  date: string
  messages: Message[]
  searchScope: string
}

const chatContainer = ref<HTMLElement | null>(null)
const userInput = ref('')
const chatMessages = ref<Message[]>([])
const isLoading = ref(false)
const searchScope = ref('all')
const showHistory = ref(false)
const chatHistories = ref<ChatHistoryItem[]>([])
const currentHistoryIndex = ref(-1)
const isPlaying = ref(false)
const currentPlayingIndex = ref(-1)

const responseController = {
  stopGeneration: null as (() => void) | null
}

// 停止AI生成
const stopGeneration = () => {
  if (responseController.stopGeneration) {
    responseController.stopGeneration()
    
    // 添加取消提示
    chatMessages.value.push({
      role: 'assistant',
      content: '回答生成已被取消。',
      time: new Date().toLocaleTimeString()
    })
    
    isLoading.value = false
    scrollToBottom()
  }
}

// 示例问题
const exampleQuestions = [
  '如何构建企业知识库系统?',
  '文本摘要算法有哪些类型?',
  '团队知识共享的最佳实践是什么?',
  '知识管理平台的核心功能有哪些?'
]

// 切换历史侧边栏
const toggleHistorySidebar = () => {
  showHistory.value = !showHistory.value
}

// 开始新对话
const startNewChat = () => {
  // 只有当当前对话有内容时，才保存为历史
  if (chatMessages.value.length > 0) {
    saveCurrentChatAsHistory()
  }
  
  // 清空当前对话
  chatMessages.value = []
  currentHistoryIndex.value = -1
}

// 保存当前对话为历史记录
const saveCurrentChatAsHistory = () => {
  if (chatMessages.value.length > 0) {
    const firstUserMessage = chatMessages.value.find(msg => msg.role === 'user')
    
    // 生成历史记录标题（使用第一条用户消息的前20个字符）
    const historyTitle = firstUserMessage 
      ? (firstUserMessage.content.length > 20 
          ? firstUserMessage.content.substring(0, 20) + '...' 
          : firstUserMessage.content)
      : `对话 ${chatHistories.value.length + 1}`
    
    const newHistory: ChatHistoryItem = {
      id: `chat-${Date.now()}`,
      title: historyTitle,
      date: new Date().toISOString(),
      messages: [...chatMessages.value],
      searchScope: searchScope.value
    }
    
    // 如果当前在查看历史，则更新该历史
    if (currentHistoryIndex.value !== -1) {
      chatHistories.value[currentHistoryIndex.value] = newHistory
    } else {
      // 否则添加新历史
      chatHistories.value.unshift(newHistory)
    }
    
    // 保存到本地存储
    saveHistoriesToLocalStorage()
  }
}

// 加载历史对话
const loadHistory = (index: number) => {
  // 如果点击的是当前正在查看的历史记录，则不做任何操作
  if (currentHistoryIndex.value === index) {
    return;
  }
  
  // 先保存当前对话
  if (currentHistoryIndex.value !== index && chatMessages.value.length > 0) {
    saveCurrentChatAsHistory()
  }
  
  // 加载选中的历史对话
  const history = chatHistories.value[index]
  if (history) {
    chatMessages.value = [...history.messages]
    searchScope.value = history.searchScope
    currentHistoryIndex.value = index
    nextTick(() => scrollToBottom())
  }
}

// 重命名历史对话
const renameHistory = (index: number, newTitle: string) => {
  if (chatHistories.value[index]) {
    chatHistories.value[index].title = newTitle
    saveHistoriesToLocalStorage()
  }
}

// 删除历史对话
const deleteHistory = (index: number) => {
  chatHistories.value.splice(index, 1)
  
  // 如果删除的是当前查看的历史
  if (currentHistoryIndex.value === index) {
    // 清空当前显示的对话
    chatMessages.value = []
    currentHistoryIndex.value = -1
  } else if (currentHistoryIndex.value > index) {
    // 更新当前历史索引
    currentHistoryIndex.value--
  }
  
  saveHistoriesToLocalStorage()
}

// 清空所有历史
const clearAllHistories = () => {
  chatHistories.value = []
  
  // 如果正在查看历史，则清空当前对话
  if (currentHistoryIndex.value !== -1) {
    chatMessages.value = []
    currentHistoryIndex.value = -1
  }
  
  saveHistoriesToLocalStorage()
}

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
  return new Promise<void>((resolve, reject) => {
    const delay = 1000 + Math.random() * 2000 // 1-3秒随机延迟
    let timer: number | null = null
    let responseTimeout: number | null = null
    
    // 添加一个控制变量，用于标记是否被取消
    let isCancelled = false
    
    // 添加20秒的超时处理
    responseTimeout = window.setTimeout(() => {
      if (timer) {
        clearTimeout(timer)
        timer = null
      }
      
      // 如果响应时间超过20秒，则返回提示消息
      const scopeMap = {
        'personal': '个人知识库',
        'team': '团队知识库',
        'community': '社区知识库',
        'all': '所有知识库'
      }
      
      const response: Message = {
        role: 'assistant',
        content: `抱歉，在${scopeMap[searchScope.value]}中查找相关信息超时（超过20秒）。这可能是因为：\n\n1. 知识库中没有与您问题相关的信息\n2. 系统当前负载较高\n\n请尝试：\n- 使用更具体的关键词\n- 选择其他知识库范围\n- 稍后再试`,
        time: new Date().toLocaleTimeString()
      }
      
      chatMessages.value.push(response)
      isLoading.value = false
      scrollToBottom()
      resolve()
    }, 20000) // 20秒超时
    
    // 停止生成的方法
    responseController.stopGeneration = () => {
      isCancelled = true
      if (timer) {
        clearTimeout(timer)
        timer = null
      }
      if (responseTimeout) {
        clearTimeout(responseTimeout)
        responseTimeout = null
      }
      resolve() // 结束Promise
    }
    
    timer = window.setTimeout(() => {
      // 清除超时定时器
      if (responseTimeout) {
        clearTimeout(responseTimeout)
        responseTimeout = null
      }
      
      // 如果已经被取消，不执行后续操作
      if (isCancelled) {
        return
      }
      
      let aiResponse: Message
      
      // 针对常见示例问题提供静态回答
      if (question.includes('如何构建企业知识库系统') || question.includes('构建企业知识库')) {
        aiResponse = {
          role: 'assistant',
          content: `根据团队知识库中的资料，构建一个有效的企业知识库系统需要考虑以下几个关键步骤：

1. **明确目标和需求**
   - 确定知识库的主要用途和目标受众
   - 分析企业内部不同部门和角色的知识需求
   - 制定知识库成功的评估标准和KPI

2. **选择适当的技术架构**
   - 前端：Vue3、React等现代化框架，构建响应式界面
   - 后端：Spring Boot、Node.js等，提供API服务
   - 数据库：MongoDB等NoSQL数据库适合非结构化知识存储
   - 搜索引擎：Elasticsearch实现全文检索和语义搜索

3. **设计知识分类体系**
   - 建立清晰的知识分类标准和层级关系
   - 设计标签系统，支持多维度知识归类
   - 实现自定义分类方案，满足不同部门需求

4. **实现核心功能**
   - 内容创建与编辑：支持多种格式的文档编辑
   - 搜索和检索：全文检索、语义搜索、标签筛选
   - 版本控制：追踪内容变更历史
   - 权限管理：基于角色的访问控制
   - 数据分析：知识利用情况统计和分析

5. **集成AI技术**
   - 自动文档分类和标签推荐
   - 智能搜索和问答系统
   - 文本摘要生成
   - 相关内容推荐

6. **推广和持续改进**
   - 制定培训计划，提高员工使用积极性
   - 建立反馈机制，不断优化系统
   - 定期评估知识库使用效果，调整发展方向

一个成功的企业知识库系统应当注重用户体验，便于知识的输入和获取，同时具备足够的扩展性以适应企业发展需求。`,
          time: new Date().toLocaleTimeString(),
          sources: [
            {
              id: 2,
              title: '企业知识库系统设计方案',
              url: '/team/knowledge?id=2'
            },
            {
              id: 10,
              title: '知识管理系统构建实践指南',
              url: '/team/knowledge?id=10'
            }
          ]
        };
      } else if (question.includes('文本摘要算法') || question.includes('摘要算法')) {
        aiResponse = {
          role: 'assistant',
          content: `根据社区分享的内容，文本摘要算法主要分为以下几种类型：

1. **抽取式摘要算法（Extractive Summarization）**
   - **原理**：从原始文本中筛选出重要的句子或段落，直接组合形成摘要
   - **常见方法**：
     - **TF-IDF**：基于词频-逆文档频率计算句子重要性
     - **TextRank/LexRank**：基于图模型，将文本构建成图，利用PageRank思想计算句子重要性
     - **LSA(潜在语义分析)**：利用奇异值分解降维，提取文档主题
     - **聚类方法**：将句子聚类，选择各类中心句或接近中心的句子

2. **生成式摘要算法（Abstractive Summarization）**
   - **原理**：理解原文内容后，生成新的语句作为摘要，可能包含原文中不存在的词语
   - **常见方法**：
     - **基于Seq2Seq模型**：使用编码器-解码器架构，如LSTM, GRU等
     - **基于Attention机制**：增强模型对重要内容的关注度
     - **基于预训练模型**：如BERT, GPT, T5等大规模预训练模型微调
     - **基于强化学习**：优化摘要生成过程，如ROUGE-优化

3. **混合式摘要算法**
   - 结合抽取式和生成式方法的优点
   - 先抽取关键内容，再进行生成式摘要，提高效率和质量

4. **多文档摘要**
   - 从多篇相关文档中生成综合性摘要
   - 需要解决信息冗余、一致性和时序排列等问题

5. **特定领域摘要**
   - 针对特定领域文本定制的摘要算法，如科技论文、新闻、医学文献等
   - 结合领域知识和术语表，提高摘要准确性

评估摘要质量通常使用ROUGE(Recall-Oriented Understudy for Gisting Evaluation)、BLEU、METEOR等指标，衡量生成摘要与参考摘要的相似度。

近年来，基于深度学习和大型语言模型的方法(如BART, PEGASUS等)在摘要任务上取得了显著进展，能生成更加连贯、准确的摘要。`,
          time: new Date().toLocaleTimeString(),
          sources: [
            {
              id: 5,
              title: '基于深度学习的文本摘要算法研究',
              url: '/community?id=5'
            },
            {
              id: 15,
              title: '文本摘要技术综述',
              url: '/team/knowledge?id=15'
            }
          ]
        };
      } else if (question.includes('团队知识共享的最佳实践') || question.includes('知识共享')) {
        aiResponse = {
          role: 'assistant',
          content: `根据社区知识库中的资料，团队知识共享的最佳实践包括：

1. **建立知识共享文化**
   - 领导层以身作则，积极参与知识分享活动
   - 将知识共享纳入团队价值观和绩效考核
   - 设立知识共享激励机制，如奖励和认可计划
   - 营造心理安全的环境，鼓励成员分享经验教训

2. **选择合适的工具和平台**
   - 实施统一的知识管理平台，易于访问和使用
   - 根据团队特点选择适当的工具组合（文档协作、Wiki、论坛等）
   - 确保工具支持多种格式的知识记录和检索
   - 与现有工作流程集成，减少额外操作负担

3. **标准化流程和模板**
   - 制定明确的知识记录指南和质量标准
   - 创建常用文档模板，降低知识记录门槛
   - 建立知识审核和更新机制，确保内容准确性
   - 设计结构化的知识分类体系，便于查找

4. **定期知识交流活动**
   - 组织专题分享会，如技术沙龙、经验分享会
   - 实施结对工作和导师制，促进隐性知识转移
   - 开展项目复盘会议，总结经验教训
   - 建立社区实践小组(CoP)，聚焦特定领域知识深化

5. **持续迭代和更新**
   - 定期审查知识库内容，淘汰过时信息
   - 鼓励团队成员对现有知识进行注释和补充
   - 通过使用数据分析知识利用情况，优化内容组织
   - 收集用户反馈，不断完善知识共享机制

6. **克服知识孤岛现象**
   - 打破部门间壁垒，促进跨团队知识流动
   - 建立统一的术语表，减少沟通障碍
   - 识别并支持"知识经纪人"角色，连接不同知识社区
   - 创造非正式交流机会，促进自发性知识共享

最有效的知识共享不仅依赖于技术工具，更需要组织文化和管理实践的支持，使知识共享成为团队日常工作的自然组成部分，而非额外负担。`,
          time: new Date().toLocaleTimeString(),
          sources: [
            {
              id: 4,
              title: '社区问答：如何提高团队知识共享效率？',
              url: '/community?id=4'
            },
            {
              id: 12,
              title: '知识型组织建设指南',
              url: '/team/knowledge?id=12'
            }
          ]
        };
      } else if (question.includes('知识管理平台的核心功能') || question.includes('知识管理功能')) {
        aiResponse = {
          role: 'assistant',
          content: `根据团队知识库的资料，知识管理平台的核心功能有：

1. **内容创建与编辑**
   - 多格式文档支持（文本、表格、幻灯片等）
   - 富文本编辑器，支持多媒体内容
   - 模板系统，规范化知识记录
   - 协作编辑功能，支持多人同时编辑
   - 草稿保存与自动备份

2. **知识组织与分类**
   - 分类目录系统，层级化管理知识
   - 标签系统，多维度标记内容
   - 元数据管理，丰富内容属性
   - 知识地图，可视化知识结构
   - 关联关系管理，连接相关内容

3. **搜索与发现**
   - 全文检索功能，快速定位信息
   - 高级搜索选项，精确筛选结果
   - 智能推荐系统，个性化内容推送
   - 热门内容展示，提高高价值知识可见性
   - 语义检索，理解用户意图

4. **知识访问控制**
   - 基于角色的权限管理
   - 内容级别的访问控制
   - 敏感信息保护机制
   - 外部分享控制
   - 访问日志与审计功能

5. **版本管理与变更追踪**
   - 文档版本历史记录
   - 变更比较功能
   - 版本回滚能力
   - 贡献者追踪
   - 审批流程管理

6. **协作与交流**
   - 评论与讨论功能
   - 通知与提醒系统
   - 工作流集成
   - 社交功能（点赞、收藏等）
   - 团队空间管理

7. **知识分析与报告**
   - 使用统计与分析
   - 内容健康度评估
   - 用户参与度分析
   - 知识趋势报告
   - 自定义仪表盘

8. **智能功能**
   - 自动分类与标签推荐
   - 文本摘要生成
   - 智能问答系统
   - 内容质量评估
   - 知识缺口识别

9. **集成与扩展**
   - API接口，支持系统集成
   - 第三方工具连接器
   - 单点登录(SSO)支持
   - 移动端适配
   - 可扩展插件系统

10. **系统管理**
    - 用户管理
    - 系统配置
    - 备份与恢复
    - 性能监控
    - 数据导入导出

一个完善的知识管理平台应当在确保内容安全的同时，提供便捷的知识获取、分享和协作功能，同时具备可扩展性以满足组织不断变化的需求。`,
          time: new Date().toLocaleTimeString(),
          sources: [
            {
              id: 7,
              title: '知识管理平台功能规范',
              url: '/team/knowledge?id=7'
            },
            {
              id: 3,
              title: '知识管理平台功能演示视频',
              url: '/team/knowledge?id=3'
            }
          ]
        };
      } else if (question.includes('项目进度') || question.includes('进度表') || question.includes('项目计划')) {
        // 项目进度相关问题的处理（保留现有代码）
        aiResponse = {
          role: 'assistant',
          content: `根据我的知识库信息，关于项目进度表：
          
1. 当前项目进度：
   - 需求分析阶段：100% 已完成
   - 系统设计阶段：85% 已完成
   - 前端开发：60% 已完成
   - 后端开发：70% 已完成
   - 数据库设计：90% 已完成
   - 测试阶段：30% 已完成

2. 近期里程碑：
   - 4月20日：完成系统架构设计评审
   - 4月25日：前端核心功能开发完成
   - 4月30日：后端API开发完成
   - 5月10日：系统集成测试开始

如需查看详细的项目甘特图和任务分配，您可以访问项目管理平台或团队知识库中的"项目计划"文档。`,
          time: new Date().toLocaleTimeString(),
          sources: [
            {
              id: 101,
              title: '2024年Q2季度项目计划书',
              url: '/team/knowledge?id=101'
            },
            {
              id: 102,
              title: '项目周报（4月第2周）',
              url: '/team/knowledge?id=102'
            }
          ]
        };
      }
      // 正常的知识库查询逻辑（针对其他未预设答案的问题）
      else {
        // 根据搜索范围调用不同的知识库
        const scope = searchScope.value;
        console.log(`正在从${scope}知识库中搜索相关内容...`);
        
        // 模拟从选定知识库中获取结果的过程
        const searchResults = fetchKnowledgeByScope(question, scope);
        
        // 根据问题和检索结果生成回答
        aiResponse = generateResponseFromKnowledge(question, searchResults);
      }
      
      chatMessages.value.push(aiResponse)
      // 重置响应控制器的停止函数
      responseController.stopGeneration = null
      resolve()
    }, delay)
  })
}

// 根据范围从不同知识库获取信息
const fetchKnowledgeByScope = async (question: string, scope: string) => {
  // 在实际应用中，这里应该调用API获取知识库内容
  try {
    // 根据选择的范围加载相关知识库视图中的数据
    let results = [];
    
    if (scope === 'personal' || scope === 'all') {
      // 从个人知识库视图获取数据
      const personalKnowledgeData = await fetch('/api/knowledge/personal/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: question }),
      }).then(res => res.json());
      
      // 转换结果格式并添加来源标记
      const personalResults = personalKnowledgeData.data.map(item => ({
        ...item,
        source: 'personal',
        sourceUrl: `/personal?id=${item.id}`, // 个人知识库的URL格式
        relevance: item.score || 0.8 // 使用API返回的相关度分数，如果没有则默认0.8
      }));
      
      results = [...results, ...personalResults];
    }
    
    if (scope === 'team' || scope === 'all') {
      // 从团队知识库视图获取数据
      const teamKnowledgeData = await fetch('/api/knowledge/team/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: question }),
      }).then(res => res.json());
      
      // 转换结果格式并添加来源标记
      const teamResults = teamKnowledgeData.data.map(item => ({
        ...item,
        source: 'team',
        sourceUrl: `/team/knowledge?id=${item.id}`, // 团队知识库的URL格式
        relevance: item.score || 0.8
      }));
      
      results = [...results, ...teamResults];
    }
    
    if (scope === 'community' || scope === 'all') {
      // 从社区知识视图获取数据
      const communityKnowledgeData = await fetch('/api/knowledge/community/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: question }),
      }).then(res => res.json());
      
      // 转换结果格式并添加来源标记
      const communityResults = communityKnowledgeData.data.map(item => ({
        ...item,
        source: 'community',
        sourceUrl: `/community?id=${item.id}`, // 社区的URL格式
        relevance: item.score || 0.8
      }));
      
      results = [...results, ...communityResults];
    }
    
    // 按相关度排序
    return results.sort((a, b) => b.relevance - a.relevance);
    
  } catch (error) {
    console.error('获取知识库数据失败:', error);
    
    // 发生错误时使用备用模拟数据（与当前实现相同）
    const knowledgeMap = {
      personal: [
  {
    id: 1,
          title: '个人笔记：知识库系统架构',
          content: '我的知识库架构采用了前后端分离设计，前端使用Vue3+Element Plus，后端使用Spring Boot，数据库采用MongoDB存储非结构化文档。',
          relevance: 0.92,
          source: 'personal',
          sourceUrl: '/personal?id=1'
        }
      ],
      team: [
  {
    id: 2,
          title: '团队文档：企业知识库系统设计方案',
          content: '企业知识库系统是集中存储、管理和共享组织知识资产的平台。构建一个有效的知识库系统需要考虑以下几个方面：\n\n1. 明确目标和需求\n2. 选择适当的技术架构\n3. 设计知识分类体系\n4. 实现搜索和检索功能\n5. 建立权限管理机制\n6. 集成AI技术',
          relevance: 0.95,
          source: 'team',
          sourceUrl: '/team/knowledge?id=2'
  },
  {
    id: 3,
          title: '知识管理平台功能演示视频',
          content: '本视频详细介绍了我们团队开发的知识管理平台各模块功能，包括内容创建、智能分类、全文检索、版本控制等。',
          relevance: 0.85,
          source: 'team',
          sourceUrl: '/team/knowledge?id=3'
        }
      ],
      community: [
  {
    id: 4,
          title: '社区问答：如何提高团队知识共享效率？',
          content: '团队知识共享的最佳实践包括：\n\n1. 建立知识共享文化\n2. 选择合适的工具和平台\n3. 标准化流程和模板\n4. 定期知识交流活动\n5. 持续迭代和更新',
          relevance: 0.88,
          source: 'community',
          sourceUrl: '/community?id=4'
  },
  {
    id: 5,
          title: '社区分享：基于深度学习的文本摘要算法研究',
          content: '文本摘要算法主要分为抽取式摘要和生成式摘要两大类。抽取式方法包括TF-IDF、TextRank等；生成式方法主要基于Seq2Seq、BERT等深度学习模型。',
          relevance: 0.91,
          source: 'community',
          sourceUrl: '/community?id=5'
        }
      ]
    };
    
    let results = [];
    
    if (scope === 'all') {
      // 合并所有知识库的结果
      results = [
        ...knowledgeMap.personal,
        ...knowledgeMap.team,
        ...knowledgeMap.community
      ];
    } else if (knowledgeMap[scope]) {
      results = knowledgeMap[scope];
    }
    
    // 根据问题关键词筛选结果
    return results.filter(item => {
      const keywords = question.toLowerCase().split(/\s+/).filter(k => k.length > 1);
      return keywords.some(keyword => 
        item.title.toLowerCase().includes(keyword) || 
        item.content.toLowerCase().includes(keyword)
      );
    }).sort((a, b) => b.relevance - a.relevance);  // 按相关度排序
  }
}

// 根据知识库内容生成回答
const generateResponseFromKnowledge = (question: string, results: any[]): Message => {
  if (results.length === 0) {
    // 没有找到相关内容
    const scopeMap = {
      'personal': '个人知识库',
      'team': '团队知识库',
      'community': '社区知识库',
      'all': '所有知识库'
    };
    
    return {
      role: 'assistant',
      content: `抱歉，我在${scopeMap[searchScope.value]}中没有找到与您问题相关的信息。您可以尝试：\n\n1. 使用不同的关键词\n2. 选择其他知识库范围\n3. 提出更具体的问题`,
      time: new Date().toLocaleTimeString()
    };
  }
  
  // 使用找到的最相关内容生成回答
  const topResult = results[0];
  
  // 按照来源类型对结果进行分组
  const personalResults = results.filter(item => item.source === 'personal');
  const teamResults = results.filter(item => item.source === 'team');
  const communityResults = results.filter(item => item.source === 'community');
  
  let responseContent = '';
  let sourcesForResponse = [];
  
  // 根据搜索范围和结果来源，确定答案的来源和内容
  switch(searchScope.value) {
    case 'personal':
      if (personalResults.length > 0) {
        // 使用个人知识库的内容作为回答的主要来源
        responseContent = `根据您的个人知识库，${personalResults[0].content}`;
        sourcesForResponse = personalResults.slice(0, 3);
      }
      break;
      
    case 'team':
      if (teamResults.length > 0) {
        // 使用团队知识库的内容作为回答的主要来源
        responseContent = `根据团队知识库中的资料，${teamResults[0].content}`;
        sourcesForResponse = teamResults.slice(0, 3);
      }
      break;
      
    case 'community':
      if (communityResults.length > 0) {
        // 使用社区知识库的内容作为回答的主要来源
        responseContent = `根据社区分享的内容，${communityResults[0].content}`;
        sourcesForResponse = communityResults.slice(0, 3);
      }
      break;
      
    case 'all':
    default:
      // 如果是搜索所有，优先使用最相关的结果，并说明来源
      if (topResult.source === 'personal') {
        responseContent = `根据您的个人知识库，${topResult.content}`;
      } else if (topResult.source === 'team') {
        responseContent = `根据团队知识库的资料，${topResult.content}`;
      } else if (topResult.source === 'community') {
        responseContent = `根据社区分享的内容，${topResult.content}`;
      } else {
        responseContent = `${topResult.content}`;
      }
      
      // 取最相关的前3个结果作为参考来源
      sourcesForResponse = results.slice(0, 3);
      break;
  }
  
  // 如果没能获得有效的回答内容（例如API返回数据格式有问题），使用备用回答
  if (!responseContent) {
    const backupResponses = {
      'personal': "抱歉，我在解析个人知识库内容时遇到了问题。您可以尝试刷新页面或稍后再试。",
      'team': "抱歉，我在解析团队知识库内容时遇到了问题。您可以尝试刷新页面或稍后再试。",
      'community': "抱歉，我在解析社区知识库内容时遇到了问题。您可以尝试刷新页面或稍后再试。",
      'all': "抱歉，我在解析知识库内容时遇到了问题。您可以尝试刷新页面或稍后再试。"
    };
    
    responseContent = backupResponses[searchScope.value];
  }
  
  // 构建回复消息对象
  const response: Message = {
    role: 'assistant',
    content: responseContent,
    time: new Date().toLocaleTimeString(),
    sources: sourcesForResponse.map(item => ({
      id: item.id,
      title: item.title,
      // 根据来源类型使用不同的URL格式
      url: item.source === 'personal' 
        ? `/personal?id=${item.id}` 
        : (item.source === 'team' 
          ? `/team/knowledge?id=${item.id}` 
          : `/community?id=${item.id}`)
    }))
  };
  
  return response;
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
  // 如果当前查看的是历史对话，则询问是否要删除此历史
  if (currentHistoryIndex.value !== -1) {
    ElMessageBox.confirm('是否要同时从历史记录中删除此对话？', '提示', {
      confirmButtonText: '删除历史',
      cancelButtonText: '仅清空',
      type: 'warning',
      distinguishCancelAndClose: true
    }).then(() => {
      // 删除历史
      deleteHistory(currentHistoryIndex.value)
    }).catch(action => {
      if (action === 'cancel') {
        // 仅清空当前对话
        chatMessages.value = []
        currentHistoryIndex.value = -1
      }
    })
  } else {
    chatMessages.value = []
  }
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

// 保存历史记录到本地存储
const saveHistoriesToLocalStorage = () => {
  localStorage.setItem('qaHistories', JSON.stringify(chatHistories.value))
}

// 加载历史记录
onMounted(() => {
  // 从本地存储加载历史对话
  const savedHistories = localStorage.getItem('qaHistories')
  if (savedHistories) {
    try {
      chatHistories.value = JSON.parse(savedHistories)
    } catch (e) {
      console.error('Failed to load chat histories:', e)
    }
  }
})

// 在离开页面或进行其他操作前保存当前对话
let autoSaveTimerId: number | null = null; // 添加一个变量跟踪定时器ID

watch(chatMessages, (newMessages) => {
  if (newMessages.length > 0) {
    // 清除之前的定时器以防止重复保存
    if (autoSaveTimerId !== null) {
      clearTimeout(autoSaveTimerId);
      autoSaveTimerId = null;
    }
    
    // 自动保存当前对话（防止因为刷新页面等操作丢失对话）
    autoSaveTimerId = window.setTimeout(() => {
      // 检查这个对话是否已经存在于历史记录中
      const currentMessageContent = newMessages[0]?.content || '';
      const isDuplicate = currentHistoryIndex.value === -1 && 
                          chatHistories.value.some(history => 
                            history.messages[0]?.content === currentMessageContent);
      
      if (!isDuplicate) {
        if (currentHistoryIndex.value === -1) {
          // 如果是新对话，保存为历史
          saveCurrentChatAsHistory();
        } else {
          // 如果是编辑历史对话，更新历史
          const history = chatHistories.value[currentHistoryIndex.value];
          if (history) {
            history.messages = [...newMessages];
            history.searchScope = searchScope.value;
            saveHistoriesToLocalStorage();
          }
        }
      }
      autoSaveTimerId = null;
    }, 2000); // 延迟2秒保存，避免频繁写入
  }
}, { deep: true })

// 复制到剪贴板
const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text).then(() => {
    ElMessage.success('内容已复制到剪贴板')
  }).catch(() => {
    ElMessage.error('复制失败，请重试')
  })
}

// 编辑问题
const editQuestion = (index: number, content: string) => {
  userInput.value = content
  chatMessages.value.splice(index, 1)
}

// 播放音频
const playAudio = (text: string, index: number) => {
  if (isPlaying.value) return

  isPlaying.value = true
  currentPlayingIndex.value = index

  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'zh-CN'
  utterance.onend = () => {
    isPlaying.value = false
    currentPlayingIndex.value = -1
  }
  speechSynthesis.speak(utterance)
}

// 重新生成答案
const regenerateAnswer = (index: number) => {
  // 找到对应的用户问题
  const userMessageIndex = index - 1
  if (userMessageIndex >= 0 && chatMessages.value[userMessageIndex].role === 'user') {
    const userQuestion = chatMessages.value[userMessageIndex].content
    // 删除当前AI回答及之后的所有消息
    chatMessages.value.splice(index)
    // 重新发送用户问题
    handleSendMessage(userQuestion)
  }
}

// AI模型选择
const currentModel = ref('Doubao-1.5-pro')
const availableModels = ref([
  { name: 'Doubao-1.5-pro', isDefault: true },
  { name: 'DeepSeek-Reasoner', isDefault: false },
  { name: 'DeepSeek-V3', isDefault: false },
  { name: 'DeepSeek-V3-0324', isDefault: false }
])

// 切换AI模型
const handleModelChange = (modelName: string) => {
  currentModel.value = modelName
  ElMessage.success(`已切换至 ${modelName} 模型`)
}
</script>

<style scoped>
.qa-container {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 130px);
}

.page-layout {
  display: flex;
  height: 100%;
  position: relative;
}

/* 历史侧边栏样式 */
.history-sidebar {
  width: 230px;
  height: 100%;
  transition: width 0.3s;
  overflow: hidden;
}

.history-sidebar-collapsed {
  width: 0;
}

/* 主聊天区域样式 */
.main-chat-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 顶部操作栏样式 */
.chat-actions {
  padding: 10px;
  display: flex;
  align-items: center;
  gap: 5px;
  border-bottom: 1px solid #ebeef5;
  margin-top: -8px; /* 将按钮往上移动20px */
  position: relative;
  z-index: 2;
  background-color: white;
}

.chat-container {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background-color: #f5f7fa;
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
  margin-bottom: -20px;
}

.welcome-header h3 {
  font-size: 30px;
  margin-bottom: 5px;
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
  gap: 3px;
  max-width: 90%;
}

.user-message {
  align-self: flex-end;
}

.ai-message {
  align-self: flex-start;
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

.message-actions {
  display: flex;
  gap: 1px;
  margin-top: 8px;
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
  gap: 3px;
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
  display: flex;
  align-items: center;
  gap: 10px;
}

.input-options {
  display: flex;
  align-items: center;
  padding: 0 15px 15px;
  border-top: none;
}

.option-label {
  margin-right: 10px;
  color: #606266;
}

.right-options {
  margin-left: auto;
  display: flex;
  gap: 5px;
  justify-content: flex-end;
  padding-right: 10px;
}

/* Override element UI styles for textarea */
:deep(.el-textarea__inner) {
  border-radius: 20px;
  padding: 12px 20px;
  resize: none;
  min-height: 60px;
}

/* 增加知识库单选按钮组文字大小 */
:deep(.el-radio-button__inner) {
  font-size: 16px;
  padding: 8px 15px;
}

.model-selector {
  margin-right: 5px;
}

.model-button {
  display: flex;
  align-items: center;
  padding: 6px 10px;
  font-size: 13px;
  border-radius: 4px;
  background-color: #f5f7fa;
  border-color: #e4e7ed;
}

.active-model {
  color: #409eff;
  font-weight: 500;
  background-color: #ecf5ff;
}
</style>