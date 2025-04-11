<template>
  <div class="version-container">
    <div class="page-header">
      <h2>版本管理服务</h2>
    </div>

    <el-card class="main-card">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="文档版本历史" name="documentHistory">
          <div class="filter-container">
            <el-form :inline="true">
              <el-form-item label="文档名称">
                <el-select v-model="selectedDocumentId" placeholder="请选择文档" style="width: 300px">
                  <el-option
                    v-for="doc in documentList"
                    :key="doc.id"
                    :label="doc.title"
                    :value="doc.id"
                  />
                </el-select>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="loadVersionHistory">
                  <el-icon><Search /></el-icon> 查询
                </el-button>
              </el-form-item>
            </el-form>
          </div>

          <div v-if="!selectedDocumentId" class="empty-placeholder">
            <el-empty description="请选择要查看的文档" />
          </div>

          <div v-else>
            <el-timeline v-if="versionHistory.length > 0">
              <el-timeline-item
                v-for="version in versionHistory"
                :key="version.id"
                :timestamp="version.createTime"
                :type="version.current ? 'primary' : 'info'"
              >
                <el-card class="version-card">
                  <div class="version-header">
                    <div class="version-title">
                      <span class="version-number">V{{ version.versionNumber }}</span>
                      <span class="version-name">{{ version.versionName }}</span>
                      <el-tag v-if="version.current" type="success" size="small">当前版本</el-tag>
                    </div>
                    <div class="version-actions">
                      <el-button-group>
                        <el-button size="small" type="primary" @click="viewVersion(version)">
                          查看
                        </el-button>
                        <el-button 
                          size="small" 
                          type="warning" 
                          :disabled="version.current" 
                          @click="showCompareDialog(version)"
                        >
                          比较
                        </el-button>
                        <el-button 
                          size="small" 
                          type="danger" 
                          :disabled="version.current" 
                          @click="confirmRollback(version)"
                        >
                          回滚
                        </el-button>
                      </el-button-group>
                    </div>
                  </div>
                  <div class="version-content">
                    <div class="version-info">
                      <div>修改者：{{ version.author }}</div>
                      <div>修改说明：{{ version.description }}</div>
                    </div>
                    <div class="version-changes">
                      <el-tag v-if="version.changeStats.add > 0" type="success" size="small" class="change-tag">
                        新增: {{ version.changeStats.add }}
                      </el-tag>
                      <el-tag v-if="version.changeStats.modify > 0" type="warning" size="small" class="change-tag">
                        修改: {{ version.changeStats.modify }}
                      </el-tag>
                      <el-tag v-if="version.changeStats.delete > 0" type="danger" size="small" class="change-tag">
                        删除: {{ version.changeStats.delete }}
                      </el-tag>
                    </div>
                  </div>
                </el-card>
              </el-timeline-item>
            </el-timeline>

            <el-empty v-else description="暂无版本历史记录" />
          </div>
        </el-tab-pane>

        <el-tab-pane label="版本设置" name="versionSettings">
          <el-form label-width="150px">
            <el-form-item label="自动版本保存">
              <el-switch v-model="versionSettings.autoSave" />
              <div class="form-help">启用后，系统将自动保存文档的每次修改版本</div>
            </el-form-item>
            <el-form-item label="保存间隔时间">
              <el-input-number 
                v-model="versionSettings.saveInterval" 
                :min="5" 
                :max="60" 
                :disabled="!versionSettings.autoSave"
              />
              <span class="form-help">分钟</span>
            </el-form-item>
            <el-form-item label="最大版本保存数量">
              <el-input-number v-model="versionSettings.maxVersions" :min="5" :max="100" />
              <div class="form-help">超过最大版本数量后，最旧的版本将被删除</div>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="saveVersionSettings">保存设置</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 版本比较对话框 -->
    <el-dialog v-model="compareDialogVisible" title="版本比较" width="80%">
      <div class="select-version-container">
        <div class="version-select">
          <span>对比版本：</span>
          <el-select v-model="compareToVersionId" placeholder="选择要比较的版本">
            <el-option
              v-for="version in versionHistory"
              :key="version.id"
              :label="`V${version.versionNumber} - ${version.versionName}`"
              :value="version.id"
              :disabled="version.id === selectedVersionId"
            />
          </el-select>
        </div>
        <el-button 
          type="primary" 
          @click="compareVersions" 
          :disabled="!compareToVersionId"
        >
          比较
        </el-button>
      </div>

      <div v-if="compareResult" class="compare-result">
        <div class="compare-header">
          <div class="version-column">
            <div class="version-info">
              <div class="version-title">V{{ compareResult.fromVersion.versionNumber }}</div>
              <div class="version-date">{{ compareResult.fromVersion.createTime }}</div>
            </div>
          </div>
          <div class="version-column">
            <div class="version-info">
              <div class="version-title">V{{ compareResult.toVersion.versionNumber }}</div>
              <div class="version-date">{{ compareResult.toVersion.createTime }}</div>
            </div>
          </div>
        </div>

        <div class="diff-container">
          <div v-for="(diff, index) in compareResult.diffs" :key="index" class="diff-block">
            <div class="diff-info">{{ diff.sectionName }}</div>
            <div class="diff-content">
              <div class="diff-column left-version" :class="{ 'diff-removed': diff.type === 'removed' }">
                <pre>{{ diff.oldContent }}</pre>
              </div>
              <div class="diff-column right-version" :class="{ 'diff-added': diff.type === 'added' }">
                <pre>{{ diff.newContent }}</pre>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="compareToVersionId" class="compare-loading">
        <el-skeleton :rows="10" animated />
      </div>

      <div v-else class="empty-compare">
        <el-empty description="请选择要比较的版本" />
      </div>
    </el-dialog>

    <!-- 版本预览对话框 -->
    <el-dialog v-model="previewDialogVisible" :title="`文档版本 V${previewVersion?.versionNumber} 预览`" width="70%">
      <div v-if="previewVersion" class="version-preview">
        <div class="preview-info">
          <div><strong>版本名称：</strong>{{ previewVersion.versionName }}</div>
          <div><strong>创建时间：</strong>{{ previewVersion.createTime }}</div>
          <div><strong>修改者：</strong>{{ previewVersion.author }}</div>
          <div><strong>修改说明：</strong>{{ previewVersion.description }}</div>
        </div>
        <el-divider />
        <div class="preview-content">
          <div v-html="previewVersion.content"></div>
        </div>
      </div>
      <div v-else class="preview-loading">
        <el-skeleton :rows="15" animated />
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="previewDialogVisible = false">关闭</el-button>
          <el-button 
            type="primary" 
            :disabled="previewVersion?.current" 
            @click="confirmRollback(previewVersion)"
          >
            回滚到此版本
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search } from '@element-plus/icons-vue'

// 标签页
const activeTab = ref('documentHistory')

// 文档列表
interface Document {
  id: number;
  title: string;
}

const documentList = ref<Document[]>([
  { id: 1, title: '产品需求说明书' },
  { id: 2, title: '系统架构设计文档' },
  { id: 3, title: '用户操作手册' },
  { id: 4, title: '技术规格说明书' },
  { id: 5, title: '项目管理计划' }
])

// 版本管理相关
interface VersionChangeStats {
  add: number;
  modify: number;
  delete: number;
}

interface Version {
  id: number;
  documentId: number;
  versionNumber: number;
  versionName: string;
  author: string;
  createTime: string;
  description: string;
  content?: string;
  current: boolean;
  changeStats: VersionChangeStats;
}

// 选中的文档和版本
const selectedDocumentId = ref<number | null>(null)
const selectedVersionId = ref<number | null>(null)
const versionHistory = ref<Version[]>([])

// 版本对比相关
const compareDialogVisible = ref(false)
const compareToVersionId = ref<number | null>(null)

interface VersionDiff {
  sectionName: string;
  type: 'unchanged' | 'added' | 'removed' | 'modified';
  oldContent: string;
  newContent: string;
}

interface CompareResult {
  fromVersion: Version;
  toVersion: Version;
  diffs: VersionDiff[];
}

const compareResult = ref<CompareResult | null>(null)

// 版本预览相关
const previewDialogVisible = ref(false)
const previewVersion = ref<Version | null>(null)

// 版本设置
const versionSettings = reactive({
  autoSave: true,
  saveInterval: 15,
  maxVersions: 30
})

// 加载版本历史
const loadVersionHistory = () => {
  if (!selectedDocumentId.value) {
    ElMessage.warning('请先选择文档')
    versionHistory.value = []
    return
  }

  // 模拟从服务器获取版本历史
  setTimeout(() => {
    // 这里应该是API调用
    const docId = selectedDocumentId.value
    
    if (docId === 1) {
      versionHistory.value = [
        {
          id: 101,
          documentId: 1,
          versionNumber: 3.0,
          versionName: '正式发布版',
          author: '张三',
          createTime: '2024-04-09 14:30',
          description: '完成所有功能，发布正式版本',
          current: true,
          changeStats: { add: 5, modify: 12, delete: 2 }
        },
        {
          id: 102,
          documentId: 1,
          versionNumber: 2.5,
          versionName: '预发布版本',
          author: '张三',
          createTime: '2024-04-08 16:20',
          description: '修复Beta版本中的问题',
          current: false,
          changeStats: { add: 0, modify: 8, delete: 1 }
        },
        {
          id: 103,
          documentId: 1,
          versionNumber: 2.0,
          versionName: 'Beta版本',
          author: '李四',
          createTime: '2024-04-07 11:15',
          description: '添加新的需求章节',
          current: false,
          changeStats: { add: 8, modify: 3, delete: 0 }
        },
        {
          id: 104,
          documentId: 1,
          versionNumber: 1.0,
          versionName: '初始版本',
          author: '王五',
          createTime: '2024-04-05 09:40',
          description: '创建文档初始版本',
          current: false,
          changeStats: { add: 15, modify: 0, delete: 0 }
        }
      ]
    } else if (docId === 2) {
      versionHistory.value = [
        {
          id: 201,
          documentId: 2,
          versionNumber: 2.0,
          versionName: '修订版',
          author: '李四',
          createTime: '2024-04-08 15:30',
          description: '根据评审意见修改架构设计',
          current: true,
          changeStats: { add: 3, modify: 10, delete: 1 }
        },
        {
          id: 202,
          documentId: 2,
          versionNumber: 1.0,
          versionName: '初始版本',
          author: '张三',
          createTime: '2024-04-06 10:20',
          description: '创建系统架构初始设计',
          current: false,
          changeStats: { add: 18, modify: 0, delete: 0 }
        }
      ]
    } else {
      versionHistory.value = []
      ElMessage.info('该文档暂无版本历史')
    }
  }, 500)
}

// 查看版本
const viewVersion = (version: Version) => {
  selectedVersionId.value = version.id
  previewVersion.value = null
  previewDialogVisible.value = true
  
  // 模拟从服务器获取版本内容
  setTimeout(() => {
    // 这里应该是API调用
    previewVersion.value = {
      ...version,
      content: `
        <h1>${documentList.value.find(d => d.id === version.documentId)?.title} - V${version.versionNumber}</h1>
        <p>这里是版本 ${version.versionNumber} 的内容预览，实际项目中应该从服务器获取真实内容。</p>
        <h2>文档概述</h2>
        <p>这是一个示例文档，用于演示版本管理功能。</p>
        <h2>功能描述</h2>
        <ul>
          <li>功能点1：示例功能描述</li>
          <li>功能点2：示例功能描述</li>
          <li>功能点3：示例功能描述</li>
        </ul>
        <h2>技术细节</h2>
        <p>这里是一些技术细节的描述...</p>
      `
    }
  }, 800)
}

// 显示比较对话框
const showCompareDialog = (version: Version) => {
  selectedVersionId.value = version.id
  compareToVersionId.value = null
  compareResult.value = null
  compareDialogVisible.value = true
}

// 比较版本
const compareVersions = () => {
  if (!selectedVersionId.value || !compareToVersionId.value) {
    return
  }
  
  compareResult.value = null
  
  // 模拟从服务器获取版本对比结果
  setTimeout(() => {
    // 这里应该是API调用
    const fromVersion = versionHistory.value.find(v => v.id === selectedVersionId.value)
    const toVersion = versionHistory.value.find(v => v.id === compareToVersionId.value)
    
    if (fromVersion && toVersion) {
      compareResult.value = {
        fromVersion,
        toVersion,
        diffs: [
          {
            sectionName: '文档概述',
            type: 'unchanged',
            oldContent: '这是一个示例文档，用于演示版本管理功能。',
            newContent: '这是一个示例文档，用于演示版本管理功能。'
          },
          {
            sectionName: '功能描述',
            type: 'modified',
            oldContent: '1. 原有功能描述\n2. 另一个功能描述',
            newContent: '1. 原有功能描述\n2. 更新后的功能描述\n3. 新增的功能点'
          },
          {
            sectionName: '技术实现',
            type: 'added',
            oldContent: '',
            newContent: '这是新增的技术实现章节，详细描述了实现方案。'
          },
          {
            sectionName: '历史记录',
            type: 'removed',
            oldContent: '这部分内容在新版本中已被移除。',
            newContent: ''
          }
        ]
      }
    }
  }, 800)
}

// 确认回滚
const confirmRollback = (version: Version | null) => {
  if (!version) return
  
  ElMessageBox.confirm(
    `确定要将文档 "${documentList.value.find(d => d.id === version.documentId)?.title}" 回滚到版本 V${version.versionNumber} 吗？`,
    '回滚确认',
    {
      confirmButtonText: '确定回滚',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // 模拟回滚操作
    setTimeout(() => {
      // 这里应该是API调用
      
      // 更新当前版本状态
      versionHistory.value.forEach(v => {
        v.current = v.id === version.id
      })
      
      ElMessage.success(`已成功回滚到版本 V${version.versionNumber}`)
      
      // 关闭预览对话框
      previewDialogVisible.value = false
      compareDialogVisible.value = false
    }, 500)
  }).catch(() => {
    // 取消回滚
  })
}

// 保存版本设置
const saveVersionSettings = () => {
  // 模拟保存设置
  setTimeout(() => {
    // 这里应该是API调用
    ElMessage.success('版本管理设置已保存')
  }, 300)
}

// 初始化
onMounted(() => {
  // 在这里可以加载用户的版本管理设置
})
</script>

<style scoped>
.version-container {
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

.filter-container {
  margin-bottom: 20px;
}

.empty-placeholder {
  padding: 40px 0;
  text-align: center;
}

/* 版本历史卡片样式 */
.version-card {
  margin-bottom: 10px;
}

.version-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.version-title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.version-number {
  font-weight: bold;
  font-size: 16px;
}

.version-name {
  color: #606266;
}

.version-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.version-info {
  flex: 1;
  color: #606266;
}

.version-changes {
  display: flex;
  gap: 5px;
}

.change-tag {
  margin-left: 5px;
}

/* 版本比较样式 */
.select-version-container {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.version-select {
  display: flex;
  align-items: center;
  margin-right: 20px;
}

.compare-result {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  overflow: hidden;
}

.compare-header {
  display: flex;
  background-color: #f5f7fa;
  border-bottom: 1px solid #dcdfe6;
}

.version-column {
  flex: 1;
  padding: 10px;
  border-right: 1px solid #dcdfe6;
}

.version-column:last-child {
  border-right: none;
}

.diff-container {
  max-height: 500px;
  overflow-y: auto;
}

.diff-block {
  border-bottom: 1px solid #ebeef5;
}

.diff-info {
  padding: 8px;
  background-color: #f5f7fa;
  font-weight: bold;
  border-bottom: 1px solid #ebeef5;
}

.diff-content {
  display: flex;
}

.diff-column {
  flex: 1;
  padding: 10px;
  overflow-x: auto;
}

.diff-column.left-version {
  border-right: 1px solid #ebeef5;
}

.diff-added {
  background-color: #d4edda;
}

.diff-removed {
  background-color: #f8d7da;
}

pre {
  margin: 0;
  white-space: pre-wrap;
  font-family: Consolas, Monaco, 'Andale Mono', monospace;
  font-size: 14px;
}

/* 版本预览样式 */
.version-preview {
  max-height: 600px;
  overflow-y: auto;
}

.preview-info {
  margin-bottom: 15px;
  padding: 10px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.preview-content {
  padding: 10px;
}

/* 设置表单样式 */
.form-help {
  font-size: 13px;
  color: #909399;
  margin-top: 4px;
}
</style>