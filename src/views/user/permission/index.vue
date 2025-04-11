<template>
  <div class="permission-container">
    <div class="page-header">
    <h2>权限管理</h2>
    </div>

    <el-card class="main-card">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="用户权限" name="userPermission">
          <div class="filter-container">
            <el-form :inline="true">
              <el-form-item label="用户名称">
                <el-input v-model="searchQuery.username" placeholder="搜索用户名" clearable />
              </el-form-item>
              <el-form-item label="角色">
                <el-select v-model="searchQuery.role" placeholder="选择角色" clearable>
                  <el-option
                    v-for="role in roleOptions"
                    :key="role.value"
                    :label="role.label"
                    :value="role.value"
                  />
                </el-select>
              </el-form-item>
              <el-form-item label="部门">
                <el-select v-model="searchQuery.department" placeholder="选择部门" clearable>
                  <el-option
                    v-for="dept in departmentOptions"
                    :key="dept.value"
                    :label="dept.label"
                    :value="dept.value"
                  />
                </el-select>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="searchUsers">
                  <el-icon><Search /></el-icon> 查询
                </el-button>
                <el-button @click="resetSearch">重置</el-button>
              </el-form-item>
            </el-form>
          </div>

          <el-table :data="userList" style="width: 100%" border>
            <el-table-column type="selection" width="55" />
            <el-table-column prop="username" label="用户名" width="120" />
            <el-table-column prop="realName" label="姓名" width="120" />
            <el-table-column prop="department" label="部门" width="120" />
            <el-table-column prop="email" label="邮箱" min-width="180" />
            <el-table-column prop="role" label="角色" width="120">
              <template #default="scope">
                <el-tag :type="getRoleTagType(scope.row.role)">
                  {{ scope.row.role }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="状态" width="100">
              <template #default="scope">
                <el-switch
                  v-model="scope.row.status"
                  :active-value="1"
                  :inactive-value="0"
                  @change="handleStatusChange(scope.row)"
                />
              </template>
            </el-table-column>
            <el-table-column prop="lastLoginTime" label="最后登录时间" width="180" />
            <el-table-column label="操作" width="220">
              <template #default="scope">
                <el-button type="primary" link @click="editUserPermission(scope.row)">
                  编辑权限
                </el-button>
                <el-button type="warning" link @click="editUserRole(scope.row)">
                  修改角色
                </el-button>
                <el-button type="danger" link @click="confirmResetPassword(scope.row)">
                  重置密码
                </el-button>
              </template>
            </el-table-column>
          </el-table>

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
        </el-tab-pane>

        <el-tab-pane label="角色管理" name="roleManagement">
          <div class="role-header">
            <el-button type="primary" @click="addRole">
              <el-icon><Plus /></el-icon> 添加角色
            </el-button>
          </div>

          <el-table :data="roleList" style="width: 100%" border>
            <el-table-column prop="name" label="角色名称" width="150" />
            <el-table-column prop="code" label="角色编码" width="150" />
            <el-table-column prop="description" label="描述" min-width="200" />
            <el-table-column prop="userCount" label="用户数" width="100" />
            <el-table-column label="状态" width="100">
              <template #default="scope">
                <el-switch
                  v-model="scope.row.status"
                  :active-value="1"
                  :inactive-value="0"
                  @change="handleRoleStatusChange(scope.row)"
                />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="250">
              <template #default="scope">
                <el-button type="primary" link @click="editRole(scope.row)">
                  编辑
                </el-button>
                <el-button type="warning" link @click="configPermission(scope.row)">
                  配置权限
                </el-button>
                <el-button 
                  type="danger" 
                  link 
                  @click="deleteRole(scope.row)"
                  :disabled="scope.row.isSystem === 1"
                >
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="权限项" name="permissionItems">
          <el-tree
            ref="permissionTree"
            :data="permissionList"
            node-key="id"
            :props="{ children: 'children', label: 'name' }"
            show-checkbox
            default-expand-all
          >
            <template #default="{ node, data }">
              <div class="custom-tree-node">
                <div class="permission-info">
                  <span>{{ node.label }}</span>
                  <el-tag size="small" type="info" class="permission-code">{{ data.code }}</el-tag>
                </div>
                <div class="permission-type">
                  <el-tag size="small" :type="getPermissionTypeTag(data.type)">
                    {{ getPermissionTypeLabel(data.type) }}
                  </el-tag>
                </div>
              </div>
            </template>
          </el-tree>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 用户权限编辑对话框 -->
    <el-dialog v-model="userPermissionDialog.visible" :title="`编辑用户权限 - ${userPermissionDialog.user?.username}`" width="700px">
      <div v-if="userPermissionDialog.user" class="permission-edit-container">
        <div class="user-info">
          <div class="user-detail">
            <div><strong>用户名：</strong>{{ userPermissionDialog.user.username }}</div>
            <div><strong>姓名：</strong>{{ userPermissionDialog.user.realName }}</div>
            <div><strong>部门：</strong>{{ userPermissionDialog.user.department }}</div>
            <div><strong>角色：</strong>{{ userPermissionDialog.user.role }}</div>
          </div>
        </div>
        <el-divider />
        <div class="permission-selection">
          <el-transfer
            v-model="userPermissionDialog.selectedPermissions"
            :data="userPermissionDialog.allPermissions"
            :titles="['可分配权限', '已分配权限']"
            :props="{
              key: 'id',
              label: 'name'
            }"
          />
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="userPermissionDialog.visible = false">取消</el-button>
          <el-button type="primary" @click="saveUserPermissions">保存</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 角色编辑对话框 -->
    <el-dialog v-model="roleDialog.visible" :title="roleDialog.isEdit ? '编辑角色' : '添加角色'" width="500px">
      <el-form :model="roleDialog.form" label-width="100px" :rules="roleFormRules" ref="roleFormRef">
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="roleDialog.form.name" placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item label="角色编码" prop="code">
          <el-input v-model="roleDialog.form.code" placeholder="请输入角色编码" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="roleDialog.form.description" type="textarea" rows="3" placeholder="请输入角色描述" />
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="roleDialog.form.status" :active-value="1" :inactive-value="0" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="roleDialog.visible = false">取消</el-button>
          <el-button type="primary" @click="saveRole">保存</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 角色权限配置对话框 -->
    <el-dialog v-model="rolePermissionDialog.visible" :title="`配置角色权限 - ${rolePermissionDialog.role?.name}`" width="600px">
      <div v-if="rolePermissionDialog.role" class="role-permission-container">
        <el-tree
          ref="rolePermissionTree"
          :data="permissionList"
          node-key="id"
          :props="{ children: 'children', label: 'name' }"
          show-checkbox
          default-expand-all
          :default-checked-keys="rolePermissionDialog.selectedKeys"
        />
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="rolePermissionDialog.visible = false">取消</el-button>
          <el-button type="primary" @click="saveRolePermissions">保存</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 用户角色修改对话框 -->
    <el-dialog v-model="userRoleDialog.visible" :title="`修改用户角色 - ${userRoleDialog.user?.username}`" width="500px">
      <el-form v-if="userRoleDialog.user" :model="userRoleDialog.form" label-width="100px">
        <el-form-item label="当前角色">
          <el-tag>{{ userRoleDialog.user.role }}</el-tag>
        </el-form-item>
        <el-form-item label="新角色" prop="roleId">
          <el-select v-model="userRoleDialog.form.roleId" placeholder="请选择新角色" style="width: 100%">
            <el-option
              v-for="role in roleList.filter(r => r.status === 1)"
              :key="role.id"
              :label="role.name"
              :value="role.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="userRoleDialog.visible = false">取消</el-button>
          <el-button type="primary" @click="saveUserRole">保存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Plus } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'

// 标签页
const activeTab = ref('userPermission')

// 用户搜索相关
const searchQuery = reactive({
  username: '',
  role: '',
  department: ''
})

// 角色和部门选项
const roleOptions = [
  { value: '管理员', label: '管理员' },
  { value: '编辑', label: '编辑' },
  { value: '查看者', label: '查看者' },
  { value: '普通用户', label: '普通用户' }
]

const departmentOptions = [
  { value: '技术部', label: '技术部' },
  { value: '产品部', label: '产品部' },
  { value: '营销部', label: '营销部' },
  { value: '研发部', label: '研发部' },
  { value: '运营部', label: '运营部' }
]

// 分页相关
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 用户列表
interface User {
  id: number;
  username: string;
  realName: string;
  email: string;
  department: string;
  role: string;
  status: number;
  lastLoginTime: string;
  createTime: string;
}

const userList = ref<User[]>([])

// 角色列表
interface Role {
  id: number;
  name: string;
  code: string;
  description: string;
  userCount: number;
  status: number;
  isSystem: number;
  createTime: string;
}

const roleList = ref<Role[]>([])

// 权限列表（树形结构）
interface Permission {
  id: number;
  name: string;
  code: string;
  type: string;
  children?: Permission[];
}

const permissionList = ref<Permission[]>([])

// 用户权限编辑对话框
interface PermissionOption {
  id: number;
  name: string;
  code: string;
}

const userPermissionDialog = reactive({
  visible: false,
  user: null as User | null,
  allPermissions: [] as PermissionOption[],
  selectedPermissions: [] as number[]
})

// 角色编辑对话框
const roleDialog = reactive({
  visible: false,
  isEdit: false,
  form: {
    id: 0,
    name: '',
    code: '',
    description: '',
    status: 1
  }
})

// 角色表单校验规则
const roleFormRules = reactive<FormRules>({
  name: [
    { required: true, message: '请输入角色名称', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入角色编码', trigger: 'blur' },
    { pattern: /^[A-Z_]+$/, message: '角色编码只能包含大写字母和下划线', trigger: 'blur' }
  ]
})

const roleFormRef = ref<FormInstance>()

// 角色权限配置对话框
const rolePermissionDialog = reactive({
  visible: false,
  role: null as Role | null,
  selectedKeys: [] as number[]
})

// 对树形组件的引用
const rolePermissionTree = ref<any>(null)

// 用户角色修改对话框
const userRoleDialog = reactive({
  visible: false,
  user: null as User | null,
  form: {
    roleId: ''
  }
})

// 获取角色标签类型
const getRoleTagType = (role: string) => {
  switch (role) {
    case '管理员':
      return 'danger'
    case '编辑':
      return 'warning'
    case '查看者':
      return 'success'
    default:
      return 'info'
  }
}

// 获取权限类型标签
const getPermissionTypeTag = (type: string) => {
  switch (type) {
    case 'menu':
      return 'primary'
    case 'operation':
      return 'success'
    case 'api':
      return 'warning'
    default:
      return 'info'
  }
}

// 获取权限类型标签文本
const getPermissionTypeLabel = (type: string) => {
  switch (type) {
    case 'menu':
      return '菜单'
    case 'operation':
      return '操作'
    case 'api':
      return 'API'
    default:
      return '未知'
  }
}

// 搜索用户
const searchUsers = () => {
  pagination.currentPage = 1
  fetchUserList()
}

// 重置搜索条件
const resetSearch = () => {
  searchQuery.username = ''
  searchQuery.role = ''
  searchQuery.department = ''
  searchUsers()
}

// 处理页码变化
const handleCurrentChange = (val: number) => {
  pagination.currentPage = val
  fetchUserList()
}

// 处理每页数量变化
const handleSizeChange = (val: number) => {
  pagination.pageSize = val
  pagination.currentPage = 1
  fetchUserList()
}

// 处理用户状态变化
const handleStatusChange = (user: User) => {
  // 模拟API调用
  setTimeout(() => {
    ElMessage.success(`用户 ${user.username} 状态已${user.status === 1 ? '启用' : '禁用'}`)
  }, 300)
}

// 处理角色状态变化
const handleRoleStatusChange = (role: Role) => {
  // 模拟API调用
  setTimeout(() => {
    ElMessage.success(`角色 ${role.name} 状态已${role.status === 1 ? '启用' : '禁用'}`)
  }, 300)
}

// 添加角色
const addRole = () => {
  roleDialog.isEdit = false
  roleDialog.form = {
    id: 0,
    name: '',
    code: '',
    description: '',
    status: 1
  }
  roleDialog.visible = true
}

// 编辑角色
const editRole = (role: Role) => {
  roleDialog.isEdit = true
  roleDialog.form = {
    id: role.id,
    name: role.name,
    code: role.code,
    description: role.description,
    status: role.status
  }
  nextTick(() => {
    roleDialog.visible = true
  })
}

// 保存角色
const saveRole = async () => {
  if (!roleFormRef.value) return
  
  try {
    await roleFormRef.value.validate((valid: boolean) => {
      if (valid) {
        // 模拟API调用
        setTimeout(() => {
          if (roleDialog.isEdit) {
            // 更新现有角色
            const index = roleList.value.findIndex(r => r.id === roleDialog.form.id)
            if (index !== -1) {
              roleList.value[index] = {
                ...roleList.value[index],
                name: roleDialog.form.name,
                code: roleDialog.form.code,
                description: roleDialog.form.description,
                status: roleDialog.form.status
              }
            }
            ElMessage.success('角色更新成功')
          } else {
            // 添加新角色
            const newRole: Role = {
              id: Math.floor(Math.random() * 1000) + 100,
              name: roleDialog.form.name,
              code: roleDialog.form.code,
              description: roleDialog.form.description,
              status: roleDialog.form.status,
              userCount: 0,
              isSystem: 0,
              createTime: new Date().toLocaleString()
            }
            roleList.value.push(newRole)
            ElMessage.success('角色添加成功')
          }
          roleDialog.visible = false
        }, 500)
      }
    })
  } catch (error) {
    console.error('表单验证错误:', error)
  }
}

// 配置角色权限
const configPermission = (role: Role) => {
  rolePermissionDialog.role = { ...role }
  // 模拟获取角色权限
  setTimeout(() => {
    // 示例：为该角色选择一些默认权限
    rolePermissionDialog.selectedKeys = [1, 3, 5, 8, 11] 
    rolePermissionDialog.visible = true
  }, 300)
}

// 保存角色权限
const saveRolePermissions = () => {
  if (!rolePermissionTree.value) return
  
  try {
    const checkedKeys = rolePermissionTree.value.getCheckedKeys()
    const halfCheckedKeys = rolePermissionTree.value.getHalfCheckedKeys()
    const allCheckedKeys = [...checkedKeys, ...halfCheckedKeys]
    
    // 模拟API调用
    setTimeout(() => {
      console.log('保存角色权限:', allCheckedKeys)
      ElMessage.success(`角色 ${rolePermissionDialog.role?.name} 的权限已更新`)
      rolePermissionDialog.visible = false
    }, 500)
  } catch (error) {
    console.error('获取选中节点错误:', error)
    ElMessage.error('获取权限信息失败')
  }
}

// 删除角色
const deleteRole = (role: Role) => {
  ElMessageBox.confirm(
    `确认删除角色 ${role.name} 吗？`,
    '删除确认',
    {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // 模拟API调用
    setTimeout(() => {
      roleList.value = roleList.value.filter(r => r.id !== role.id)
      ElMessage.success(`角色 ${role.name} 已删除`)
    }, 500)
  }).catch(() => {
    // 取消删除
  })
}

// 编辑用户权限
const editUserPermission = (user: User) => {
  userPermissionDialog.user = { ...user }
  
  // 模拟获取所有权限选项和用户当前权限
  // 这里将树形权限列表平铺为一维数组供穿梭框使用
  const flattenPermissions = (items: Permission[]): PermissionOption[] => {
    let result: PermissionOption[] = []
    items.forEach(item => {
      result.push({
        id: item.id,
        name: item.name,
        code: item.code
      })
      if (item.children && item.children.length > 0) {
        result = result.concat(flattenPermissions(item.children))
      }
    })
    return result
  }
  
  setTimeout(() => {
    userPermissionDialog.allPermissions = flattenPermissions(permissionList.value)
    
    // 模拟该用户已有的权限
    userPermissionDialog.selectedPermissions = [3, 5, 12, 15]
    userPermissionDialog.visible = true
  }, 300)
}

// 保存用户权限
const saveUserPermissions = () => {
  if (!userPermissionDialog.user) return
  
  // 模拟API调用
  setTimeout(() => {
    console.log('保存用户权限：', userPermissionDialog.selectedPermissions)
    ElMessage.success(`用户 ${userPermissionDialog.user?.username} 的权限已更新`)
    userPermissionDialog.visible = false
  }, 500)
}

// 修改用户角色
const editUserRole = (user: User) => {
  userRoleDialog.user = { ...user }
  userRoleDialog.form.roleId = ''  // 重置
  userRoleDialog.visible = true
}

// 保存用户角色
const saveUserRole = () => {
  if (!userRoleDialog.user || !userRoleDialog.form.roleId) {
    ElMessage.warning('请选择新角色')
    return
  }
  
  // 模拟API调用
  setTimeout(() => {
    const roleId = Number(userRoleDialog.form.roleId)
    const selectedRole = roleList.value.find(r => r.id === roleId)
    
    if (selectedRole && userRoleDialog.user) {
      // 更新用户角色
      const index = userList.value.findIndex(u => u.id === userRoleDialog.user?.id)
      if (index !== -1) {
        userList.value[index].role = selectedRole.name
      }
      
      ElMessage.success(`用户 ${userRoleDialog.user.username} 的角色已更改为 ${selectedRole.name}`)
      userRoleDialog.visible = false
    }
  }, 500)
}

// 确认重置密码
const confirmResetPassword = (user: User) => {
  ElMessageBox.confirm(
    `确认为用户 ${user.username} 重置密码吗？`,
    '重置确认',
    {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // 模拟API调用
    setTimeout(() => {
      ElMessage.success(`用户 ${user.username} 的密码已重置，新密码已发送至用户邮箱`)
    }, 500)
  }).catch(() => {
    // 取消重置
  })
}

// 获取用户列表
const fetchUserList = () => {
  // 模拟API调用
  setTimeout(() => {
    // 过滤用户数据
    let filteredUsers = [
      {
        id: 1,
        username: 'admin',
        realName: '系统管理员',
        email: 'admin@example.com',
        department: '技术部',
        role: '管理员',
        status: 1,
        lastLoginTime: '2024-04-09 14:30',
        createTime: '2024-01-01 00:00'
      },
      {
        id: 2,
        username: 'zhangsan',
        realName: '张三',
        email: 'zhangsan@example.com',
        department: '产品部',
        role: '编辑',
        status: 1,
        lastLoginTime: '2024-04-09 11:45',
        createTime: '2024-01-10 10:00'
      },
      {
        id: 3,
        username: 'lisi',
        realName: '李四',
        email: 'lisi@example.com',
        department: '营销部',
        role: '查看者',
        status: 0,
        lastLoginTime: '2024-04-08 16:30',
        createTime: '2024-01-15 14:00'
      },
      {
        id: 4,
        username: 'wangwu',
        realName: '王五',
        email: 'wangwu@example.com',
        department: '研发部',
        role: '编辑',
        status: 1,
        lastLoginTime: '2024-04-09 09:20',
        createTime: '2024-02-01 09:00'
      },
      {
        id: 5,
        username: 'zhaoliu',
        realName: '赵六',
        email: 'zhaoliu@example.com',
        department: '技术部',
        role: '普通用户',
        status: 1,
        lastLoginTime: '2024-04-08 13:15',
        createTime: '2024-02-10 11:00'
      }
    ]
    
    if (searchQuery.username) {
      filteredUsers = filteredUsers.filter(user => 
        user.username.includes(searchQuery.username) || 
        user.realName.includes(searchQuery.username)
      )
    }
    
    if (searchQuery.role) {
      filteredUsers = filteredUsers.filter(user => user.role === searchQuery.role)
    }
    
    if (searchQuery.department) {
      filteredUsers = filteredUsers.filter(user => user.department === searchQuery.department)
    }
    
    pagination.total = filteredUsers.length
    
    // 分页
    const start = (pagination.currentPage - 1) * pagination.pageSize
    const end = start + pagination.pageSize
    userList.value = filteredUsers.slice(start, end)
  }, 300)
}

// 获取角色列表
const fetchRoleList = () => {
  // 模拟API调用
  setTimeout(() => {
    roleList.value = [
      {
        id: 1,
        name: '管理员',
        code: 'ADMIN',
        description: '系统管理员，拥有所有权限',
        userCount: 1,
        status: 1,
        isSystem: 1,  // 系统内置角色
        createTime: '2024-01-01 00:00'
      },
      {
        id: 2,
        name: '编辑',
        code: 'EDITOR',
        description: '内容编辑者，可以创建和修改文档',
        userCount: 2,
        status: 1,
        isSystem: 1,
        createTime: '2024-01-01 00:00'
      },
      {
        id: 3,
        name: '查看者',
        code: 'VIEWER',
        description: '只有查看权限，不能修改内容',
        userCount: 1,
        status: 1,
        isSystem: 1,
        createTime: '2024-01-01 00:00'
      },
      {
        id: 4,
        name: '普通用户',
        code: 'USER',
        description: '普通用户，有基本的操作权限',
        userCount: 1,
        status: 1,
        isSystem: 1,
        createTime: '2024-01-01 00:00'
      },
      {
        id: 5,
        name: '客户管理',
        code: 'CUSTOMER_MANAGER',
        description: '负责客户数据管理',
        userCount: 0,
        status: 0,
        isSystem: 0,
        createTime: '2024-03-15 10:30'
      }
    ]
  }, 300)
}

// 获取权限树
const fetchPermissionTree = () => {
  // 模拟API调用
  setTimeout(() => {
    permissionList.value = [
      {
        id: 1,
        name: '系统管理',
        code: 'system',
        type: 'menu',
        children: [
          {
            id: 2,
            name: '用户管理',
            code: 'system:user',
            type: 'menu',
            children: [
              {
                id: 3,
                name: '查看用户',
                code: 'system:user:view',
                type: 'operation'
              },
              {
                id: 4,
                name: '添加用户',
                code: 'system:user:add',
                type: 'operation'
              },
              {
                id: 5,
                name: '编辑用户',
                code: 'system:user:edit',
                type: 'operation'
              },
              {
                id: 6,
                name: '删除用户',
                code: 'system:user:delete',
                type: 'operation'
              }
            ]
          },
          {
            id: 7,
            name: '角色管理',
            code: 'system:role',
            type: 'menu',
            children: [
              {
                id: 8,
                name: '查看角色',
                code: 'system:role:view',
                type: 'operation'
              },
              {
                id: 9,
                name: '添加角色',
                code: 'system:role:add',
                type: 'operation'
              },
              {
                id: 10,
                name: '编辑角色',
                code: 'system:role:edit',
                type: 'operation'
              },
              {
                id: 11,
                name: '删除角色',
                code: 'system:role:delete',
                type: 'operation'
              }
            ]
          }
        ]
      },
      {
        id: 12,
        name: '文档管理',
        code: 'document',
        type: 'menu',
        children: [
          {
            id: 13,
            name: '查看文档',
            code: 'document:view',
            type: 'operation'
          },
          {
            id: 14,
            name: '创建文档',
            code: 'document:create',
            type: 'operation'
          },
          {
            id: 15,
            name: '编辑文档',
            code: 'document:edit',
            type: 'operation'
          },
          {
            id: 16,
            name: '删除文档',
            code: 'document:delete',
            type: 'operation'
          }
        ]
      },
      {
        id: 17,
        name: 'API权限',
        code: 'api',
        type: 'menu',
        children: [
          {
            id: 18,
            name: '用户API',
            code: 'api:user',
            type: 'api'
          },
          {
            id: 19,
            name: '文档API',
            code: 'api:document',
            type: 'api'
          },
          {
            id: 20,
            name: '统计API',
            code: 'api:stats',
            type: 'api'
          }
        ]
      }
    ]
  }, 300)
}

// 初始化
onMounted(() => {
  fetchUserList()
  fetchRoleList()
  fetchPermissionTree()
})
</script>

<style scoped>
.permission-container {
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

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

/* 角色管理样式 */
.role-header {
  margin-bottom: 20px;
}

/* 权限树样式 */
:deep(.custom-tree-node) {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-right: 8px;
}

:deep(.permission-info) {
  display: flex;
  align-items: center;
}

.permission-code {
  margin-left: 8px;
}

/* 用户权限编辑样式 */
.permission-edit-container {
  max-height: 500px;
  overflow-y: auto;
}

.user-info {
  margin-bottom: 20px;
}

.user-detail {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.permission-selection {
  margin-top: 20px;
}

/* 角色权限配置样式 */
.role-permission-container {
  max-height: 500px;
  overflow-y: auto;
}
</style>