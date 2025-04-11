<template>
  <el-breadcrumb class="app-breadcrumb" separator="/">
    <transition-group name="breadcrumb">
      <el-breadcrumb-item v-for="(item, index) in levelList" :key="item.path">
        <span 
          v-if="item.redirect === 'noRedirect' || index === levelList.length - 1" 
          class="no-redirect"
        >
          {{ item.meta?.title }}
        </span>
        <a v-else @click.prevent="handleLink(item)">{{ item.meta?.title }}</a>
      </el-breadcrumb-item>
    </transition-group>
  </el-breadcrumb>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue'
import { useRoute, useRouter, RouteLocationMatched } from 'vue-router'

const route = useRoute()
const router = useRouter()

const levelList = ref<RouteLocationMatched[]>([])

// 过滤路由 - 只获取有meta.title属性的路由
const getBreadcrumb = () => {
  let matched = route.matched.filter(item => item.meta && item.meta.title)
  
  // 如果没有匹配到首页，则手动添加
  const first = matched[0]
  if (first && first.path !== '/home') {
    matched = [
      {
        path: '/home',
        meta: { title: '首页' }
      } as unknown as RouteLocationMatched
    ].concat(matched)
  }
  
  levelList.value = matched
}

// 链接点击处理
const handleLink = (item: RouteLocationMatched) => {
  const { path, redirect } = item
  if (redirect) {
    router.push(redirect as string)
    return
  }
  router.push(path)
}

// 首次加载
getBreadcrumb()

// 监听路由变化
watch(
  () => route.path,
  () => getBreadcrumb(),
  { immediate: true }
)
</script>

<style lang="scss" scoped>
.app-breadcrumb {
  display: inline-block;
  font-size: 14px;
  line-height: 50px;
  margin-left: 8px;

  .no-redirect {
    color: #97a8be;
    cursor: text;
  }
}

// 面包屑动画
.breadcrumb-enter-active,
.breadcrumb-leave-active {
  transition: all 0.5s;
}

.breadcrumb-enter-from,
.breadcrumb-leave-to {
  opacity: 0;
  transform: translateX(20px);
}
</style> 