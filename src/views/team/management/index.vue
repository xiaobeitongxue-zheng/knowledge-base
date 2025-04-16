<template>
  <div class="team-management">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span class="title">团队成员管理</span>
          <el-button type="primary" @click="handleAddMemberClick">添加成员</el-button>
        </div>
      </template>
      
      <el-table :data="teamMembers" style="width: 100%" border stripe>
        <el-table-column prop="name" label="成员名称" min-width="120" />
        <el-table-column prop="role" label="角色" min-width="120">
          <template #default="{ row }">
            <el-tag :type="getRoleType(row.role)">{{ getRoleLabel(row.role) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="email" label="邮箱" min-width="180" />
        <el-table-column prop="joinTime" label="加入时间" min-width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row, $index }">
            <el-button size="small" type="primary" @click="handleEditMember($index, row)">编辑</el-button>
            <el-popconfirm
              title="确定删除该成员吗?"
              @confirm="handleDeleteMember($index, row)"
            >
              <template #reference>
                <el-button size="small" type="danger">删除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
      
      <el-pagination
        v-if="teamMembers.length > 10"
        class="pagination"
        layout="prev, pager, next, total"
        :total="teamMembers.length"
        :page-size="10"
        @current-change="handlePageChange"
      />
    </el-card>
    
    <!-- 成员管理对话框 -->
    <el-dialog
      v-model="memberDialogVisible"
      :title="memberFormMode === 'add' ? '添加团队成员' : '编辑团队成员'"
      width="500px"
      destroy-on-close
    >
      <el-form
        ref="memberFormRef"
        :model="memberForm"
        :rules="memberRules"
        label-width="100px"
        label-position="right"
      >
        <el-form-item label="成员名称" prop="name">
          <el-input v-model="memberForm.name" placeholder="请输入成员名称" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="memberForm.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="memberForm.role" placeholder="请选择角色" style="width: 100%">
            <el-option label="管理员" value="admin" />
            <el-option label="编辑者" value="editor" />
            <el-option label="查看者" value="viewer" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="memberDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitMemberForm">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, FormInstance, FormRules } from 'element-plus'
import { formatDate } from '@/utils/index' // 假设有一个日期格式化工具函数
import { useRouter } from 'vue-router'

// 类型定义
interface TeamMember {
  id?: string | number
  name: string
  email: string
  role: 'admin' | 'editor' | 'viewer'
  joinTime: string
}

// 路由
const router = useRouter()

// 通用状态
const currentPage = ref(1)

// 团队成员相关
const memberFormRef = ref<FormInstance>()
const memberDialogVisible = ref(false)
const memberFormMode = ref<'add' | 'edit'>('add')
const currentEditIndex = ref(-1)
const memberForm = reactive<Omit<TeamMember, 'joinTime'>>({
  name: '',
  email: '',
  role: 'viewer'
})

const memberRules = reactive<FormRules>({
  name: [
    { required: true, message: '请输入成员名称', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  role: [
    { required: true, message: '请选择角色', trigger: 'change' }
  ]
})

const teamMembers = ref<TeamMember[]>([
  { id: 1, name: '张三', email: 'zhangsan@example.com', role: 'admin', joinTime: '2024-12-10 14:30:00' },
  { id: 2, name: '李四', email: 'lisi@example.com', role: 'editor', joinTime: '2024-12-15 09:45:00' },
  { id: 3, name: '王五', email: 'wangwu@example.com', role: 'viewer', joinTime: '2024-12-20 16:20:00' }
])

// 工具函数
const getRoleType = (role: string) => {
  const typeMap: Record<string, string> = {
    'admin': 'danger',
    'editor': 'warning',
    'viewer': 'info'
  }
  return typeMap[role] || 'info'
}

const getRoleLabel = (role: string) => {
  const labelMap: Record<string, string> = {
    'admin': '管理员',
    'editor': '编辑者',
    'viewer': '查看者'
  }
  return labelMap[role] || '未知角色'
}

// 成员相关方法
const handlePageChange = (page: number) => {
  currentPage.value = page
}

const resetMemberForm = () => {
  if (memberFormRef.value) {
    memberFormRef.value.resetFields()
  }
  memberForm.name = ''
  memberForm.email = ''
  memberForm.role = 'viewer'
}

const handleAddMemberClick = () => {
  memberFormMode.value = 'add'
  resetMemberForm()
  memberDialogVisible.value = true
}

const handleEditMember = (index: number, row: TeamMember) => {
  memberFormMode.value = 'edit'
  currentEditIndex.value = index
  memberForm.name = row.name
  memberForm.email = row.email
  memberForm.role = row.role
  memberDialogVisible.value = true
}

const handleDeleteMember = (index: number, row: TeamMember) => {
  teamMembers.value.splice(index, 1)
  ElMessage.success('成员删除成功')
}

const submitMemberForm = async () => {
  if (!memberFormRef.value) return
  
  await memberFormRef.value.validate((valid, fields) => {
    if (valid) {
      if (memberFormMode.value === 'add') {
        // 添加新成员
        const newMember: TeamMember = {
          id: Date.now(),
          name: memberForm.name,
          email: memberForm.email,
          role: memberForm.role,
          joinTime: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss')
        }
        teamMembers.value.unshift(newMember)
        ElMessage.success('成员添加成功')
      } else {
        // 编辑成员
        if (currentEditIndex.value >= 0) {
          teamMembers.value[currentEditIndex.value].name = memberForm.name
          teamMembers.value[currentEditIndex.value].email = memberForm.email
          teamMembers.value[currentEditIndex.value].role = memberForm.role
          ElMessage.success('成员信息更新成功')
        }
      }
      memberDialogVisible.value = false
    } else {
      console.log('表单验证失败:', fields)
    }
  })
}

// 初始化
onMounted(() => {
  // 可以在这里加载数据，例如从API获取团队成员列表
  // fetchTeamMembers()
})
</script>

<style scoped>
.team-management {
  padding: 20px;
}

.box-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title {
  font-size: 18px;
  font-weight: bold;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
}

:deep(.el-table) {
  margin-top: 15px;
}

:deep(.el-tag) {
  margin-right: 5px;
}
</style>