import { reactive, readonly } from 'vue'

// User state interface
interface UserState {
  avatar: string;
  username: string;
  email: string;
  // 其他用户数据
}

// 创建响应式状态
const state = reactive<UserState>({
  avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png', // 默认头像
  username: '管理员',
  email: 'admin@example.com',
})

// 用于修改状态的方法
const methods = {
  updateAvatar(newAvatarUrl: string) {
    state.avatar = newAvatarUrl
  },
  
  updateUserInfo(userInfo: Partial<UserState>) {
    Object.assign(state, userInfo)
  }
}

// 导出只读状态和方法
export default {
  state: readonly(state),
  ...methods
}