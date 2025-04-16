<template>
  <div class="profile-container">
    <el-card class="profile-card" :body-style="{ padding: '30px' }">
      <div class="avatar-section">
        <div class="avatar-wrapper">
          <el-avatar :size="60" :src="avatarUrl" @click="triggerFileInput" />
          <el-button circle class="edit-avatar" icon="Edit" type="primary" size="small" @click="triggerFileInput"></el-button>
        </div>
        <p>点击头像可以上传本地图片</p>
        <!-- 隐藏的文件输入 -->
        <input
          type="file"
          ref="fileInput"
          style="display: none"
          accept="image/*"
          @change="handleFileChange"
        />
      </div>

      <!-- 图片上传预览对话框 -->
      <el-dialog v-model="dialogVisible" title="头像预览" width="400px" center>
        <div class="avatar-preview">
          <img v-if="tempAvatarUrl" :src="tempAvatarUrl" alt="头像预览" />
        </div>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="cancelUpload">取消</el-button>
            <el-button type="primary" @click="confirmUpload">确认</el-button>
          </span>
        </template>
      </el-dialog>

      <el-form label-width="100px" class="profile-form">
        <el-form-item label="姓名" required>
          <el-input v-model="profile.name"></el-input>
        </el-form-item>
        <el-form-item label="电子邮箱" required>
          <el-input v-model="profile.email"></el-input>
        </el-form-item>
        <el-form-item label="手机号码">
          <el-input v-model="profile.phone"></el-input>
        </el-form-item>
        <el-form-item label="性别" required>
          <el-radio-group v-model="profile.gender">
            <el-radio label="男">男</el-radio>
            <el-radio label="女">女</el-radio>
            <el-radio label="其他">其他</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="生日" required>
          <el-date-picker v-model="profile.birthday" type="date" placeholder="选择日期"></el-date-picker>
        </el-form-item>
        <el-form-item label="个人简介">
          <el-input type="textarea" v-model="profile.bio" rows="3"></el-input>
        </el-form-item>
        <el-form-item label="地址">
          <el-input v-model="profile.address"></el-input>
        </el-form-item>
        <el-form-item class="buttons-container">
          <div class="buttons-wrapper">
            <el-button type="primary" @click="saveProfile">保存修改</el-button>
            <el-button @click="cancelEdit">取消</el-button>
          </div>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import { useRouter } from 'vue-router';
import userStore from '@/store/user';

const router = useRouter();

const profile = ref({
  name: '千寻',
  email: 'zhangsan@bjtu.edu.cn',
  phone: '13800138000',
  gender: '女',
  birthday: '2000-01-01',
  bio: '我是一名软件工程师，喜欢编程和旅行。在空闲时间，我喜欢阅读和学习新技术。',
  address: '北京市海淀区上园村3号',
});

// 头像相关
const fileInput = ref<HTMLInputElement | null>(null);
const avatarUrl = ref(userStore.state.avatar); // 使用user store中的头像
const tempAvatarUrl = ref('');
const dialogVisible = ref(false);
const avatarUpdated = ref(false); // 跟踪头像是否已更新

// 触发文件选择
const triggerFileInput = () => {
  if (fileInput.value) {
    fileInput.value.click();
  }
};

// 处理文件选择
const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  
  if (file) {
    // 检查文件是否为图片
    if (!file.type.startsWith('image/')) {
      ElMessage.error('请选择图片文件');
      return;
    }
    
    // 检查文件大小 (限制为2MB)
    if (file.size > 2 * 1024 * 1024) {
      ElMessage.error('图片大小不能超过2MB');
      return;
    }
    
    // 创建临时URL并显示预览对话框
    tempAvatarUrl.value = URL.createObjectURL(file);
    dialogVisible.value = true;
  }
  
  // 清除输入，以便于再次选择同一文件
  if (fileInput.value) {
    fileInput.value.value = '';
  }
};

// 取消上传
const cancelUpload = () => {
  dialogVisible.value = false;
  // 如果有临时URL，释放它
  if (tempAvatarUrl.value) {
    URL.revokeObjectURL(tempAvatarUrl.value);
    tempAvatarUrl.value = '';
  }
};

// 确认上传
const confirmUpload = () => {
  // 在实际应用中，这里应该调用API上传图片到服务器
  // 现在我们只是将临时URL设置为当前头像
  avatarUrl.value = tempAvatarUrl.value;
  avatarUpdated.value = true; // 标记头像已更新
  dialogVisible.value = false;
  ElMessage.success('头像已更新，请点击"保存修改"保存所有更改');
};

const saveProfile = () => {
  // 如果头像已更新，则更新store中的头像
  if (avatarUpdated.value) {
    userStore.updateAvatar(avatarUrl.value);
    avatarUpdated.value = false; // 重置状态
  }
  
  // 更新用户信息
  userStore.updateUserInfo({
    username: profile.value.name,
    email: profile.value.email
  });
  
  // 模拟API调用保存所有更改
  setTimeout(() => {
    ElMessage.success('个人信息保存成功');
  }, 500);
  
  console.log('保存修改', profile.value);
};

const cancelEdit = () => {
  // 如果有临时URL，释放它
  if (tempAvatarUrl.value) {
    URL.revokeObjectURL(tempAvatarUrl.value);
    tempAvatarUrl.value = '';
  }
  
  // 重置头像为store中的值
  avatarUrl.value = userStore.state.avatar;
  avatarUpdated.value = false; // 重置状态
  
  // 导航回首页（确保跳转到首页而不是登录页面）
  router.push('/home');
  
  console.log('取消修改');
};
</script>

<style scoped>
.profile-container {
  padding: 20px;
  display: flex;
  justify-content: center;
}

.profile-card {
  width: 400px;
  border-radius: 20px;
}

.avatar-section {
  text-align: center;
  margin-bottom: 30px;
}

.avatar-wrapper {
  position: relative;
  display: inline-block;
  margin-bottom: 10px;
}

.avatar-section .el-avatar {
  cursor: pointer; /* 添加指针样式，提示可点击 */
}

.edit-avatar {
  position: absolute;
  right: -5px;
  bottom: -5px;
  font-size: 12px;
  border: 2px solid #fff;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

.profile-form .el-form-item {
  margin-bottom: 20px;
}

.profile-form .el-form-item:last-child {
  text-align: center;
  margin-bottom: 0;
}

.avatar-preview {
  display: flex;
  justify-content: center;
  align-items: center;
 

  margin: 0 auto;
 
  overflow: hidden;
}

.avatar-preview img {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 50%;
  border: 1px solid #f4f4f7;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.buttons-container {
  margin-top: 30px !important;
  display: flex;
  justify-content: center;
  width: 100%;
}

.buttons-wrapper {
  display: flex;
  justify-content: center;
  gap: 20px;
}
</style>