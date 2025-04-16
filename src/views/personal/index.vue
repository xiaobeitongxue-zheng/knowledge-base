<template>
    <div class="personal-knowledge">
      <div class="page-header">
        <h2>个人知识库</h2>
        <div class="header-actions">
          <el-button type="primary" @click="handleCreateDocument">
            <el-icon><Plus /></el-icon>新建文档
          </el-button>
          <el-button @click="handleImportDocument">
            <el-icon><Upload /></el-icon>导入文档
          </el-button>
        </div>
      </div>
  
      <!-- 搜索和筛选区域 -->
      <el-card class="filter-container">
        <el-form :inline="true" :model="filterForm" class="filter-form">
          <el-form-item label="关键词">
            <el-input v-model="filterForm.keyword" placeholder="请输入标题或内容关键词" clearable />
          </el-form-item>
          <el-form-item label="分类">
            <el-select v-model="filterForm.category" placeholder="请选择分类" clearable style="width: 120px;">
              <el-option v-for="item in categoryOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="标签">
            <el-select v-model="filterForm.tags" multiple collapse-tags placeholder="请选择标签" clearable style="width: 180px;">
              <el-option v-for="item in tagOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="日期范围">
            <el-date-picker
              v-model="filterForm.dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">搜索</el-button>
            <el-button @click="resetFilter">重置</el-button>
          </el-form-item>
        </el-form>
      </el-card>
  
      <!-- 个人知识库统计卡片 -->
      <div class="stats-cards">
        <el-card class="stats-card">
          <template #header>
            <div class="card-header">
              <span>我的文档</span>
              <el-icon><Document /></el-icon>
            </div>
          </template>
          <div class="stats-value">{{ statistics.totalDocuments }}</div>
        </el-card>
        
        <el-card class="stats-card">
          <template #header>
            <div class="card-header">
              <span>阅读量</span>
              <el-icon><View /></el-icon>
            </div>
          </template>
          <div class="stats-value">{{ statistics.totalViews }}</div>
        </el-card>
        
        <el-card class="stats-card">
          <template #header>
            <div class="card-header">
              <span>被引用</span>
              <el-icon><Link /></el-icon>
            </div>
          </template>
          <div class="stats-value">{{ statistics.totalCitations }}</div>
        </el-card>
        
        <el-card class="stats-card">
          <template #header>
            <div class="card-header">
              <span>收藏数</span>
              <el-icon><Star /></el-icon>
            </div>
          </template>
          <div class="stats-value">{{ statistics.totalFavorites }}</div>
        </el-card>
      </div>
  
      <!-- 文档列表 -->
      <el-card class="document-list">
        <el-tabs v-model="activeTab" @tab-click="handleTabClick">
          <el-tab-pane label="全部文档" name="all"></el-tab-pane>
          <el-tab-pane label="最近编辑" name="recent"></el-tab-pane>
          <el-tab-pane label="已收藏" name="favorite"></el-tab-pane>
          <el-tab-pane label="归档文档" name="archived"></el-tab-pane>
        </el-tabs>
  
        <div class="view-toggle">
          <span>视图：</span>
          <el-radio-group v-model="viewMode" size="small">
            <el-radio-button label="list">
              <el-icon><List /></el-icon>
            </el-radio-button>
            <el-radio-button label="grid">
              <el-icon><Grid /></el-icon>
            </el-radio-button>
          </el-radio-group>
        </div>
  
        <!-- 列表视图 -->
        <el-table
          v-if="viewMode === 'list'"
          :data="documentList"
          style="width: 100%"
          @selection-change="handleSelectionChange"
          v-loading="loading"
          border
          table-layout="fixed"
        >
          <el-table-column type="selection" width="55" />
          <el-table-column prop="title" label="标题" min-width="280">
            <template #default="{ row }">
              <div class="document-title">
                <el-icon :class="['document-icon', `type-${row.docType}`]">
                  <component :is="getDocumentIcon(row.docType)" />
                </el-icon>
                <el-link @click="viewDocument(row)">{{ row.title }}</el-link>
                <el-tag v-if="row.isPrivate" size="small" type="danger">私密</el-tag>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="category" label="分类" width="120" />
          <el-table-column prop="updateTime" label="更新时间" width="160" sortable />
          <el-table-column prop="visitCount" label="阅读量" width="90" sortable />
          <el-table-column label="标签" width="160">
            <template #default="{ row }">
              <el-tag v-for="tag in row.tags" :key="tag" size="small" class="mx-1">{{ tag }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="220" fixed="right">
            <template #default="{ row }">
              <el-button-group>
                <el-button link type="primary" @click="viewDocument(row)">查看</el-button>
                <el-button link type="primary" @click="editDocument(row)">编辑</el-button>
                <el-dropdown trigger="click">
                  <el-button link type="primary">
                    更多<el-icon><ArrowDown /></el-icon>
                  </el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item @click="shareDocument(row)">分享</el-dropdown-item>
                      <el-dropdown-item @click="toggleFavorite(row)">
                        {{ row.isFavorite ? '取消收藏' : '收藏' }}
                      </el-dropdown-item>
                      <el-dropdown-item @click="togglePrivate(row)">
                        {{ row.isPrivate ? '设为公开' : '设为私密' }}
                      </el-dropdown-item>
                      <el-dropdown-item @click="duplicateDocument(row)">复制</el-dropdown-item>
                      <el-dropdown-item @click="downloadDocument(row)">下载</el-dropdown-item>
                      <el-dropdown-item @click="moveToArchive(row)" v-if="!row.isArchived">归档</el-dropdown-item>
                      <el-dropdown-item @click="restoreFromArchive(row)" v-if="row.isArchived">还原</el-dropdown-item>
                      <el-dropdown-item divided @click="deleteDocument(row)">删除</el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </el-button-group>
            </template>
          </el-table-column>
        </el-table>
  
        <!-- 网格视图 -->
        <div v-else class="grid-view" v-loading="loading">
          <el-card v-for="doc in documentList" :key="doc.id" class="document-card" shadow="hover">
            <div class="document-card-header">
              <el-icon :class="['document-icon', `type-${doc.docType}`]">
                <component :is="getDocumentIcon(doc.docType)" />
              </el-icon>
              <div class="document-card-title" @click="viewDocument(doc)">{{ doc.title }}</div>
              <div class="document-card-actions">
                <el-icon @click="toggleFavorite(doc)" :class="{ 'is-favorite': doc.isFavorite }">
                  <component :is="doc.isFavorite ? 'StarFilled' : 'Star'" />
                </el-icon>
                <el-dropdown trigger="click">
                  <el-icon><MoreFilled /></el-icon>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item @click="editDocument(doc)">编辑</el-dropdown-item>
                      <el-dropdown-item @click="shareDocument(doc)">分享</el-dropdown-item>
                      <el-dropdown-item @click="togglePrivate(doc)">
                        {{ doc.isPrivate ? '设为公开' : '设为私密' }}
                      </el-dropdown-item>
                      <el-dropdown-item @click="duplicateDocument(doc)">复制</el-dropdown-item>
                      <el-dropdown-item @click="downloadDocument(doc)">下载</el-dropdown-item>
                      <el-dropdown-item @click="moveToArchive(doc)" v-if="!doc.isArchived">归档</el-dropdown-item>
                      <el-dropdown-item @click="restoreFromArchive(doc)" v-if="doc.isArchived">还原</el-dropdown-item>
                      <el-dropdown-item divided @click="deleteDocument(doc)">删除</el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
            </div>
            <div class="document-card-content">
              <p class="document-card-desc">{{ doc.description || '暂无描述' }}</p>
              <div class="document-card-tags">
                <el-tag v-for="tag in doc.tags" :key="tag" size="small" class="mx-1">{{ tag }}</el-tag>
              </div>
              <div class="document-card-footer">
                <span class="document-card-category">{{ doc.category }}</span>
                <span class="document-card-time">{{ doc.updateTime }}</span>
              </div>
            </div>
          </el-card>
        </div>
  
        <!-- 分页 -->
        <div class="pagination-container">
          <el-pagination
            v-model:current-page="pagination.currentPage"
            v-model:page-size="pagination.pageSize"
            :page-sizes="[8, 16, 24, 36]"
            :total="pagination.total"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </el-card>
  
      <!-- 新建文档对话框 -->
      <el-dialog
        v-model="createDialogVisible"
        title="新建个人知识文档"
        width="600px"
      >
        <el-form :model="documentForm" :rules="documentRules" ref="documentFormRef" label-width="80px">
          <el-form-item label="标题" prop="title">
            <el-input v-model="documentForm.title" placeholder="请输入文档标题" />
          </el-form-item>
          <el-form-item label="分类" prop="category">
            <el-select v-model="documentForm.category" placeholder="请选择分类" style="width: 100%">
              <el-option v-for="item in categoryOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="私密设置" prop="isPrivate">
            <el-switch
              v-model="documentForm.isPrivate"
              active-text="私密"
              inactive-text="公开"
            />
          </el-form-item>
          <el-form-item label="描述" prop="description">
            <el-input 
              v-model="documentForm.description" 
              type="textarea" 
              :rows="3" 
              placeholder="请输入文档描述" 
            />
          </el-form-item>
          <el-form-item label="标签">
            <el-tag
              v-for="tag in documentForm.tags"
              :key="tag"
              class="mx-1"
              closable
              @close="handleRemoveTag(tag)"
            >
              {{ tag }}
            </el-tag>
            <el-input
              v-if="inputTagVisible"
              ref="InputTagRef"
              v-model="inputTagValue"
              class="tag-input"
              size="small"
              @keyup.enter="handleInputTagConfirm"
              @blur="handleInputTagConfirm"
            />
            <el-button v-else class="button-new-tag" size="small" @click="showInputTag">
              + 新标签
            </el-button>
          </el-form-item>
        </el-form>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="createDialogVisible = false">取消</el-button>
            <el-button type="primary" @click="submitDocument">确定</el-button>
          </span>
        </template>
      </el-dialog>
  
      <!-- 导入文档对话框 -->
      <el-dialog
        v-model="importDialogVisible"
        title="导入文档"
        width="500px"
      >
        <el-upload
          class="upload-container"
          drag
          action="https://run.mocky.io/v3/9d059bf9-4660-45f2-925d-ce80ad6c4d15"
          multiple
          :limit="5"
          :on-success="handleUploadSuccess"
          :on-error="handleUploadError"
          :before-upload="beforeUpload"
        >
          <el-icon class="el-icon--upload"><upload-filled /></el-icon>
          <div class="el-upload__text">
            将文件拖到此处，或<em>点击上传</em>
          </div>
          <template #tip>
            <div class="el-upload__tip">
              支持 .docx, .xlsx, .pptx, .pdf, .md 等多种格式，单个文件不超过10MB
            </div>
          </template>
        </el-upload>
        
        <div class="upload-options">
          <el-checkbox v-model="importOptions.autoCategory">自动分类</el-checkbox>
          <el-checkbox v-model="importOptions.autoTag">自动标签</el-checkbox>
          <el-checkbox v-model="importOptions.extractSummary">提取摘要</el-checkbox>
          <el-checkbox v-model="importOptions.isPrivate">设为私密</el-checkbox>
        </div>
      </el-dialog>
  
      <!-- 共享文档对话框 -->
      <el-dialog
        v-model="shareDialogVisible"
        title="共享文档"
        width="500px"
      >
        <el-form :model="shareForm" label-width="80px">
          <el-form-item label="共享给">
            <el-select
              v-model="shareForm.users"
              multiple
              filterable
              placeholder="请选择用户"
              style="width: 100%"
            >
              <el-option
                v-for="item in userOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="权限">
            <el-radio-group v-model="shareForm.permission">
              <el-radio :label="'read'">只读权限</el-radio>
              <el-radio :label="'edit'">编辑权限</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="链接">
            <div class="share-link">
              <el-input v-model="shareForm.link" readonly>
                <template #append>
                  <el-button @click="copyShareLink">复制</el-button>
                </template>
              </el-input>
            </div>
          </el-form-item>
          <el-form-item label="有效期">
            <el-select v-model="shareForm.expiration" placeholder="请选择">
              <el-option label="永久有效" value="never" />
              <el-option label="1天" value="1day" />
              <el-option label="7天" value="7days" />
              <el-option label="30天" value="30days" />
              <el-option label="自定义" value="custom" />
            </el-select>
            <el-date-picker
              v-if="shareForm.expiration === 'custom'"
              v-model="shareForm.expirationDate"
              type="datetime"
              placeholder="选择日期时间"
              style="margin-top: 10px; width: 100%;"
            />
          </el-form-item>
        </el-form>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="shareDialogVisible = false">取消</el-button>
            <el-button type="primary" @click="confirmShare">确定</el-button>
          </span>
        </template>
      </el-dialog>
    </div>
  </template>
  
  <script lang="ts" setup>
  import { ref, reactive, computed, onMounted, nextTick } from 'vue'
  import type { FormInstance, FormRules } from 'element-plus'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { useRouter, useRoute } from 'vue-router'
  import { 
    Document, Reading, Search, UserFilled, Plus, Upload, Download, List, Grid, Link, View, Star, StarFilled, MoreFilled,
    ArrowDown, UploadFilled, Notebook
  } from '@element-plus/icons-vue'
  import { useFavoritesStore } from '@/store/modules/favorites'
  
  // 定义筛选表单类型
  interface FilterForm {
    keyword: string;
    category: string;
    tags: string[];
    dateRange: any[];
  }
  
  // 定义文档表单类型
  interface DocumentForm {
    title: string;
    category: string;
    isPrivate: boolean;
    description: string;
    tags: string[];
  }
  
  // 路由对象
  const router = useRouter()
  const route = useRoute()
  
  // 多选表格引用
  const multipleSelection = ref<any[]>([])
  
  // 文档分类选项
  const categoryOptions = ref([
    { label: '工作笔记', value: 'work' },
    { label: '学习资料', value: 'study' },
    { label: '技术文档', value: 'tech' },
    { label: '项目文档', value: 'project' },
    { label: '个人随笔', value: 'notes' },
    { label: '其他', value: 'other' }
  ])
  
  // 标签选项
  const tagOptions = ref([
    { label: '重要', value: '重要' },
    { label: '紧急', value: '紧急' },
    { label: '创意', value: '创意' },
    { label: '进行中', value: '进行中' },
    { label: '已完成', value: '已完成' },
    { label: '参考', value: '参考' }
  ])
  
  // 用户选项
  const userOptions = ref([
    { label: '张三', value: 'zhangsan' },
    { label: '李四', value: 'lisi' },
    { label: '王五', value: 'wangwu' },
    { label: '赵六', value: 'zhaoliu' }
  ])
  
  // 筛选表单
  const filterForm = reactive<FilterForm>({
    keyword: '',
    category: '',
    tags: [],
    dateRange: []
  })
  
  // 加载状态
  const loading = ref(false)
  
  // 当前选中的标签页
  const activeTab = ref('all')
  
  // 视图模式：列表/网格
  const viewMode = ref('list')
  
  // 分页信息
  const pagination = reactive({
    currentPage: 1,
    pageSize: 8,
    total: 0
  })
  
  // 统计数据
  const statistics = reactive({
    totalDocuments: 18,
    totalViews: 237,
    totalCitations: 12,
    totalFavorites: 5
  })
  
  // 文档列表数据
  const documentList = ref([
    {
      id: 1,
      title: '个人知识管理系统设计',
      category: '技术文档',
      docType: 'doc',
      description: '个人知识管理系统的架构设计与实现方案，包括前后端技术选型、数据库设计等。',
      updateTime: '2024-04-09 14:30',
      visitCount: 56,
      isPrivate: false,
      isFavorite: true,
      isArchived: false,
      tags: ['技术', '设计', '重要']
    },
    {
      id: 2,
      title: 'Vue3学习笔记',
      category: '学习资料',
      docType: 'doc',
      description: 'Vue3的组合式API、生命周期、响应式系统等核心概念的学习笔记。',
      updateTime: '2024-04-08 11:20',
      visitCount: 32,
      isPrivate: false,
      isFavorite: false,
      isArchived: false,
      tags: ['Vue', '前端', '学习']
    },
    {
      id: 3,
      title: '周会演示PPT',
      category: '工作笔记',
      docType: 'ppt',
      description: '4月份第二周工作汇报与计划PPT',
      updateTime: '2024-04-07 16:45',
      visitCount: 28,
      isPrivate: true,
      isFavorite: false,
      isArchived: false,
      tags: ['工作', '汇报']
    },
    {
      id: 4,
      title: '项目进度表',
      category: '项目文档',
      docType: 'excel',
      description: '2024年Q2项目规划与进度跟踪表',
      updateTime: '2024-04-05 09:15',
      visitCount: 46,
      isPrivate: false,
      isFavorite: true,
      isArchived: false,
      tags: ['项目', '计划', '重要']
    },
    {
      id: 5,
      title: '读书笔记：深度思考',
      category: '个人随笔',
      docType: 'doc',
      description: '《深度思考》一书的读书笔记与个人感悟',
      updateTime: '2024-04-03 20:30',
      visitCount: 15,
      isPrivate: false,
      isFavorite: false,
      isArchived: false,
      tags: ['读书', '思考', '个人']
    },
    {
      id: 6,
      title: '调研报告：知识库管理系统',
      category: '工作笔记',
      docType: 'doc',
      description: '市场上主流知识库管理系统的功能对比与分析',
      updateTime: '2024-04-01 10:15',
      visitCount: 38,
      isPrivate: false,
      isFavorite: false,
      isArchived: false,
      tags: ['调研', '分析', '知识库']
    },
    {
      id: 7,
      title: '人工智能技术白皮书',
      category: '技术文档',
      docType: 'pdf',
      description: '人工智能技术发展趋势与应用场景分析',
      updateTime: '2024-03-25 14:20',
      visitCount: 22,
      isPrivate: false,
      isFavorite: false,
      isArchived: true,
      tags: ['AI', '技术', '参考']
    }
  ])
  
  // 新建文档表单
  const documentFormRef = ref<FormInstance>()
  const documentForm = reactive<DocumentForm>({
    title: '',
    category: '',
    isPrivate: false,
    description: '',
    tags: [] as string[]
  })
  
  // 表单验证规则
  const documentRules: FormRules = {
    title: [
      { required: true, message: '请输入文档标题', trigger: 'blur' },
      { min: 2, max: 100, message: '长度在 2 到 100 个字符', trigger: 'blur' }
    ],
    category: [
      { required: true, message: '请选择文档分类', trigger: 'change' }
    ]
  }
  
  // 导入选项
  const importOptions = reactive({
    autoCategory: true,
    autoTag: true,
    extractSummary: true,
    isPrivate: false
  })
  
  // 共享表单
  const shareForm = reactive({
    documentId: 0,
    documentTitle: '',
    users: [] as string[],
    permission: 'read',
    link: 'https://example.com/share/doc/123456789',
    expiration: 'never',
    expirationDate: null
  })
  
  // 对话框可见性
  const createDialogVisible = ref(false)
  const importDialogVisible = ref(false)
  const shareDialogVisible = ref(false)
  
  // 标签输入相关
  const InputTagRef = ref()
  const inputTagVisible = ref(false)
  const inputTagValue = ref('')
  
  // 生命周期钩子
  onMounted(() => {
    // 模拟数据加载
    fetchDocumentList()
  
    // 处理路由参数
    const { action, id } = route.query
    if (action === 'create') {
      handleCreateDocument()
    } else if (action === 'edit' && id) {
      const docId = parseInt(id as string)
      const doc = documentList.value.find(item => item.id === docId)
      if (doc) {
        editDocument(doc)
      }
    }
  })
  
  // 获取文档图标
  const getDocumentIcon = (type: string) => {
    switch (type) {
      case 'doc':
        return 'Document'
      case 'ppt':
        return 'PictureFilled'
      case 'excel':
        return 'Grid'
      case 'pdf':
        return 'Reading'
      default:
        return 'Document'
    }
  }
  
  // 处理多选变化
  const handleSelectionChange = (val: any[]) => {
    multipleSelection.value = val
  }
  
  // 处理搜索
  const handleSearch = () => {
    console.log('搜索条件：', filterForm)
    fetchDocumentList()
  }
  
  // 重置筛选条件
  const resetFilter = () => {
    filterForm.keyword = ''
    filterForm.category = ''
    filterForm.tags = []
    filterForm.dateRange = []
    fetchDocumentList()
  }
  
  // 处理标签页点击
  const handleTabClick = (tab: any) => {
    console.log('当前标签页：', tab.props.name)
    fetchDocumentList()
  }
  
  // 处理新建文档
  const handleCreateDocument = () => {
    // 重置表单
    documentForm.title = ''
    documentForm.category = ''
    documentForm.isPrivate = false
    documentForm.description = ''
    documentForm.tags = []
    
    createDialogVisible.value = true
  }
  
  // 处理导入文档
  const handleImportDocument = () => {
    importDialogVisible.value = true
  }
  
  // 文件上传相关
  const beforeUpload = (file: any) => {
    const isValidType = ['application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
                         'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                         'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                         'application/pdf',
                         'text/markdown'].includes(file.type)
    
    const isLt10M = file.size / 1024 / 1024 < 10
  
    if (!isValidType) {
      ElMessage.error('不支持的文件类型！')
      return false
    }
    
    if (!isLt10M) {
      ElMessage.error('文件大小不能超过 10MB!')
      return false
    }
    
    return true
  }
  
  const handleUploadSuccess = (response: any, file: any) => {
    ElMessage.success(`${file.name} 上传成功`)
    importDialogVisible.value = false
    // 刷新文档列表
    fetchDocumentList()
  }
  
  const handleUploadError = () => {
    ElMessage.error('上传失败，请重试')
  }
  
  // 提交文档
  const submitDocument = async () => {
    if (!documentFormRef.value) return
    
    await documentFormRef.value.validate((valid, fields) => {
      if (valid) {
        console.log('表单数据：', documentForm)
        // 模拟提交
        ElMessage.success('文档保存成功')
        createDialogVisible.value = false
        fetchDocumentList()
      }
    })
  }
  
  // 查看文档
  const viewDocument = (document: any) => {
    router.push(`/knowledge/browse?id=${document.id}`)
  }
  
  // 编辑文档
  const editDocument = (document: any) => {
    console.log('编辑文档：', document)
    // 实际应用中这里应该跳转到编辑页面或打开编辑对话框
    ElMessage.info(`正在编辑：${document.title}`)
  }
  
  // 复制文档
  const duplicateDocument = (document: any) => {
    ElMessage.success(`已复制文档：${document.title}`)
    fetchDocumentList()
  }
  
  // 切换私密/公开状态
  const togglePrivate = (document: any) => {
    document.isPrivate = !document.isPrivate
    ElMessage.success(document.isPrivate ? '文档已设为私密' : '文档已设为公开')
  }
  
  // 共享文档
  const shareDocument = (document: any) => {
    shareForm.documentId = document.id
    shareForm.documentTitle = document.title
    shareForm.users = []
    shareForm.permission = 'read'
    shareForm.link = `https://example.com/share/doc/${document.id}`
    shareForm.expiration = 'never'
    shareForm.expirationDate = null
    shareDialogVisible.value = true
  }
  
  // 确认共享
  const confirmShare = () => {
    console.log('共享设置：', shareForm)
    ElMessage.success('文档共享成功')
    shareDialogVisible.value = false
  }
  
  // 复制共享链接
  const copyShareLink = () => {
    navigator.clipboard.writeText(shareForm.link)
      .then(() => ElMessage.success('链接已复制到剪贴板'))
      .catch(err => ElMessage.error('复制失败：' + err))
  }
  
  // 切换收藏状态
  const toggleFavorite = (document: any) => {
    document.isFavorite = !document.isFavorite
    
    if (document.isFavorite) {
      // 添加到收藏
      const favoriteItem = {
        id: document.id,
        title: document.title,
        abstract: document.description || '暂无描述',
        content: document.content || '',
        category: document.category,
        author: document.author || '我',
        source: 'personal' as const,
        sourceUrl: `/personal?id=${document.id}`,
        tags: document.tags,
        favoriteTime: new Date().toLocaleString()
      }
      
      // 使用store添加收藏
      favoritesStore.addFavorite(favoriteItem)
      ElMessage.success('文档已收藏')
    } else {
      // 从收藏中移除
      favoritesStore.removeFavorite(document.id, 'personal')
      ElMessage.success('已取消收藏')
    }
  }
  
  // 移动到归档
  const moveToArchive = (document: any) => {
    document.isArchived = true
    ElMessage.success(`文档"${document.title}"已归档`)
    if (activeTab.value !== 'archived') {
      fetchDocumentList()
    }
  }
  
  // 从归档还原
  const restoreFromArchive = (document: any) => {
    document.isArchived = false
    ElMessage.success(`文档"${document.title}"已还原`)
    if (activeTab.value === 'archived') {
      fetchDocumentList()
    }
  }
  
  // 下载文档
  const downloadDocument = (document: any) => {
    ElMessage.success(`开始下载文档：${document.title}`)
  }
  
  // 删除文档
  const deleteDocument = (document: any) => {
    ElMessageBox.confirm(
      `确定要删除文档 "${document.title}" 吗？删除后将无法恢复。`,
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
      .then(() => {
        console.log('删除文档：', document)
        ElMessage.success('文档删除成功')
        fetchDocumentList()
      })
      .catch(() => {
        // 取消删除
      })
  }
  
  // 处理新标签
  const showInputTag = () => {
    inputTagVisible.value = true
    nextTick(() => {
      InputTagRef.value?.input?.focus()
    })
  }
  
  const handleInputTagConfirm = () => {
    if (inputTagValue.value) {
      if (!documentForm.tags.includes(inputTagValue.value)) {
        documentForm.tags.push(inputTagValue.value)
      }
    }
    inputTagVisible.value = false
    inputTagValue.value = ''
  }
  
  const handleRemoveTag = (tag: string) => {
    documentForm.tags = documentForm.tags.filter(item => item !== tag)
  }
  
  // 分页操作
  const handleSizeChange = (val: number) => {
    pagination.pageSize = val
    fetchDocumentList()
  }
  
  const handleCurrentChange = (val: number) => {
    pagination.currentPage = val
    fetchDocumentList()
  }
  
  // 获取文档列表数据
  const fetchDocumentList = () => {
    loading.value = true
    
    // 模拟异步请求
    setTimeout(() => {
      // 实际应用中这里应该发起API请求
      // 根据activeTab过滤数据
      let filteredData = [...documentList.value]
      
      switch (activeTab.value) {
        case 'recent':
          // 按更新时间排序
          filteredData.sort((a, b) => new Date(b.updateTime).getTime() - new Date(a.updateTime).getTime())
          break
        case 'favorite':
          // 只显示收藏的文档
          filteredData = filteredData.filter(doc => doc.isFavorite)
          break
        case 'archived':
          // 只显示归档的文档
          filteredData = filteredData.filter(doc => doc.isArchived)
          break
        default:
          // 不显示归档的文档
          if (activeTab.value === 'all') {
            filteredData = filteredData.filter(doc => !doc.isArchived)
          }
      }
      
      // 应用关键词筛选
      if (filterForm.keyword) {
        const keyword = filterForm.keyword.toLowerCase()
        filteredData = filteredData.filter(doc => 
          doc.title.toLowerCase().includes(keyword) || 
          (doc.description && doc.description.toLowerCase().includes(keyword))
        )
      }
      
      // 应用分类筛选
      if (filterForm.category) {
        filteredData = filteredData.filter(doc => doc.category === 
          categoryOptions.value.find(item => item.value === filterForm.category)?.label
        )
      }
      
      // 应用标签筛选
      if (filterForm.tags && filterForm.tags.length > 0) {
        filteredData = filteredData.filter(doc => 
          filterForm.tags.some(tag => doc.tags.includes(tag))
        )
      }
      
      // 更新总数
      pagination.total = filteredData.length
      
      // 分页
      const start = (pagination.currentPage - 1) * pagination.pageSize
      const end = start + pagination.pageSize
      documentList.value = filteredData.slice(start, end)
      
      loading.value = false
    }, 500)
  }
  
  const favoritesStore = useFavoritesStore()
  </script>
  
  <style scoped>
  .personal-knowledge {
    padding: 20px;
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
  }
  
  .header-actions {
    display: flex;
    gap: 10px;
  }
  
  .filter-container {
    margin-bottom: 20px;
  }
  
  .filter-form {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    align-items: center;
  }
  
  /* 统计卡片样式 */
  .stats-cards {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
    margin-bottom: 20px;
  }
  
  .stats-card {
    height: 100%;
  }
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .stats-value {
    font-size: 28px;
    font-weight: bold;
    text-align: center;
    color: #409EFF;
    padding: 10px 0;
  }
  
  .document-list {
    margin-bottom: 20px;
    position: relative;
  }
  
  .view-toggle {
    position: absolute;
    top: 15px;
    right: 20px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .pagination-container {
    display: flex;
    justify-content: flex-end;
    margin-top: 20px;
  }
  
  .document-title {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  
  .document-icon {
    font-size: 16px;
  }
  
  .document-icon.type-doc {
    color: #409EFF;
  }
  
  .document-icon.type-ppt {
    color: #E6A23C;
  }
  
  .document-icon.type-excel {
    color: #67C23A;
  }
  
  .document-icon.type-pdf {
    color: #F56C6C;
  }
  
  /* 网格视图样式 */
  .grid-view {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 16px;
    margin-top: 20px;
  }
  
  .document-card {
    height: 100%;
    display: flex;
    flex-direction: column;
  }
  
  .document-card-header {
    display: flex;
    align-items: center;
    padding-bottom: 10px;
    border-bottom: 1px solid #f0f0f0;
  }
  
  .document-card-title {
    flex: 1;
    margin: 0 10px;
    font-weight: bold;
    cursor: pointer;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .document-card-title:hover {
    color: #409EFF;
  }
  
  .document-card-actions {
    display: flex;
    gap: 10px;
  }
  
  .document-card-actions .el-icon {
    cursor: pointer;
    font-size: 16px;
    color: #909399;
  }
  
  .document-card-actions .el-icon:hover {
    color: #409EFF;
  }
  
  .document-card-actions .is-favorite {
    color: #E6A23C;
  }
  
  .document-card-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 10px 0;
  }
  
  .document-card-desc {
    flex: 1;
    margin: 0 0 10px;
    font-size: 14px;
    color: #606266;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }
  
  .document-card-tags {
    margin-bottom: 10px;
  }
  
  .document-card-footer {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    color: #909399;
  }
  
  .tag-input {
    width: 84px;
    margin-left: 8px;
    vertical-align: bottom;
  }
  
  .button-new-tag {
    margin-left: 8px;
  }
  
  .share-link {
    display: flex;
    align-items: center;
  }
  
  .upload-container {
    width: 100%;
  }
  
  .upload-options {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    margin-top: 16px;
  }
  
  .mx-1 {
    margin: 0 4px 4px 0;
  }
  </style>