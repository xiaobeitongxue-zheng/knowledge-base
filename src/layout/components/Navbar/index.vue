<template>
  <div class="navbar-container">
    <div class="navbar-left">
      <el-icon class="home-icon" @click="goToHome"><HomeFilled /></el-icon>
      <span class="navbar-title" @click="goToHome">返回首页</span>
    </div>
    <div class="navbar-right">
      <!-- 通知铃铛 -->
      <div class="notification-bell" @click="goToMessage">
        <el-badge :value="unreadCount" :hidden="unreadCount === 0" :max="99" class="notification-badge">
          <el-icon class="bell-icon"><Bell /></el-icon>
        </el-badge>
      </div>
      
      <el-icon class="fullscreen-icon" @click="toggleFullscreen">
        <FullScreen />
      </el-icon>
      <el-dropdown>
        <span class="el-dropdown-link">
          <el-avatar :size="30" :src="userStore.state.avatar" />
          {{ userStore.state.username }}
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item @click="goToProfile">个人中心</el-dropdown-item>
            <el-dropdown-item @click="logout">退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElAvatar } from 'element-plus';
import userStore from '@/store/user';
import messageStore from '@/store/message';
import { HomeFilled, FullScreen, Bell } from '@element-plus/icons-vue';

const router = useRouter();

// 获取未读消息数量
const unreadCount = computed(() => messageStore.unreadCount.value);

const goToProfile = () => {
  router.push('/profile'); // 修改跳转路径为个人中心页面
};

const logout = () => {
  router.push('/login');
  ElMessage({
    message: '已退出登录',
    type: 'success',
    duration: 2000,
  });
};

const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
  } else if (document.exitFullscreen) {
    document.exitFullscreen();
  }
};

const goToHome = () => {
  router.push('/home');
};

// 前往消息页面
const goToMessage = () => {
  router.push('/message');
};
</script>

<style scoped>
.navbar-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 50px;
  padding: 0 20px;
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(162, 208, 114, 0.1);
}

.navbar-left {
  display: flex;
  align-items: center;
  gap: 5px;
}

.navbar-title {
  font-size: 14px;
  font-weight: bold;
  color: #4c5059;
  cursor: pointer;
}

.navbar-right {
  display: flex;
  align-items: center;
  gap: 15px;
}

/* 通知铃铛样式 */
.notification-bell {
  position: relative;
  cursor: pointer;
}

.bell-icon {
  font-size: 20px;
  color: #606266;
  transition: color 0.3s;
}

.notification-bell:hover .bell-icon {
  color: #409EFF;
}

/* 徽章样式 - 紧贴铃铛右上角 */
:deep(.el-badge__content) {
  background-color: #f56c6c;
  border: none;
}

:deep(.notification-badge .el-badge__content.is-fixed) {
  top: 0;
  right: 0;
  transform: translateY(-30%) translateX(25%);
  z-index: 2;
  font-size: 8px;
  padding: 0;
  height: 13px;
  width: 13px;
  line-height: 16px;
  text-align: center;
  border-radius: 50%;
}

.el-dropdown-link {
  display: flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
  color: #606266;
}

.el-avatar {
  border-radius: 50%;
}

.el-icon {
  cursor: pointer;
}

.home-icon {
  font-size: 25px;
  color: #323637;
  cursor: pointer;
}

.fullscreen-icon {
  font-size: 20px;
  color: #606266;
  cursor: pointer;
  transition: color 0.3s;
}

.fullscreen-icon:hover {
  color: #409EFF;
}
</style>