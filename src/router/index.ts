import { createRouter, createWebHistory } from 'vue-router'
import { getToken } from '@/utils/auth'
import { showToast } from 'vant'
import PCLayout from '@/layouts/PCLayout.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: 'login'
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
      path: '/login',
      name: 'h5Login',
      component: () => import('@/views/h5/Login.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/home',
      name: 'h5Home',
      component: () => import('@/views/h5/Home.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/survey',
      name: 'h5Survey',
      component: () => import('@/views/h5/Survey.vue'),
      meta: { requiresAuth: true }
    }
  ]
})

// 白名单路由
const whiteList = ['/pc/login', '/h5/login']

router.beforeEach((to, from, next) => {
  const hasToken = getToken()

  // H5 端路由处理
  if (to.path.startsWith('/h5')) {
    if (to.path === '/h5/login') {
      // 如果已登录且有重定向地址，则跳转到重定向地址
      if (hasToken && to.query.redirect) {
        next({ path: to.query.redirect as string })
      } else {
        next() // 否则正常进入登录页
      }
    } else {
      // 非登录页需要验证登录状态
      if (!hasToken) {
        showToast('请先登录')
        next(`/h5/login?redirect=${to.path}`)
      } else {
        next()
      }
    }
    return
  }

  // PC 端路由处理
  if (hasToken) {
    if (to.path === '/pc/login') {
      next({ path: '/pc/home' })
    } else {
      next()
    }
  } else {
    if (whiteList.includes(to.path)) {
      next()
    } else {
      next(`/pc/login?redirect=${to.path}`)
    }
  }
})

export default router
