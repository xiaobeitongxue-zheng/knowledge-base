<template>
  <div class="app-container">
    <!-- 侧边栏 -->
    <el-aside width="190px" class="sidebar-container" :class="{ 'is-collapsed': isCollapse }">
      <div class="logo-container">
        <img src="@/assets/zhishi.png" alt="Logo" class="logo-image" />
        <span v-if="!isCollapse" class="logo-text">企业知识库</span>
      </div>
      
      <el-scrollbar :class="{ 'hide-scrollbar': !showScrollbar }">
        <el-menu
          :default-active="activeMenu"
          class="el-menu-vertical"
          :collapse="isCollapse"
          background-color="transparent"
          text-color="#ffffff"
          active-text-color="#f0f8ff"
          router
          @click="showScrollbar = true"
        >
         
          <!-- AI助手 -->
          <el-menu-item index="/home">
            <el-icon><ChatLineRound /></el-icon>
            <span>AI助手</span>
          </el-menu-item>
          
          <!-- 个人知识库管理 -->
          <el-menu-item index="/personal">
            <el-icon><UserFilled /></el-icon>
            <span>个人知识库</span>
          </el-menu-item>
          
          <!-- 团队协作 -->
          <el-sub-menu index="/team">
            <template #title>
              <el-icon><Service /></el-icon>
              <span>团队协作</span>
            </template>
            <el-menu-item index="/team/knowledge">团队知识库</el-menu-item>
            <el-menu-item index="/team/management">团队管理</el-menu-item>
            <el-menu-item index="/team/statistics">团队统计</el-menu-item>
          </el-sub-menu>

           <!-- 社区交流 -->
           <el-menu-item index="/community">
            <el-icon><Promotion /></el-icon>
            <span>社区交流</span>
          </el-menu-item>

          <!-- 用户中心 -->
          <el-sub-menu index="/user">
            <template #title>
              <el-icon><User /></el-icon>
              <span>用户中心</span>
            </template>
            <el-menu-item index="/user/management">用户管理</el-menu-item>
            <el-menu-item index="/user/permission">权限设置</el-menu-item>
          </el-sub-menu>
        </el-menu>
      </el-scrollbar>
    </el-aside>

    <!-- 主内容区域 -->
    <el-container class="main-container">
      <!-- 顶部导航栏 -->
      <navbar />
      
      <!-- 页面内容区 -->
      <el-main class="app-main">
        <router-view v-slot="{ Component }">
          <transition name="fade-transform" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </el-main>

      <!-- 页脚 -->
      <footer-bar />
    </el-container>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import Navbar from './components/Navbar/index.vue'
import FooterBar from './components/Footer/index.vue'
import { Document, Reading, Search, UserFilled, ChatLineRound, Promotion, FolderOpened, Timer, User, DataLine, Service, Star } from '@element-plus/icons-vue'

// 路由相关
const route = useRoute()

// 侧边栏折叠状态
const isCollapse = ref(false)

// 滚动条显示状态
const showScrollbar = ref(false)

// 当前激活的菜单项
const activeMenu = computed(() => {
  const { meta, path } = route
  if (meta.activeMenu) {
    return meta.activeMenu
  }
  return path
})
</script>

<style scoped>
.app-container {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

.sidebar-container {
  /* background-image: url('@/assets/jb.jpg'); */
  background-size: cover;
  background-position: center;
  transition: width 0.28s;
  width: 190px;
  overflow: hidden;
  position: relative;
}

.sidebar-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(75, 150, 215, 0.75);
  z-index: 1;
}

.sidebar-container.is-collapsed {
  width: 64px;
}

.logo-container {
  display: flex;
  align-items: center;
  height: 50px;
  padding: 0 15px;
  color: #fff;
  position: relative;
  z-index: 2;
  background-color: #fff;
}

.logo-image {
  width: 32px;
  height: 32px;
  margin-right: 10px;
}

.logo-text {
  font-size: 16px;
  font-weight: bold;
  white-space: nowrap;
  overflow: hidden;
  color: #0b0b0b;
}

.el-scrollbar {
  height: calc(100% - 60px);
  position: relative;
  z-index: 2;
}

.hide-scrollbar :deep(.el-scrollbar__bar) {
  opacity: 50;
  transition: opacity 0.3s;
}

.el-menu-vertical {
  border-right: none;
}

.el-menu-vertical:not(.el-menu--collapse) {
  width: 190px;
}

/* 确保菜单项在透明背景上可见 */
:deep(.el-menu) {
  background-color: transparent !important;
}

:deep(.el-menu-item.is-active) {
  background-color: rgba(255, 255, 255, 0.3) !important;
}

:deep(.el-menu-item:hover), :deep(.el-sub-menu__title:hover) {
  background-color: rgba(255, 255, 255, 0.163) !important;
}

/* 调整菜单项之间的距离，缩小1px */
:deep(.el-menu-item), :deep(.el-sub-menu__title) {
  height: 49px;  /* 再减少1px，从55px到54px */
  line-height: 54px;  /* 行高也需要同步调整 */
}

:deep(.el-menu--collapse .el-menu-item), :deep(.el-menu--collapse .el-sub-menu__title) {
  height: 54px;  /* 折叠模式下也保持一致 */
}

:deep(.el-sub-menu .el-menu-item) {
  height: 48px;  /* 子菜单项从49px减少到48px */
  line-height: 48px;
  min-width: auto;
  padding-left: 50px !important; /* 确保子菜单项文字与左侧对齐 */
}

:deep(.el-sub-menu__title) {
  padding-left: 20px !important; /* 确保子菜单标题与子菜单项对齐 */
}

:deep(.el-menu-item) {
  display: flex;
  align-items: center;
  gap: 3px; /* 减少图标和文字之间的间距 */
}

:deep(.el-menu-item .el-icon) {
  font-size: 18px; /* 确保图标大小一致 */
}

.main-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.app-main {
  padding: 20px;
  background-color: #f0f2f5;
  overflow: auto;
  flex: 1;
}

/* 页面切换动画 */
.fade-transform-enter-active,
.fade-transform-leave-active {
  transition: all 0.3s;
}

.fade-transform-enter-from {
  opacity: 0;
  transform: translateX(-30px);
}

.fade-transform-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

/* 修改 .navbar 和 .sidebar 的高度为一致 */
.navbar {
  height: 60px; /* 确保与 .sidebar 一致的高度 */
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  background-color: #fff;
  border-bottom: 1px solid #eaeaea;
}

.sidebar {
  height: 60px; /* 确保与 .navbar 一致的高度 */
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #2c3e50;
  color: #fff;
}
</style>