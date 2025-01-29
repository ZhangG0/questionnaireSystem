import { createRouter, createWebHistory } from 'vue-router';
import { getToken } from '@/utils/auth';
import { showToast } from 'vant';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/h5/login'
    },
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
});

// 白名单路由
const whiteList = ['/h5/login'];

router.beforeEach((to, from, next) => {
  const hasToken = getToken();

  if (hasToken) {
    if (to.path === '/h5/login') {
      next({ path: '/h5/home' });
    } else {
      next();
    }
  } else {
    if (whiteList.includes(to.path)) {
      next();
    } else {
      showToast('请先登录');
      next(`/h5/login?redirect=${to.path}`);
    }
  }
});

export default router; 