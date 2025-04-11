<template>
  <div class="storage-container">
    <div class="page-header">
      <h2>文件存储</h2>
    </div>

    <el-card class="main-card">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="我的文件" name="myFiles">
          <div class="operation-bar">
            <el-button type="primary" @click="uploadFile">
              <el-icon><Upload /></el-icon> 上传文件
            </el-button>
            <el-button @click="createFolder">
              <el-icon><FolderAdd /></el-icon> 新建文件夹
            </el-button>
            <div class="search-box">
              <el-input
                v-model="searchKeyword"
                placeholder="搜索文件"
                clearable
                @keyup.enter="handleSearch"
              >
                <template #prefix>
                  <el-icon><Search /></el-icon>
                </template>
              </el-input>
            </div>
          </div>

          <div class="breadcrumb">
            <el-breadcrumb separator="/">
              <el-breadcrumb-item :to="{ path: '/storage' }">全部文件</el-breadcrumb-item>
              <el-breadcrumb-item v-for="(item, index) in currentPath" :key="index">
                {{ item }}
              </el-breadcrumb-item>
            </el-breadcrumb>
          </div>

          <el-table :data="fileList" style="width: 100%" @row-click="handleRowClick">
            <el-table-column width="50">
              <template #default="scope">
                <el-icon v-if="scope.row.type === 'folder'"><Folder /></el-icon>
                <el-icon v-else-if="scope.row.type === 'image'"><Picture /></el-icon>
                <el-icon v-else-if="scope.row.type === 'pdf'"><Document /></el-icon>
                <el-icon v-else-if="scope.row.type === 'excel'"><Grid /></el-icon>
                <el-icon v-else><Document /></el-icon>
              </template>
            </el-table-column>
            <el-table-column prop="name" label="文件名" min-width="250" />
            <el-table-column prop="size" label="大小" width="120" />
            <el-table-column prop="updateTime" label="修改日期" width="180" />
            <el-table-column label="操作" width="180">
              <template #default="scope">
                <el-button link type="primary" v-if="scope.row.type !== 'folder'" @click.stop="downloadFile(scope.row)">下载</el-button>
                <el-button link type="primary" @click.stop="previewFile(scope.row)">预览</el-button>
                <el-button link type="danger" @click.stop="deleteFile(scope.row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        
        <el-tab-pane label="共享文件" name="sharedFiles">
          <div class="empty-placeholder">
            <el-empty description="暂无共享文件" />
          </div>
        </el-tab-pane>
        
        <el-tab-pane label="回收站" name="recycleBin">
          <div class="empty-placeholder">
            <el-empty description="回收站为空" />
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 上传文件对话框 -->
    <el-dialog v-model="uploadDialogVisible" title="上传文件" width="500px">
      <el-upload
        action="#"
        :auto-upload="false"
        :on-change="handleFileChange"
        :on-remove="handleFileRemove"
        :file-list="uploadFileList"
        multiple
        drag
      >
        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
        <div class="el-upload__text">
          将文件拖到此处，或<em>点击上传</em>
        </div>
        <template #tip>
          <div class="el-upload__tip">
            最大支持 50MB 的文件
          </div>
        </template>
      </el-upload>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="uploadDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmUpload" :loading="uploading">
            上传
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 新建文件夹对话框 -->
    <el-dialog v-model="folderDialogVisible" title="新建文件夹" width="400px">
      <el-form :model="folderForm">
        <el-form-item label="文件夹名称">
          <el-input v-model="folderForm.name" placeholder="请输入文件夹名称" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="folderDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmCreateFolder">
            创建
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 文件预览对话框 -->
    <el-dialog v-model="previewDialogVisible" :title="currentPreviewFile?.name" width="70%">
      <div class="preview-container">
        <div v-if="currentPreviewFile?.type === 'image'" class="image-preview">
          <img :src="currentPreviewFile?.url" :alt="currentPreviewFile?.name" />
        </div>
        <div v-else class="text-preview">
          暂不支持该类型文件的预览
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Upload, FolderAdd, Search, Folder, Picture, 
  Document, Grid, Download, UploadFilled
} from '@element-plus/icons-vue'

// 定义文件类型接口
interface FileItem {
  id: number;
  name: string;
  type: string;
  size: string;
  updateTime: string;
  url?: string;
}

// 定义上传文件类型接口
interface UploadFile {
  name: string;
  size: number;
  percentage?: number;
  status?: string;
  uid: string | number;
  url?: string;
  raw?: File;
}

// 标签页
const activeTab = ref('myFiles')

// 搜索
const searchKeyword = ref('')

// 当前路径
const currentPath = ref<string[]>([])

// 文件列表
const fileList = ref<FileItem[]>([
  {
    id: 1,
    name: '文档资料',
    type: 'folder',
    size: '-',
    updateTime: '2024-04-09 15:30'
  },
  {
    id: 2,
    name: '产品设计',
    type: 'folder',
    size: '-',
    updateTime: '2024-04-08 16:45'
  },
  {
    id: 3,
    name: '需求说明书.pdf',
    type: 'pdf',
    size: '2.5MB',
    updateTime: '2024-04-08 14:20',
    url: '#'
  },
  {
    id: 4,
    name: '项目计划表.xlsx',
    type: 'excel',
    size: '1.8MB',
    updateTime: '2024-04-07 11:30',
    url: '#'
  },
  {
    id: 5,
    name: '系统架构图.png',
    type: 'image',
    size: '3.2MB',
    updateTime: '2024-04-06 09:45',
    url: 'https://placeholder.pics/svg/800x600'
  }
])

// 上传文件对话框
const uploadDialogVisible = ref(false)
const uploadFileList = ref<UploadFile[]>([])
const uploading = ref(false)

// 新建文件夹对话框
const folderDialogVisible = ref(false)
const folderForm = reactive({
  name: ''
})

// 文件预览对话框
const previewDialogVisible = ref(false)
const currentPreviewFile = ref<FileItem | null>(null)

// 搜索文件
const handleSearch = () => {
  // 实际项目中这里应该调用API搜索文件
  console.log('搜索关键词:', searchKeyword.value)
}

// 行点击
const handleRowClick = (row: FileItem) => {
  if (row.type === 'folder') {
    // 进入文件夹
    currentPath.value.push(row.name)
    // 实际项目中这里应该调用API加载文件夹内容
    console.log('进入文件夹:', row.name)
  } else {
    // 预览文件
    currentPreviewFile.value = row
    previewDialogVisible.value = true
  }
}

// 上传文件
const uploadFile = () => {
  uploadDialogVisible.value = true
  uploadFileList.value = []
}

// 文件选择变化
const handleFileChange = (file: UploadFile) => {
  console.log('选择文件:', file)
}

// 移除文件
const handleFileRemove = (file: UploadFile) => {
  console.log('移除文件:', file)
}

// 确认上传
const confirmUpload = () => {
  if (uploadFileList.value.length === 0) {
    ElMessage.warning('请选择要上传的文件')
    return
  }

  uploading.value = true

  // 模拟上传过程
  setTimeout(() => {
    uploading.value = false
    uploadDialogVisible.value = false
    ElMessage.success('文件上传成功')
    
    // 刷新文件列表
    // 实际项目中这里应该调用API获取最新的文件列表
  }, 1500)
}

// 新建文件夹
const createFolder = () => {
  folderDialogVisible.value = true
  folderForm.name = ''
}

// 确认创建文件夹
const confirmCreateFolder = () => {
  if (!folderForm.name.trim()) {
    ElMessage.warning('请输入文件夹名称')
    return
  }

  // 实际项目中这里应该调用API创建文件夹
  console.log('创建文件夹:', folderForm.name)
  
  // 添加到文件列表
  fileList.value.unshift({
    id: Date.now(),
    name: folderForm.name,
    type: 'folder',
    size: '-',
    updateTime: new Date().toLocaleString()
  })
  
  folderDialogVisible.value = false
  ElMessage.success('文件夹创建成功')
}

// 下载文件
const downloadFile = (file: FileItem) => {
  // 实际项目中这里应该调用API下载文件
  console.log('下载文件:', file.name)
  ElMessage.success(`${file.name} 开始下载`)
}

// 预览文件
const previewFile = (file: FileItem) => {
  currentPreviewFile.value = file
  previewDialogVisible.value = true
}

// 删除文件
const deleteFile = (file: FileItem) => {
  ElMessageBox.confirm(
    `确定要删除 ${file.name} 吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // 实际项目中这里应该调用API删除文件
    fileList.value = fileList.value.filter(item => item.id !== file.id)
    ElMessage.success('删除成功')
  }).catch(() => {
    // 取消删除
  })
}
</script>

<style scoped>
.storage-container {
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

.operation-bar {
  display: flex;
  margin-bottom: 20px;
}

.search-box {
  margin-left: auto;
  width: 250px;
}

.breadcrumb {
  margin-bottom: 15px;
}

.empty-placeholder {
  padding: 40px 0;
}

.preview-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
}

.image-preview img {
  max-width: 100%;
  max-height: 500px;
}

.text-preview {
  padding: 20px;
  text-align: center;
  color: #909399;
}
</style>