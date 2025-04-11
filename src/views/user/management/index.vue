<template>
  <div class="user-management">
    <div class="page-header">
      <h2>用户管理</h2>
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>新增用户
      </el-button>
    </div>

    <el-card class="filter-card">
      <el-form :inline="true" :model="searchForm" class="filter-form">
        <el-form-item label="用户名">
          <el-input v-model="searchForm.username" placeholder="请输入用户名" clearable />
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="searchForm.role" placeholder="请选择角色" clearable>
            <el-option label="管理员" value="admin" />
            <el-option label="普通用户" value="user" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
            <el-option label="启用" value="active" />
            <el-option label="禁用" value="inactive" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-card">
      <el-table :data="tableData" v-loading="loading" style="width: 100%">
        <el-table-column prop="username" label="用户名" />
        <el-table-column prop="realName" label="真实姓名" />
        <el-table-column prop="role" label="角色">
          <template #default="{ row }">
            <el-tag :type="row.role === 'admin' ? 'danger' : 'success'">
              {{ row.role === 'admin' ? '管理员' : '普通用户' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="department" label="部门" />
        <el-table-column prop="email" label="邮箱" />
        <el-table-column prop="status" label="状态" align="center" class-name="status-column">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'info'" class="status-tag">
              {{ row.status === 'active' ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间"  align="center" />
        <el-table-column label="操作" width="200" align="center">
          <template #default="{ row }">
            <el-button-group>
              <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
              <el-button link type="primary" @click="handleDelete(row)">删除</el-button>
              <el-button link type="primary" @click="handleResetPassword(row)">重置密码</el-button>
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 用户表单对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '新增用户' : '编辑用户'"
      width="500px"
    >
      <el-form
        ref="userFormRef"
        :model="userForm"
        :rules="userRules"
        label-width="80px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="userForm.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="真实姓名" prop="realName">
          <el-input v-model="userForm.realName" placeholder="请输入真实姓名" />
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-input v-model="userForm.role" placeholder="请选择角色">
            <el-option label="管理员" value="admin" />
            <el-option label="普通用户" value="user" />
          </el-input>
        </el-form-item>
        <el-form-item label="部门" prop="department">
          <el-input v-model="userForm.department" placeholder="请输入部门" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="userForm.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-input v-model="userForm.status" placeholder="请选择状态">
            <el-option label="启用" value="active" />
            <el-option label="禁用" value="inactive" />
          </el-input>
        </el-form-item>
        <el-form-item v-if="dialogType === 'add'" label="密码" prop="password">
          <el-input
            v-model="userForm.password"
            type="password"
            placeholder="请输入密码"
            show-password
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'

// 搜索表单
const searchForm = reactive({
  username: '',
  role: '',
  status: ''
})

// 表格数据
const loading = ref(false)
const tableData = ref([])

// 分页
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(100)

// 对话框
const dialogVisible = ref(false)
const dialogType = ref<'add' | 'edit'>('add')
const userFormRef = ref<FormInstance>()
const userForm = reactive({
  id: 0,
  username: '',
  realName: '',
  role: '',
  department: '',
  email: '',
  status: 'active',
  password: ''
})

// 表单验证规则
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
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少为6位', trigger: 'blur' }
  ]
}

// 搜索
const handleSearch = () => {
  loading.value = true
  
  // Filter tableData based on search criteria
  const filteredData = tableData.value.filter(item => {
    // Check if username matches (if provided)
    const usernameMatch = searchForm.username ? item.username.toLowerCase().includes(searchForm.username.toLowerCase()) : true
    
    // Check if role matches (if provided)
    const roleMatch = searchForm.role ? item.role === searchForm.role : true
    
    // Check if status matches (if provided)
    const statusMatch = searchForm.status ? item.status === searchForm.status : true
    
    // Return true only if all provided criteria match
    return usernameMatch && roleMatch && statusMatch
  })
  
  // Update displayed data and total count
  tableData.value = filteredData
  total.value = filteredData.length
  
  setTimeout(() => {
    loading.value = false
    ElMessage.success(`搜索完成，找到 ${filteredData.length} 条结果`)
  }, 500)
}

// 重置表单
const resetForm = () => {
  searchForm.username = ''
  searchForm.role = ''
  searchForm.status = ''
  
  // Reset table data to original state
  loadTableData()
}

// Initial data for the table
const originalTableData = [
  {
    id: 1,
    username: 'admin',
    realName: '系统管理员',
    role: 'admin',
    department: '技术部',
    email: 'admin@example.com',
    status: 'active',
    createTime: '2024-01-01 00:00:00'
  },
  {
    id: 2,
    username: 'zhangsan',
    realName: '张三',
    role: 'user',
    department: '市场部',
    email: 'zhangsan@example.com',
    status: 'active',
    createTime: '2024-01-02 00:00:00'
  },
  {
    id: 3,
    username: 'lisi',
    realName: '李四',
    role: 'user',
    department: '研发部',
    email: 'lisi@example.com',
    status: 'active',
    createTime: '2024-01-03 00:00:00'
  },
  {
    id: 4,
    username: 'wangwu',
    realName: '王五',
    role: 'user',
    department: '财务部',
    email: 'wangwu@example.com',
    status: 'inactive',
    createTime: '2024-01-04 00:00:00'
  },
  {
    id: 5,
    username: 'zhaoliu',
    realName: '赵六',
    role: 'admin',
    department: '人力资源部',
    email: 'zhaoliu@example.com',
    status: 'inactive',
    createTime: '2024-01-05 00:00:00'
  }
]

// Function to load/reload table data
const loadTableData = () => {
  loading.value = true
  setTimeout(() => {
    tableData.value = [...originalTableData]
    total.value = originalTableData.length
    loading.value = false
  }, 300)
}

// 组件挂载时加载数据
loadTableData()

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
  dialogVisible.value = true
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
  dialogVisible.value = true
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
      // 实际应用中这里应该调用接口删除用户
      ElMessage.success('删除成功')
    })
    .catch(() => {
      // 取消删除
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
      // 实际应用中这里应该调用接口重置密码
      ElMessage.success('密码重置成功')
    })
    .catch(() => {
      // 取消重置
    })
}

// 提交表单
const submitForm = async () => {
  if (!userFormRef.value) return
  
  await userFormRef.value.validate((valid, fields) => {
    if (valid) {
      // 实际应用中这里应该调用接口提交表单
      ElMessage.success(dialogType.value === 'add' ? '添加成功' : '修改成功')
      dialogVisible.value = false
      
      // 如果是新增用户，添加到表格中
      if (dialogType.value === 'add') {
        const newUser = {
          id: tableData.value.length + 1,
          username: userForm.username,
          realName: userForm.realName,
          role: userForm.role,
          department: userForm.department,
          email: userForm.email,
          status: userForm.status,
          createTime: new Date().toLocaleString()
        }
        tableData.value.unshift(newUser)
      }
    }
  })
}

// 分页
const handleSizeChange = (val: number) => {
  pageSize.value = val
  // 实际应用中这里应该重新加载数据
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
  // 实际应用中这里应该重新加载数据
}
</script>

<style scoped>
.user-management {
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
  font-weight: 500;
}

.filter-card {
  margin-bottom: 20px;
}

.filter-form {
  display: flex;
  flex-wrap: wrap;
}

.table-card {
  margin-bottom: 20px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>