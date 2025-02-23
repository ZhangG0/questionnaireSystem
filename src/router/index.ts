import { createRouter, createWebHistory } from 'vue-router'
import { getToken } from '@/utils/auth'
import { showToast } from 'vant'
import PCLayout from '@/layouts/PCLayout.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/pc/home'
    },
    // PC端路由
    {
      path: '/pc',
      component: PCLayout,
      children: [
        {
          path: 'home',
          name: 'pcHome',
          component: () => import('@/views/pc/Home.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: 'usersManagement',
          name: 'usersManagement',
          component: () => import('@/views/pc/UsersManagement.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: 'questionnaireManagement',
          name: 'questionnaireManagement',
          component: () => import('@/views/pc/QuestionnaireManagement.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: 'userDetail',
          name: 'userDetail',
          component: () => import('@/views/pc/UserDetail.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: 'questionnaireEdit',
          name: 'questionnaireEdit',
          component: () => import('@/views/pc/QuestionnaireEdit.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: 'questionnaireStats',
          name: 'questionnaireStats',
          component: () => import('@/views/pc/QuestionnaireStats.vue'),
          meta: { requiresAuth: true }
        }
      ]
    },
    {
      path: '/pc/login',
      name: 'pcLogin',
      component: () => import('@/views/pc/Login.vue'),
      meta: { requiresAuth: false }
    },
    // H5端路由
    {
      path: '/h5/login',
      name: 'h5Login',
      component: () => import('@/views/h5/Login.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/h5/home',
      name: 'h5Home',
      component: () => import('@/views/h5/Home.vue'),
      meta: { requiresAuth: true }
    }
  ]
})

// 白名单路由
const whiteList = ['/pc/login', '/h5/login']

router.beforeEach((to, from, next) => {
  const hasToken = getToken()

  if (hasToken) {
    if (to.path === '/h5/login') {
      next({ path: '/h5/home' })
    } else {
      next()
    }
  } else {
    if (whiteList.includes(to.path)) {
      next()
    } else {
      showToast('请先登录')
      next(`/h5/login?redirect=${to.path}`)
    }
  }
})

export default router
