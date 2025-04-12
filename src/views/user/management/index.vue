<template>
  <div class="user-management">
    <div class="page-header">
      <div class="page-title">
        <h2>用户管理</h2>
        <span class="subtitle">共有 {{ total }} 名用户</span>
      </div>
      <div class="page-actions">
        <el-button type="success" @click="exportUserData" class="action-btn">
          <el-icon><Download /></el-icon>导出数据
        </el-button>
        <el-button type="primary" @click="handleAdd" class="action-btn">
          <el-icon><Plus /></el-icon>新增用户
        </el-button>
      </div>
    </div>

    <!-- 搜索区域 -->
    <el-card class="search-card" shadow="hover">
      <template #header>
        <div class="search-header">
          <span><el-icon><Search /></el-icon> 搜索筛选</span>
          <el-button type="info" text @click="showAdvancedSearch = !showAdvancedSearch">
            {{ showAdvancedSearch ? '收起' : '高级搜索' }}
            <el-icon><ArrowDown v-if="!showAdvancedSearch" /><ArrowUp v-else /></el-icon>
          </el-button>
        </div>
      </template>
      
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="用户名">
              <el-input 
                v-model="searchForm.username" 
                placeholder="请输入用户名" 
                clearable
                prefix-icon="User" 
              />
            </el-form-item>
          </el-col>
          
          <el-col :span="6">
            <el-form-item label="角色">
              <el-select 
                v-model="searchForm.role" 
                placeholder="请选择角色" 
                clearable
                style="width: 100%"
              >
                <el-option label="管理员" value="admin" />
                <el-option label="普通用户" value="user" />
              </el-select>
            </el-form-item>
          </el-col>
          
          <el-col :span="6">
            <el-form-item label="状态">
              <el-select 
                v-model="searchForm.status" 
                placeholder="请选择状态" 
                clearable
                style="width: 100%"
              >
                <el-option label="启用" value="active" />
                <el-option label="禁用" value="inactive" />
              </el-select>
            </el-form-item>
          </el-col>
          
          <el-col :span="6">
            <div class="search-buttons">
              <el-button type="primary" @click="handleSearch">
                <el-icon><Search /></el-icon>搜索
              </el-button>
              <el-button @click="resetForm">
                <el-icon><Refresh /></el-icon>重置
              </el-button>
            </div>
          </el-col>
        </el-row>
        
        <!-- 高级搜索选项 -->
        <el-row v-if="showAdvancedSearch" :gutter="20" class="advanced-search">
          <el-col :span="6">
            <el-form-item label="部门">
              <el-select 
                v-model="searchForm.department" 
                placeholder="请选择部门" 
                clearable
                style="width: 100%"
              >
                <el-option label="技术部" value="技术部" />
                <el-option label="市场部" value="市场部" />
                <el-option label="研发部" value="研发部" />
                <el-option label="财务部" value="财务部" />
                <el-option label="人力资源部" value="人力资源部" />
              </el-select>
            </el-form-item>
          </el-col>
          
          <el-col :span="6">
            <el-form-item label="邮箱">
              <el-input 
                v-model="searchForm.email" 
                placeholder="请输入邮箱" 
                clearable
              />
            </el-form-item>
          </el-col>
          
          <el-col :span="12">
            <el-form-item label="创建时间">
              <el-date-picker
                v-model="searchForm.dateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-card>

    <!-- 表格区域 -->
    <el-card class="table-card" shadow="hover">
      <template #header>
        <div class="table-header">
          <div class="table-title">
            <el-icon><List /></el-icon>
            <span>用户列表</span>
          </div>
          <div class="table-actions">
            <el-switch
              v-model="showDeletedUsers"
              active-text="显示已删除"
              inactive-text="隐藏已删除"
              @change="toggleDeletedUsers"
            />
            <el-dropdown @command="handleTableCommand">
              <el-button type="primary" text>
                表格设置<el-icon><Setting /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="refresh">
                    <el-icon><Refresh /></el-icon>刷新数据
                  </el-dropdown-item>
                  <el-dropdown-item command="density" divided>
                    <el-icon><Expand /></el-icon>紧凑视图
                  </el-dropdown-item>
                  <el-dropdown-item command="columns" divided>
                    <el-icon><Operation /></el-icon>列设置
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>
      </template>
      
      <!-- 用户数据表格 -->
      <el-table
        :data="tableData"
        v-loading="loading"
        border
        stripe
        :size="tableDensity"
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column type="index" label="序号" width="70" align="center" />
        <el-table-column prop="username" label="用户名" min-width="120" show-overflow-tooltip />
        <el-table-column prop="realName" label="真实姓名" min-width="120" show-overflow-tooltip />
        <el-table-column prop="role" label="角色" width="120" align="center">
          <template #default="{ row }">
            <el-tag 
              :type="row.role === 'admin' ? 'danger' : 'info'"
              effect="dark"
              round
            >
              {{ row.role === 'admin' ? '管理员' : '普通用户' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="department" label="部门" min-width="120" show-overflow-tooltip />
        <el-table-column prop="email" label="邮箱" min-width="180" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag
              :type="row.status === 'active' ? 'success' : 'warning'"
              effect="plain"
              class="status-tag"
            >
              {{ row.status === 'active' ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" min-width="180" align="center" show-overflow-tooltip />
        <el-table-column prop="lastLogin" label="最后登录" min-width="180" align="center" show-overflow-tooltip />
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-space>
              <el-tooltip content="查看详情" placement="top">
                <el-button link type="primary" @click="handleView(row)">
                  <el-icon><View /></el-icon>
                </el-button>
              </el-tooltip>
              <el-tooltip content="编辑用户" placement="top">
                <el-button link type="primary" @click="handleEdit(row)">
                  <el-icon><Edit /></el-icon>
                </el-button>
              </el-tooltip>
              <el-tooltip :content="row.status === 'active' ? '禁用用户' : '启用用户'" placement="top">
                <el-button 
                  link 
                  :type="row.status === 'active' ? 'warning' : 'success'" 
                  @click="handleToggleStatus(row)"
                >
                  <el-icon><CircleClose v-if="row.status === 'active'" /><CircleCheck v-else /></el-icon>
                </el-button>
              </el-tooltip>
              <el-tooltip content="重置密码" placement="top">
                <el-button link type="info" @click="handleResetPassword(row)">
                  <el-icon><Key /></el-icon>
                </el-button>
              </el-tooltip>
              <el-tooltip content="删除用户" placement="top">
                <el-button link type="danger" @click="handleDelete(row)">
                  <el-icon><Delete /></el-icon>
                </el-button>
              </el-tooltip>
            </el-space>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 批量操作 -->
      <div class="batch-actions" v-if="selectedUsers.length > 0">
        <div class="selected-count">
          已选择 <span class="count">{{ selectedUsers.length }}</span> 项
        </div>
        <div class="action-buttons">
          <el-button size="small" type="warning" @click="batchDisable">批量禁用</el-button>
          <el-button size="small" type="success" @click="batchEnable">批量启用</el-button>
          <el-button size="small" type="danger" @click="batchDelete">批量删除</el-button>
        </div>
      </div>
      
      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          background
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 用户详情抽屉 -->
    <el-drawer
      v-model="drawerVisible"
      title="用户详情"
      size="30%"
      destroy-on-close
    >
      <div v-if="currentUser" class="user-detail">
        <div class="user-avatar">
          <el-avatar :size="100" :src="avatarUrl"></el-avatar>
          <h3>{{ currentUser.realName }}</h3>
          <p>{{ currentUser.username }}</p>
        </div>
        
        <el-descriptions title="基本信息" :column="1" border>
          <el-descriptions-item label="ID">{{ currentUser.id }}</el-descriptions-item>
          <el-descriptions-item label="用户名">{{ currentUser.username }}</el-descriptions-item>
          <el-descriptions-item label="真实姓名">{{ currentUser.realName }}</el-descriptions-item>
          <el-descriptions-item label="角色">
            <el-tag :type="currentUser.role === 'admin' ? 'danger' : 'info'">
              {{ currentUser.role === 'admin' ? '管理员' : '普通用户' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="部门">{{ currentUser.department }}</el-descriptions-item>
          <el-descriptions-item label="邮箱">{{ currentUser.email }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="currentUser.status === 'active' ? 'success' : 'warning'">
              {{ currentUser.status === 'active' ? '启用' : '禁用' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ currentUser.createTime }}</el-descriptions-item>
          <el-descriptions-item label="最后登录">{{ currentUser.lastLogin || '未登录' }}</el-descriptions-item>
        </el-descriptions>
        
        <div class="drawer-footer">
          <el-button @click="drawerVisible = false">关闭</el-button>
          <el-button type="primary" @click="handleEdit(currentUser)">编辑</el-button>
        </div>
      </div>
    </el-drawer>

    <!-- 用户表单对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '新增用户' : '编辑用户'"
      width="600px"
      destroy-on-close
    >
      <el-form
        ref="userFormRef"
        :model="userForm"
        :rules="userRules"
        label-width="100px"
        class="user-form"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="用户名" prop="username">
              <el-input 
                v-model="userForm.username" 
                placeholder="请输入用户名"
                :disabled="dialogType === 'edit'"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="真实姓名" prop="realName">
              <el-input v-model="userForm.realName" placeholder="请输入真实姓名" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="角色" prop="role">
              <el-select v-model="userForm.role" placeholder="请选择角色" style="width: 100%">
                <el-option label="管理员" value="admin" />
                <el-option label="普通用户" value="user" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="部门" prop="department">
              <el-select v-model="userForm.department" placeholder="请选择部门" style="width: 100%">
                <el-option label="技术部" value="技术部" />
                <el-option label="市场部" value="市场部" />
                <el-option label="研发部" value="研发部" />
                <el-option label="财务部" value="财务部" />
                <el-option label="人力资源部" value="人力资源部" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="userForm.email" placeholder="请输入邮箱" />
        </el-form-item>
        
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="userForm.status">
            <el-radio-button label="active">启用</el-radio-button>
            <el-radio-button label="inactive">禁用</el-radio-button>
          </el-radio-group>
        </el-form-item>
        
        <el-form-item v-if="dialogType === 'add'" label="密码" prop="password">
          <el-input
            v-model="userForm.password"
            type="password"
            placeholder="请输入密码"
            show-password
          />
        </el-form-item>
        
        <el-form-item v-if="dialogType === 'add'" label="确认密码" prop="confirmPassword">
          <el-input
            v-model="userForm.confirmPassword"
            type="password"
            placeholder="请再次输入密码"
            show-password
          />
        </el-form-item>
        
        <el-form-item label="备注" prop="remark">
          <el-input
            v-model="userForm.remark"
            type="textarea"
            rows="3"
            placeholder="请输入备注信息"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm" :loading="submitting">确定</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 列设置对话框 -->
    <el-dialog v-model="columnSettingVisible" title="列设置" width="500px">
      <el-checkbox-group v-model="visibleColumns">
        <div class="column-item" v-for="column in allColumns" :key="column.prop">
          <el-checkbox :label="column.prop">{{ column.label }}</el-checkbox>
        </div>
      </el-checkbox-group>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="resetColumns">重置</el-button>
          <el-button type="primary" @click="saveColumns">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { 
  Plus, Search, ArrowDown, ArrowUp, Download, Refresh, List, Setting, View, 
  Edit, Delete, Key, Operation, Expand, User, CircleClose, CircleCheck
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'

// 搜索表单状态
const searchForm = reactive({
  username: '',
  role: '',
  status: '',
  department: '',
  email: '',
  dateRange: [] as string[]
})

// 高级搜索
const showAdvancedSearch = ref(false)

// 表格数据
const loading = ref(false)
const tableData = ref<any[]>([])
const showDeletedUsers = ref(false)
const tableDensity = ref('default')

// 表格选择
const selectedUsers = ref<any[]>([])
const handleSelectionChange = (selection: any[]) => {
  selectedUsers.value = selection
}

// 分页
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 对话框
const dialogVisible = ref(false)
const dialogType = ref<'add' | 'edit'>('add')
const userFormRef = ref<FormInstance>()
const submitting = ref(false)

// 抽屉
const drawerVisible = ref(false)
const currentUser = ref<any>(null)

// 表单数据
const userForm = reactive({
  id: 0,
  username: '',
  realName: '',
  role: '',
  department: '',
  email: '',
  status: 'active',
  password: '',
  confirmPassword: '',
  remark: ''
})

// 列设置
const columnSettingVisible = ref(false)
const allColumns = [
  { prop: 'username', label: '用户名' },
  { prop: 'realName', label: '真实姓名' },
  { prop: 'role', label: '角色' },
  { prop: 'department', label: '部门' },
  { prop: 'email', label: '邮箱' },
  { prop: 'status', label: '状态' },
  { prop: 'createTime', label: '创建时间' },
  { prop: 'lastLogin', label: '最后登录' }
]
const visibleColumns = ref(allColumns.map(col => col.prop))

// 头像
const avatarUrl = computed(() => {
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.value?.username || 'default'}`
})

// 表单验证规则
const validatePass = (rule: any, value: any, callback: any) => {
  if (value === '') {
    callback(new Error('请输入密码'))
  } else {
    if (userForm.confirmPassword !== '') {
      if (!userFormRef.value) return
      userFormRef.value.validateField('confirmPassword', () => null)
    }
    callback()
  }
}

const validatePass2 = (rule: any, value: any, callback: any) => {
  if (value === '') {
    callback(new Error('请再次输入密码'))
  } else if (value !== userForm.password) {
    callback(new Error('两次输入密码不一致!'))
  } else {
    callback()
  }
}

const userRules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  realName: [
    { required: true, message: '请输入真实姓名', trigger: 'blur' }
  ],
  role: [
    { required: true, message: '请选择角色', trigger: 'change' }
  ],
  department: [
    { required: true, message: '请选择部门', trigger: 'change' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少为6位', trigger: 'blur' },
    { validator: validatePass, trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入密码', trigger: 'blur' },
    { validator: validatePass2, trigger: 'blur' }
  ]
}

// 模拟数据
const createMockUsers = () => {
  const departments = ['技术部', '市场部', '研发部', '财务部', '人力资源部']
  const mockUsers = []
  
  for (let i = 1; i <= 25; i++) {
    const isAdmin = i % 7 === 0
    const isInactive = i % 5 === 0
    const dept = departments[i % departments.length]
    const date = new Date()
    date.setDate(date.getDate() - i)
    
    const lastLoginDate = new Date()
    lastLoginDate.setDate(lastLoginDate.getDate() - (i % 7))
    lastLoginDate.setHours(Math.floor(Math.random() * 24))
    lastLoginDate.setMinutes(Math.floor(Math.random() * 60))
    
    mockUsers.push({
      id: i,
      username: i === 1 ? 'admin' : `user${i}`,
      realName: i === 1 ? '系统管理员' : `用户${i}`,
      role: isAdmin ? 'admin' : 'user',
      department: dept,
      email: i === 1 ? 'admin@example.com' : `user${i}@example.com`,
      status: isInactive ? 'inactive' : 'active',
      createTime: date.toLocaleString(),
      lastLogin: i % 8 === 0 ? null : lastLoginDate.toLocaleString(),
      deleted: i % 17 === 0
    })
  }
  
  return mockUsers
}

// 所有用户数据
const allUsers = ref<any[]>([])

// 加载表格数据
const loadTableData = () => {
  loading.value = true
  
  // 创建模拟数据
  if (allUsers.value.length === 0) {
    allUsers.value = createMockUsers()
  }
  
  setTimeout(() => {
    // 根据是否显示已删除用户进行过滤
    const filteredUsers = allUsers.value.filter(user => {
      if (!showDeletedUsers.value && user.deleted) {
        return false
      }
      return true
    })
    
    tableData.value = filteredUsers
    total.value = filteredUsers.length
    loading.value = false
  }, 500)
}

// 组件挂载时加载数据
onMounted(() => {
  loadTableData()
})

// 搜索
const handleSearch = () => {
  loading.value = true
  
  setTimeout(() => {
    // 过滤用户数据
    const filteredData = allUsers.value.filter(item => {
      // 基本过滤条件
      const usernameMatch = searchForm.username ? item.username.toLowerCase().includes(searchForm.username.toLowerCase()) : true
      const roleMatch = searchForm.role ? item.role === searchForm.role : true
      const statusMatch = searchForm.status ? item.status === searchForm.status : true
      
      // 高级过滤条件
      const departmentMatch = searchForm.department ? item.department === searchForm.department : true
      const emailMatch = searchForm.email ? item.email.toLowerCase().includes(searchForm.email.toLowerCase()) : true
      
      // 日期范围过滤
      let dateMatch = true
      if (searchForm.dateRange && searchForm.dateRange.length === 2) {
        const startDate = searchForm.dateRange[0] ? new Date(searchForm.dateRange[0]) : null
        const endDate = searchForm.dateRange[1] ? new Date(searchForm.dateRange[1]) : null
        const createDate = new Date(item.createTime)
        
        if (startDate && endDate) {
          dateMatch = createDate >= startDate && createDate <= endDate
        }
      }
      
      // 删除状态过滤
      const deletedMatch = showDeletedUsers.value ? true : !item.deleted
      
      // 返回所有条件的结果
      return usernameMatch && roleMatch && statusMatch && departmentMatch && emailMatch && dateMatch && deletedMatch
    })
    
    tableData.value = filteredData
    total.value = filteredData.length
    loading.value = false
    
    ElMessage.success(`搜索完成，找到 ${filteredData.length} 条结果`)
  }, 500)
}

// 重置搜索表单
const resetForm = () => {
  searchForm.username = ''
  searchForm.role = ''
  searchForm.status = ''
  searchForm.department = ''
  searchForm.email = ''
  searchForm.dateRange = []
  
  loadTableData()
}

// 切换显示已删除用户
const toggleDeletedUsers = () => {
  loadTableData()
}

// 表格设置
const handleTableCommand = (command: string) => {
  switch(command) {
    case 'refresh':
      loadTableData()
      break
    case 'density':
      tableDensity.value = tableDensity.value === 'default' ? 'small' : 'default'
      break
    case 'columns':
      columnSettingVisible.value = true
      break
  }
}

// 列设置
const resetColumns = () => {
  visibleColumns.value = allColumns.map(col => col.prop)
}

const saveColumns = () => {
  columnSettingVisible.value = false
  // 这里可以保存列设置到本地存储
  ElMessage.success('列设置已保存')
}

// 新增用户
const handleAdd = () => {
  dialogType.value = 'add'
  userForm.id = 0
  userForm.username = ''
  userForm.realName = ''
  userForm.role = ''
  userForm.department = ''
  userForm.email = ''
  userForm.status = 'active'
  userForm.password = ''
  userForm.confirmPassword = ''
  userForm.remark = ''
  dialogVisible.value = true
}

// 查看用户详情
const handleView = (row: any) => {
  currentUser.value = {...row}
  drawerVisible.value = true
}

// 编辑用户
const handleEdit = (row: any) => {
  dialogType.value = 'edit'
  userForm.id = row.id
  userForm.username = row.username
  userForm.realName = row.realName
  userForm.role = row.role
  userForm.department = row.department
  userForm.email = row.email
  userForm.status = row.status
  userForm.remark = row.remark || ''
  drawerVisible.value = false
  dialogVisible.value = true
}

// 切换用户状态
const handleToggleStatus = (row: any) => {
  const newStatus = row.status === 'active' ? 'inactive' : 'active'
  const action = newStatus === 'active' ? '启用' : '禁用'
  
  ElMessageBox.confirm(
    `确定要${action}用户 ${row.username} 吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  )
    .then(() => {
      // 模拟API调用
      setTimeout(() => {
        // 更新用户状态
        const user = allUsers.value.find(u => u.id === row.id)
        if (user) {
          user.status = newStatus
          
          // 更新表格中的用户
          const index = tableData.value.findIndex(u => u.id === row.id)
          if (index !== -1) {
            tableData.value[index].status = newStatus
          }
          
          ElMessage.success(`已${action}用户 ${row.username}`)
        }
      }, 300)
    })
    .catch(() => {
      // 用户取消操作
    })
}

// 删除用户
const handleDelete = (row: any) => {
  ElMessageBox.confirm(
    `确定要删除用户 ${row.username} 吗？`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  )
    .then(() => {
      // 模拟API调用
      setTimeout(() => {
        // 标记用户为已删除
        const user = allUsers.value.find(u => u.id === row.id)
        if (user) {
          user.deleted = true
          
          // 如果不显示已删除用户，则从表格中移除
          if (!showDeletedUsers.value) {
            tableData.value = tableData.value.filter(u => u.id !== row.id)
            total.value = tableData.value.length
          } else {
            // 否则更新表格中的用户
            const index = tableData.value.findIndex(u => u.id === row.id)
            if (index !== -1) {
              tableData.value[index].deleted = true
            }
          }
          
          ElMessage.success(`已删除用户 ${row.username}`)
        }
      }, 300)
    })
    .catch(() => {
      // 用户取消删除
    })
}

// 重置密码
const handleResetPassword = (row: any) => {
  ElMessageBox.confirm(
    `确定要重置用户 ${row.username} 的密码吗？`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  )
    .then(() => {
      // 模拟API调用
      setTimeout(() => {
        ElMessage.success('密码已重置为默认密码：123456')
      }, 300)
    })
    .catch(() => {
      // 用户取消操作
    })
}

// 批量操作
const batchDisable = () => {
  if (selectedUsers.value.length === 0) {
    ElMessage.warning('请先选择用户')
    return
  }
  
  ElMessageBox.confirm(
    `确定要禁用选中的 ${selectedUsers.value.length} 个用户吗？`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  )
    .then(() => {
      // 模拟API调用
      setTimeout(() => {
        const ids = selectedUsers.value.map(u => u.id)
        
        // 更新用户状态
        allUsers.value.forEach(user => {
          if (ids.includes(user.id)) {
            user.status = 'inactive'
          }
        })
        
        // 更新表格中的用户
        tableData.value.forEach(user => {
          if (ids.includes(user.id)) {
            user.status = 'inactive'
          }
        })
        
        ElMessage.success(`已禁用 ${ids.length} 个用户`)
        selectedUsers.value = []
      }, 300)
    })
    .catch(() => {
      // 用户取消操作
    })
}

const batchEnable = () => {
  if (selectedUsers.value.length === 0) {
    ElMessage.warning('请先选择用户')
    return
  }
  
  ElMessageBox.confirm(
    `确定要启用选中的 ${selectedUsers.value.length} 个用户吗？`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  )
    .then(() => {
      // 模拟API调用
      setTimeout(() => {
        const ids = selectedUsers.value.map(u => u.id)
        
        // 更新用户状态
        allUsers.value.forEach(user => {
          if (ids.includes(user.id)) {
            user.status = 'active'
          }
        })
        
        // 更新表格中的用户
        tableData.value.forEach(user => {
          if (ids.includes(user.id)) {
            user.status = 'active'
          }
        })
        
        ElMessage.success(`已启用 ${ids.length} 个用户`)
        selectedUsers.value = []
      }, 300)
    })
    .catch(() => {
      // 用户取消操作
    })
}

const batchDelete = () => {
  if (selectedUsers.value.length === 0) {
    ElMessage.warning('请先选择用户')
    return
  }
  
  ElMessageBox.confirm(
    `确定要删除选中的 ${selectedUsers.value.length} 个用户吗？`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  )
    .then(() => {
      // 模拟API调用
      setTimeout(() => {
        const ids = selectedUsers.value.map(u => u.id)
        
        // 标记用户为已删除
        allUsers.value.forEach(user => {
          if (ids.includes(user.id)) {
            user.deleted = true
          }
        })
        
        // 如果不显示已删除用户，则从表格中移除
        if (!showDeletedUsers.value) {
          tableData.value = tableData.value.filter(user => !ids.includes(user.id))
          total.value = tableData.value.length
        } else {
          // 否则更新表格中的用户
          tableData.value.forEach(user => {
            if (ids.includes(user.id)) {
              user.deleted = true
            }
          })
        }
        
        ElMessage.success(`已删除 ${ids.length} 个用户`)
        selectedUsers.value = []
      }, 300)
    })
    .catch(() => {
      // 用户取消操作
    })
}

// 导出用户数据
const exportUserData = () => {
  ElMessage.success('正在导出用户数据，请稍后...')
  setTimeout(() => {
    ElMessage.success('用户数据导出成功')
  }, 1500)
}

// 提交表单
const submitForm = async () => {
  if (!userFormRef.value) return
  
  await userFormRef.value.validate((valid, fields) => {
    if (valid) {
      submitting.value = true
      
      // 模拟API调用
      setTimeout(() => {
        if (dialogType.value === 'add') {
          // 新增用户
          const newUser = {
            id: allUsers.value.length + 1,
            username: userForm.username,
            realName: userForm.realName,
            role: userForm.role,
            department: userForm.department,
            email: userForm.email,
            status: userForm.status,
            createTime: new Date().toLocaleString(),
            lastLogin: null,
            remark: userForm.remark,
            deleted: false
          }
          
          // 添加到用户列表
          allUsers.value.unshift(newUser)
          tableData.value.unshift(newUser)
          total.value = tableData.value.length
          
          ElMessage.success('添加用户成功')
        } else {
          // 修改用户
          const user = allUsers.value.find(u => u.id === userForm.id)
          if (user) {
            user.realName = userForm.realName
            user.role = userForm.role
            user.department = userForm.department
            user.email = userForm.email
            user.status = userForm.status
            user.remark = userForm.remark
            
            // 更新表格中的用户
            const index = tableData.value.findIndex(u => u.id === userForm.id)
            if (index !== -1) {
              tableData.value[index] = { ...tableData.value[index], ...user }
            }
            
            ElMessage.success('修改用户成功')
          }
        }
        
        dialogVisible.value = false
        submitting.value = false
      }, 500)
    }
  })
}

// 分页处理
const handleSizeChange = (val: number) => {
  pageSize.value = val
  // 在实际应用中重新加载数据
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
  // 在实际应用中重新加载数据
}
</script>

<style scoped>
.user-management {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 100px);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.page-title {
  display: flex;
  flex-direction: column;
}

.page-title h2 {
  margin: 0;
  font-weight: 500;
  color: #303133;
}

.subtitle {
  font-size: 14px;
  color: #909399;
  margin-top: 5px;
}

.page-actions {
  display: flex;
  gap: 10px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 5px;
}

.search-card {
  margin-bottom: 20px;
}

.search-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-form {
  padding: 10px 0;
}

.search-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.advanced-search {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px dashed #dcdfe6;
}

.table-card {
  margin-bottom: 20px;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.table-title {
  display: flex;
  align-items: center;
  gap: 5px;
  font-weight: bold;
}

.table-actions {
  display: flex;
  align-items: center;
  gap: 15px;
}

:deep(.el-table) {
  margin: 15px 0;
  border-radius: 8px;
  overflow: hidden;
}

:deep(.el-table th) {
  background-color: #f5f7fa !important;
  font-weight: bold;
}

.status-tag {
  width: 100%;
  text-align: center;
}

.batch-actions {
  background: #f0f9eb;
  padding: 10px 15px;
  border-radius: 4px;
  margin: 10px 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.selected-count {
  font-size: 14px;
  color: #606266;
}

.count {
  font-weight: bold;
  color: #409eff;
  margin: 0 4px;
}

.action-buttons {
  display: flex;
  gap: 10px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.user-detail {
  padding: 0 20px;
}

.user-avatar {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 30px;
}

.user-avatar h3 {
  margin: 15px 0 5px;
  font-weight: 500;
}

.user-avatar p {
  color: #909399;
  margin: 0;
}

:deep(.el-descriptions) {
  margin-bottom: 30px;
}

.drawer-footer {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20px;
  background: #fff;
  border-top: 1px solid #e4e7ed;
  text-align: right;
}

.user-form {
  max-height: 65vh;
  overflow-y: auto;
  padding-right: 10px;
}

.column-item {
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.column-item:last-child {
  border-bottom: none;
}
</style>