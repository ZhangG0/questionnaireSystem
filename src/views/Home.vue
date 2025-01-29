<template>
  <div>
    <van-nav-bar title="首页" />
    <div class="content">
      <h1>问卷系统</h1>
      <van-button type="danger" @click="handleLogout">退出登录</van-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { removeToken } from '@/utils/auth'

const router = useRouter()

const handleLogout = () => {
  removeToken()
  showToast('已退出登录')
  router.push('/login')
}
</script>

<style scoped>
.content {
  padding: 16px;
}
</style> 