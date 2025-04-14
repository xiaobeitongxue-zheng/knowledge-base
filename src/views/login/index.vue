<template>
  <div class="login-container">
    <div class="login-box">
      <div class="login-header">
        <h2>欢迎登录企业知识库系统</h2>
      </div>
        
        <el-form-item prop="username">
          <el-input 
            v-model="loginForm.username"
            placeholder="用户名"
            prefix-icon="User"
            clearable
            style="height: 34px;"
          />
        </el-form-item>
        
        <el-form ref="loginFormRef" :model="loginForm" :rules="loginRules" class="login-form">
        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="密码"
            prefix-icon="Lock"
            show-password
            clearable
            @keyup.enter="handleLogin"
            style="height: 34px;"
          />
        </el-form-item>

        <el-form-item>
          <div class="captcha-section">
            <img :src="captchaUrl" alt="验证码" class="captcha-image" @click="refreshCaptcha" style="width: 60px; height: 34px; object-fit: contain;" />
            <el-input v-model="loginForm.captcha" placeholder="请输入验证码" clearable style="height: 34px;" />
          </div>
        </el-form-item>
        
        <el-form-item>
          <div class="form-options" style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
            <el-checkbox v-model="loginForm.remember">记住密码</el-checkbox>
            <el-link type="primary" :underline="false" @click="goToForgetPassword">忘记密码</el-link>
          </div>
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" :loading="loading" class="login-button" @click="handleLogin">
            登录
          </el-button>
        </el-form-item>
        
        <el-form-item>
          <div class="register-link" style="text-align: center; width: 100%;">
            <span>还没有账号?</span>
            <el-link type="primary" :underline="false" @click="goToRegister">注册账号</el-link>
          </div>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import { validUsername } from '@/utils/validate'

const router = useRouter()
const loginFormRef = ref<FormInstance>()
const loading = ref(false)

const loginForm = reactive({
  username: 'admin',
  password: '123456',
  captcha: '',
  remember: false
})

const captchaUrl = ref('/api/captcha')

const refreshCaptcha = () => {
  captchaUrl.value = `/api/captcha?${Date.now()}`
}

const loginRules: FormRules = {
  username: [
    { required: true, trigger: 'blur', message: '请输入用户名' },
    { validator: (_rule, value, callback) => {
      if (!validUsername(value)) {
        callback(new Error('请输入正确的用户名'))
      } else {
        callback()
      }
    }, trigger: 'blur' }
  ],
  password: [
    { required: true, trigger: 'blur', message: '请输入密码' },
    { min: 6, message: '密码长度至少为6位', trigger: 'blur' }
  ],
  captcha: [
    { required: true, trigger: 'blur', message: '请输入验证码' }
  ]
}

const handleLogin = async () => {
  if (!loginFormRef.value) return
  
  try {
    await loginFormRef.value.validate()
    
    // 验证码为空检查
    if (!loginForm.captcha.trim()) {
      ElMessage({
        message: '验证码不能为空',
        type: 'error',
        duration: 2000
      })
      return
    }
    
    loading.value = true
    
    // 这里应该是实际的登录API调用
    // 模拟登录成功
    setTimeout(() => {
      loading.value = false
      ElMessage({
        message: '登录成功',
        type: 'success',
        duration: 1000,
        showClose: false,
        onClose: () => {
          router.push('/home')
        }
      })
    }, 500)
  } catch (error) {
    console.error('登录验证失败', error)
    loading.value = false
  }
}

const goToForgetPassword = () => {
  router.push('/forgetpassword');
};

const goToRegister = () => {
  router.push('/register');
};
</script>

<style scoped>
.login-container {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100%;
  overflow: hidden;
}

.login-container::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('@/assets/login.jpg') no-repeat center center;
  background-size: cover;
  filter: blur(4px);
  z-index: -1;
  transform: scale(1.05); /* 稍微放大以避免模糊后边缘出现空白 */
}

.login-box {
  width: 350px;
  padding: 20px;
  background-color: rgba(255, 255, 255, 0.9); /* 增加半透明效果 */
  border-radius: 12px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15); /* 增强阴影效果 */
  position: relative; /* 修改为相对定位 */
  z-index: 1; /* 确保在背景图之上 */
  
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.login-header h2 {
  font-size: 20px;
  color: #303133;
  margin: 0;
}

.login-form {
  margin-top: 10px;
}

.login-form :deep(.el-form-item) {
  margin-bottom: 10px;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.captcha-section {
  display: flex;
  align-items: center;
  gap: 10px;
}

.captcha-image {
  cursor: pointer;
  height: 40px;
}

.login-button {
  width: 100%;
  margin-top: 5px;
}

.register-link {
  text-align: center;
  margin-top: 10px;
}
</style>