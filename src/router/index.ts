import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/login' // Redirect the root path to the login page
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/login/index.vue'),
    children: [
      {
        path: '/login/forgetpassword',
        name: 'ForgetPassword',
        component: () => import('../views/login/forgetpassword.vue')
      },
      {
        path: '/login/register',
        name: 'RegisterCount',
        component: () => import('../views/login/register.vue')
      }
    ]
  },
  // 保留原有的独立路由以兼容可能的直接访问
  {
    path: '/forgetpassword',
    name: 'ForgetPasswordDirect',
    component: () => import('../views/login/forgetpassword.vue')
  },
  {
    path: '/register',
    name: 'RegisterDirect',
    component: () => import('../views/login/register.vue')
  },
  {
    path: '/',
    component: () => import('../layout/Layout.vue'),
    redirect: '/home',
    children: [
      {
        path: 'home',
        name: 'Home',
        component: () => import('../views/home/index.vue'),
        meta: { title: '首页', icon: 'House' }
      },
      {
        path: 'profile',
        name: 'UserProfile',
        component: () => import('../layout/components/Navbar/profile.vue'),
        meta: { title: '个人中心', icon: 'User' }
      },
      {
        path: 'user',
        name: 'UserService',
        component: () => import('../views/user/index.vue'),
        meta: { title: '用户服务', icon: 'User' },
        redirect: '/user/management',
        children: [
          {
            path: 'management',
            name: 'UserManagement',
            component: () => import('../views/user/management/index.vue'),
            meta: { title: '用户管理' }
          },
          {
            path: 'permission',
            name: 'PermissionManagement',
            component: () => import('../views/user/permission/index.vue'),
            meta: { title: '权限管理' }
          }
        ]
      },
      {
        path: 'team',
        name: 'TeamService',
        component: () => import('../views/team/index.vue'),
        meta: { title: '团队协作', icon: 'UserFilled' },
        redirect: '/team/management',
        children: [
          {
            path: 'management',
            name: 'TeamManagement',
            component: () => import('../views/team/management/index.vue'),
            meta: { title: '团队管理' }
          },
          {
            path: 'knowledge',
            name: 'TeamKnowledge',
            component: () => import('../views/team/knowledge/index.vue'),
            meta: { title: '团队知识库' }
          },
          {
            path: 'statistics',
            name: 'TeamStatistics',
            component: () => import('../views/team/statistics/index.vue'),
            meta: { title: '团队统计' }
          }
        ]
      },
      {
        path: 'community',
        name: 'CommunityService',
        component: () => import('../views/community/index.vue'),
        meta: { title: '社区服务', icon: 'ChatDotRound' }
      },
      {
        path: 'personal',
        name: 'PersonalKnowledgeBase',
        component: () => import('../views/personal/index.vue'),
        meta: { title: '个人知识库', icon: 'Promotion' }
      },
      {
        path: 'summary',
        name: 'TextSummary',
        component: () => import('../views/summary/index.vue'),
        meta: { title: '文本摘要', icon: 'Document' }
      },
      {
        path: 'statistics',
        name: 'DataStatistics',
        component: () => import('../views/statistics/index.vue'),
        meta: { title: '数据统计', icon: 'DataLine' }
      },
      {
        path: 'storage',
        name: 'FileStorage',
        component: () => import('../views/storage/index.vue'),
        meta: { title: '文件存储', icon: 'FolderOpened' }
      },
      {
        path: 'message',
        name: 'MessageService',
        component: () => import('../views/message/index.vue'),
        meta: { title: '消息推送', icon: 'Message' }
      },
      {
        path: 'version',
        name: 'VersionManagement',
        component: () => import('../views/version/index.vue'),
        meta: { title: '版本管理', icon: 'Management' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router