<template>
  <div class="chat-history-container">
    <div class="history-header">
      <div class="left-section">
        <el-button 
          type="text" 
          :icon="ArrowLeft" 
          @click="closeHistory"
          class="back-button"
        />
        <h3>历史对话记录</h3>
      </div>
      <div class="header-actions">
        <el-tooltip content="删除所有历史" placement="top">
          <el-button 
            type="danger" 
            :icon="Delete" 
            size="small"
            plain
            @click="confirmClearAllHistory"
          >清空</el-button>
        </el-tooltip>
      </div>
    </div>
    
    <div v-if="histories.length === 0" class="empty-history">
      <el-empty description="暂无对话历史" />
    </div>
    
    <el-scrollbar v-else height="calc(100vh - 200px)">
      <div class="history-list">
        <!-- 新的行式历史记录列表 -->
        <div 
          v-for="(history, index) in histories" 
          :key="index" 
          class="history-row"
          :class="{ 'active': selectedHistoryIndex === index }"
          @click="selectHistory(index)"
        >
          <div class="history-content">
            <div class="history-date">{{ formatDate(history.date) }}</div>
            <div class="history-question">{{ getHistoryPreview(history) }}</div>
          </div>
          <div class="history-actions">
            <el-tooltip content="重命名" placement="top">
              <el-button 
                type="text" 
                :icon="Edit" 
                @click.stop="renameHistory(index)" 
              />
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button 
                type="text" 
                :icon="Delete" 
                @click.stop="deleteHistory(index)" 
              />
            </el-tooltip>
          </div>
        </div>
      </div>
    </el-scrollbar>
    
    <!-- 重命名对话框 -->
    <el-dialog
      v-model="renameDialogVisible"
      title="重命名对话"
      width="30%"
    >
      <el-input v-model="newHistoryTitle" placeholder="输入对话标题" />
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="renameDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmRename">确认</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, defineEmits, defineProps } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import { Delete, Edit, Timer, ArrowLeft } from '@element-plus/icons-vue'

// 定义属性
const props = defineProps({
  histories: {
    type: Array as () => Array<{
      id: string;
      title?: string;
      date: string;
      messages: Array<any>;
    }>,
    default: () => []
  },
  selectedHistoryIndex: {
    type: Number,
    default: -1
  }
})

// 定义事件
const emit = defineEmits(['select', 'delete', 'rename', 'clear-all', 'close'])

// 重命名相关状态
const renameDialogVisible = ref(false)
const newHistoryTitle = ref('')
const currentEditIndex = ref(-1)

// 选择对话历史
const selectHistory = (index: number) => {
  emit('select', index)
}

// 获取对话历史预览
const getHistoryPreview = (history: any) => {
  if (!history.messages || history.messages.length === 0) {
    return '无对话内容'
  }
  
  // 查找历史记录中的第一个用户消息
  const userMessage = history.messages.find((msg: any) => msg.role === 'user')
  if (!userMessage) {
    return '无用户问题'
  }
  
  // 使用用户消息内容作为预览
  return userMessage.content
}

// 格式化日期
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const today = new Date()
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  
  // 判断是否是今天或昨天
  if (date.toDateString() === today.toDateString()) {
    return `今天 ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
  } else if (date.toDateString() === yesterday.toDateString()) {
    return `昨天 ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
  } else {
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }
}

// 打开重命名对话框
const renameHistory = (index: number) => {
  currentEditIndex.value = index
  newHistoryTitle.value = props.histories[index].title || `对话 ${index + 1}`
  renameDialogVisible.value = true
}

// 确认重命名
const confirmRename = () => {
  if (currentEditIndex.value !== -1) {
    emit('rename', currentEditIndex.value, newHistoryTitle.value.trim() || `对话 ${currentEditIndex.value + 1}`)
    renameDialogVisible.value = false
  }
}

// 删除对话历史
const deleteHistory = (index: number) => {
  ElMessageBox.confirm('确定要删除此对话历史吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    emit('delete', index)
    ElMessage({
      type: 'success',
      message: '删除成功'
    })
  }).catch(() => {})
}

// 清空所有历史
const confirmClearAllHistory = () => {
  if (props.histories.length === 0) {
    ElMessage({
      type: 'info',
      message: '没有历史记录可清空'
    })
    return
  }
  
  ElMessageBox.confirm('确定要清空所有对话历史吗？此操作不可恢复！', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
    confirmButtonClass: 'el-button--danger'
  }).then(() => {
    emit('clear-all')
    ElMessage({
      type: 'success',
      message: '已清空所有对话历史'
    })
  }).catch(() => {})
}

// 关闭历史记录侧边栏
const closeHistory = () => {
  emit('close')
}
</script>

<style scoped>
.chat-history-container {
  height: 100%;
  border-right: 1px solid #ebeef5;
  padding: 15px 10px;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.history-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
}

.empty-history {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* 新的行式历史记录样式 */
.history-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 10px;
  border-radius: 6px;
  background-color: #f9f9f9;
  cursor: pointer;
  transition: all 0.2s ease;
  border-left: 3px solid transparent;
}

.history-row:hover {
  background-color: #f0f7ff;
}

.history-row.active {
  background-color: #ecf5ff;
  border-left: 3px solid #409eff;
}

.history-content {
  flex: 1;
  min-width: 0; /* 确保文本可以被截断 */
  display: flex;
  flex-direction: column;
}

.history-date {
  font-size: 11px;
  color: #909399;
  margin-bottom: 3px;
}

.history-question {
  font-size: 13px;
  color: #303133;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding-right: 5px;
}

/* 操作按钮样式 */
.history-actions {
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s;
}

.history-row:hover .history-actions {
  opacity: 1;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.left-section {
  display: flex;
  align-items: center;
  gap: 10px;
}

.back-button {
  padding: 0;
  margin: 0;
  background: none;
  border: none;
  font: inherit;
  cursor: pointer;
  outline: inherit;
}
</style>