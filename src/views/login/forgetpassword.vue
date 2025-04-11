<template>
  <div class="forget-password-container">
    <div class="forget-password-box">
      <img src="@/assets/wangjimima.png" alt="忘记密码" class="forget-password-image" />
      <h2 class="forget-password-title">忘记密码</h2>
      <p class="forget-password-subtitle">请输入您的注册邮箱，我们会发送重置密码的链接。</p>
      <el-form :model="form" :rules="rules" ref="formRef" class="forget-password-form">
        <el-form-item label="邮箱地址" prop="email">
          <el-input v-model="form.email" placeholder="example@example.com" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" class="submit-button" @click="handleSubmit">发送重置链接</el-button>
        </el-form-item>
      </el-form>
      <el-link :underline="false" class="back-to-login" @click="goToLogin">返回登录</el-link>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import { useRouter } from 'vue-router';

const router = useRouter();
const formRef = ref();
const form = ref({
  email: ''
});

const rules = ref({
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入有效的邮箱地址', trigger: ['blur', 'change'] }
  ]
});

const handleSubmit = () => {
  formRef.value?.validate((valid) => {
    if (valid) {
      ElMessage.success('重置链接已发送，请检查您的邮箱');
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
.forget-password-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #eaf4ff;
}

.forget-password-box {
  width: 400px;
  padding: 30px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.forget-password-image {
  width: 50px; /* 调整为之前的一半大小 */
  height: auto;
  margin-bottom: 0px; /* 缩小图片与其他元素之间的距离 */
}

.icon-container {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 20px;
}

.icon {
  width: 48px;
  height: 48px;
  color: #409eff;
}

.forget-password-title {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 10px;
}

.forget-password-subtitle {
  font-size: 14px;
  color: #666;
  margin-bottom: 20px;
}

.submit-button {
  width: 100%;
  height: 40px;
}

.back-to-login {
  display: block;
  margin-top: 20px;
  font-size: 14px;
  border-bottom: none !important;
  color: #409eff;
  cursor: pointer; 
}
</style>