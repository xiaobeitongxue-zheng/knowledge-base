<template>
  <div class="knowledge-management">
    <div class="page-header">
      <h2>知识管理</h2>
      <div class="header-actions">
        <el-button type="primary" @click="handleCreateDocument">
          <el-icon><Plus /></el-icon>新建文档
        </el-button>
        <el-button @click="handleBatchOperation">
          <el-icon><Operation /></el-icon>批量操作
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
          <el-select v-model="filterForm.category" placeholder="请选择分类" clearable>
            <el-option v-for="item in categoryOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="filterForm.status" placeholder="请选择状态" clearable>
            <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
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

    <!-- 文档列表 -->
    <el-card class="document-list">
      <el-tabs v-model="activeTab" @tab-click="handleTabClick">
        <el-tab-pane label="全部文档" name="all"></el-tab-pane>
        <el-tab-pane label="我创建的" name="created"></el-tab-pane>
        <el-tab-pane label="共享给我的" name="shared"></el-tab-pane>
        <el-tab-pane label="已收藏的" name="favorite"></el-tab-pane>
      </el-tabs>

      <el-table
        ref="multipleTableRef"
        :data="documentList"
        style="width: 100%"
        @selection-change="handleSelectionChange"
        v-loading="loading"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="title" label="标题" min-width="280">
          <template #default="{ row }">
            <div class="document-title">
              <el-icon :class="['document-icon', `type-${row.docType}`]">
                <component :is="getDocumentIcon(row.docType)" />
              </el-icon>
              <el-link @click="viewDocument(row)">{{ row.title }}</el-link>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="category" label="分类" width="120" />
        <el-table-column prop="author" label="创建人" width="120" />
        <el-table-column prop="updateTime" label="更新时间" width="180" sortable />
        <el-table-column prop="visitCount" label="阅读量" width="100" sortable />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ getStatusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button-group>
              <el-button link type="primary" @click="viewDocument(row)">查看</el-button>
              <el-button link type="primary" @click="editDocument(row)">编辑</el-button>
              <el-button link type="primary" @click="generateSummary(row)">生成摘要</el-button>
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
                    <el-dropdown-item @click="downloadDocument(row)">下载</el-dropdown-item>
                    <el-dropdown-item divided @click="deleteDocument(row)">删除</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
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
      title="新建知识文档"
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
        <el-form-item label="状态" prop="status">
          <el-select v-model="documentForm.status" placeholder="请选择状态" style="width: 100%">
            <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
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

// 定义筛选表单类型
interface FilterForm {
  keyword: string;
  category: string;
  status: string;
  dateRange: any[];
}

// 定义文档表单类型
interface DocumentForm {
  title: string;
  category: string;
  status: string;
  description: string;
  tags: string[];
}

// 路由对象
const router = useRouter()
const route = useRoute()

// 多选表格引用
const multipleTableRef = ref()
const multipleSelection = ref<any[]>([])

// 文档分类选项
const categoryOptions = ref([
  { label: '技术文档', value: 'tech' },
  { label: '产品文档', value: 'product' },
  { label: '业务文档', value: 'business' },
  { label: '管理文档', value: 'management' },
  { label: '其他文档', value: 'other' }
])

// 文档状态选项
const statusOptions = ref([
  { label: '已发布', value: 'published' },
  { label: '草稿', value: 'draft' },
  { label: '待审核', value: 'pending' },
  { label: '已归档', value: 'archived' }
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
  status: '',
  dateRange: []
})

// 加载状态
const loading = ref(false)

// 当前选中的标签页
const activeTab = ref('all')

// 分页信息
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 文档列表数据
const documentList = ref([
  {
    id: 1,
    title: '产品需求说明书',
    category: '产品文档',
    docType: 'doc',
    author: '李四',
    createTime: '2024-04-01 10:30',
    updateTime: '2024-04-09 14:30',
    visitCount: 128,
    status: 'published',
    isFavorite: true
  },
  {
    id: 2,
    title: '技术架构设计',
    category: '技术文档',
    docType: 'doc',
    author: '张三',
    createTime: '2024-04-02 09:15',
    updateTime: '2024-04-09 11:20',
    visitCount: 96,
    status: 'published',
    isFavorite: false
  },
  {
    id: 3,
    title: '项目计划书',
    category: '管理文档',
    docType: 'ppt',
    author: '王五',
    createTime: '2024-04-05 15:40',
    updateTime: '2024-04-08 16:45',
    visitCount: 56,
    status: 'published',
    isFavorite: false
  },
  {
    id: 4,
    title: '月度总结报告',
    category: '管理文档',
    docType: 'excel',
    author: '赵六',
    createTime: '2024-04-07 11:20',
    updateTime: '2024-04-08 09:15',
    visitCount: 42,
    status: 'published',
    isFavorite: true
  },
  {
    id: 5,
    title: '产品设计草稿',
    category: '产品文档',
    docType: 'doc',
    author: '李四',
    createTime: '2024-04-08 16:30',
    updateTime: '2024-04-08 16:30',
    visitCount: 8,
    status: 'draft',
    isFavorite: false
  }
])

// 新建文档表单
const documentFormRef = ref<FormInstance>()
const documentForm = reactive<DocumentForm>({
  title: '',
  category: '',
  status: 'draft',
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
  ],
  status: [
    { required: true, message: '请选择文档状态', trigger: 'change' }
  ]
}

// 共享表单
const shareForm = reactive({
  documentId: 0,
  documentTitle: '',
  users: [] as string[],
  permission: 'read',
  link: 'https://example.com/share/doc/123456789'
})

// 对话框可见性
const createDialogVisible = ref(false)
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
    default:
      return 'Document'
  }
}

// 获取状态标签类型
const getStatusType = (status: string) => {
  switch (status) {
    case 'published':
      return 'success'
    case 'draft':
      return 'info'
    case 'pending':
      return 'warning'
    case 'archived':
      return 'danger'
    default:
      return 'info'
  }
}

// 获取状态文本
const getStatusText = (status: string) => {
  switch (status) {
    case 'published':
      return '已发布'
    case 'draft':
      return '草稿'
    case 'pending':
      return '待审核'
    case 'archived':
      return '已归档'
    default:
      return '未知'
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
  Object.keys(filterForm).forEach(key => {
    const typedKey = key as keyof FilterForm;
    if (typedKey === 'dateRange') {
      filterForm.dateRange = [];
    } else {
      (filterForm[typedKey] as string) = '';
    }
  });
  fetchDocumentList();
}

// 处理标签页点击
const handleTabClick = (tab: any) => {
  console.log('当前标签页：', tab.props.name)
  fetchDocumentList()
}

// 处理新建文档
const handleCreateDocument = () => {
  // 重置表单
  Object.keys(documentForm).forEach(key => {
    const typedKey = key as keyof DocumentForm;
    if (typedKey === 'tags') {
      documentForm.tags = [];
    } else if (typedKey === 'status') {
      documentForm.status = 'draft';
    } else {
      (documentForm[typedKey] as string) = '';
    }
  });
  createDialogVisible.value = true;
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

// 生成摘要
const generateSummary = (document: any) => {
  console.log('生成摘要：', document)
  router.push(`/summary?id=${document.id}`)
}

// 共享文档
const shareDocument = (document: any) => {
  shareForm.documentId = document.id
  shareForm.documentTitle = document.title
  shareForm.users = []
  shareForm.permission = 'read'
  shareForm.link = `https://example.com/share/doc/${document.id}`
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
  ElMessage.success(document.isFavorite ? '文档已收藏' : '已取消收藏')
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

// 批量操作
const handleBatchOperation = () => {
  if (multipleSelection.value.length === 0) {
    ElMessage.warning('请先选择文档')
    return
  }
  
  ElMessageBox.confirm(
    `您已选择 ${multipleSelection.value.length} 个文档，确定要进行批量操作吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'info'
    }
  )
    .then(() => {
      // 这里可以打开批量操作的对话框
      ElMessage.success(`已选择 ${multipleSelection.value.length} 个文档`)
    })
    .catch(() => {
      // 取消操作
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
    // 这里仅模拟数据，实际情况下应该根据条件从后端获取筛选后的数据
    pagination.total = 35
    
    loading.value = false
  }, 500)
}
</script>

<style scoped>
.knowledge-management {
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

.document-list {
  margin-bottom: 20px;
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

.mx-1 {
  margin: 0 4px 4px 0;
}
</style> 