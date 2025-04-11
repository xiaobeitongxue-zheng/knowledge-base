<template>
  <div class="register-container">
    <div class="register-box">
      <h2 class="register-title">注册新账号</h2>
      <p class="register-subtitle">请填写以下信息完成注册</p>

      <el-form ref="registerFormRef" :model="registerForm" :rules="registerRules" class="register-form">
        <el-form-item prop="username">
          <el-input
            v-model="registerForm.username"
            placeholder="请输入用户名"
            prefix-icon="User"
            clearable
            class="custom-input"
          />
        </el-form-item>

        <el-form-item prop="email">
          <el-input
            v-model="registerForm.email"
            placeholder="请输入邮箱"
            prefix-icon="Message"
            clearable
            class="custom-input"
          />
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="registerForm.password"
            type="password"
            placeholder="请输入密码"
            prefix-icon="Lock"
            show-password
            clearable
            class="custom-input"
          />
        </el-form-item>

        <el-form-item prop="confirmPassword">
          <el-input
            v-model="registerForm.confirmPassword"
            type="password"
            placeholder="请确认密码"
            prefix-icon="Lock"
            show-password
            clearable
            class="custom-input"
          />
        </el-form-item>

        <el-form-item prop="captcha">
          <div class="captcha-section">
            <el-input
              v-model="registerForm.captcha"
              placeholder="请输入验证码"
              prefix-icon="Key"
              clearable
              class="captcha-input"
            />
            <img :src="captchaUrl" alt="验证码" class="captcha-image" @click="refreshCaptcha" />
          </div>
        </el-form-item>

        <el-form-item>
          <div class="button-group">
            <el-button type="primary" class="register-button" @click="handleRegister">
              注册
            </el-button>
            <el-button class="cancel-button" @click="goToLogin">
              取消
            </el-button>
          </div>
        </el-form-item>

        <div class="register-links">
          <el-link type="primary" :underline="false" @click="goToLogin">已有账号？登录</el-link>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';

const router = useRouter();
const registerFormRef = ref();
const registerForm = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  captcha: '',
});

const captchaUrl = ref('/api/captcha');
const refreshCaptcha = () => {
  captchaUrl.value = `/api/captcha?${Date.now()}`;
};

const registerRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入有效的邮箱地址', trigger: ['blur', 'change'] },
  ],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
      validator: (rule, value) => {
        if (value !== registerForm.password) {
          return new Error('两次输入的密码不一致');
        }
        return true;
      },
      trigger: 'blur',
    },
  ],
  captcha: [{ required: true, message: '请输入验证码', trigger: 'blur' }],
};

const handleRegister = () => {
  registerFormRef.value?.validate((valid) => {
    if (valid) {
      ElMessage.success('注册成功');
      router.push('/login');
    } else {
      ElMessage.error('请检查表单填写是否正确');
    }
  });
};

const goToLogin = () => {
  router.push('/login');
};
</script>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #eaf4ff; /* 修改为与忘记密码页面相同的背景色 */
}

.register-box {
  width: 400px; /* 将宽度从320px调大到360px */
  padding: 25px;
  background: #fff;
  border-radius: 12px; /* 增加圆角，使其比忘记密码页面更圆一些 */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); /* 与忘记密码页面一致的阴影效果 */
  text-align: center;
  transform: scale(0.85); /* 整体缩放为原来的85%大小 */
  transform-origin: center center;
}

.custom-input {
  width: 80%;
  margin: 0 auto;
}

.register-title {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 10px;
}

.register-subtitle {
  font-size: 14px;
  color: #666;
  margin-bottom: 20px;
}

.captcha-section {
  display: flex;
  align-items: center;
  gap: 20px;
  width: 80%;
  margin: 0 auto;
}

.captcha-input {
  flex: 1;
}

.captcha-image {
  width: 100px;
  height: 40px; /* 保持与输入框高度一致 */
  cursor: pointer;
  border: 1px solid #ddd;
  border-radius: 4px;
  object-fit: cover; /* 确保图片填满容器 */
}

.register-button {
  width: 70px;
  height: 40px;
}

.cancel-button {
  width: 70px;
  height: 40px;
}

.button-group {
  display: flex;
  justify-content: center;
  gap: 10px;
  width: 80%;
  margin: 0 auto;
}

.register-links {
  margin-top: 10px;
}

.register-links :deep(.el-link) {
  text-decoration: none !important; /* 删除鼠标悬停时的下划线 */
}
</style>