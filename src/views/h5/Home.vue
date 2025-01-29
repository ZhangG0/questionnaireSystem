<template>
  <div class="h5-home">
    <van-nav-bar
      title="问卷系统"
      right-text="退出"
      @click-right="handleLogout"
    />
    <div class="content">
      <h2>欢迎使用问卷系统</h2>
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
  router.push('/h5/login')
}
</script>

<style scoped lang="scss">
.h5-home {
  min-height: 100vh;
  background-color: #f7f8fa;

  .content {
    padding: 16px;
  }
}
</style> 