<template>
  <div class="nav-bar">
    <div class="left">
      <img :src="logo" alt="Noah Wang Studio" class="logo" />
    </div>
    <div class="right">
      <van-dropdown-menu>
        <van-dropdown-item v-model="value" :options="options" />
      </van-dropdown-menu>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { removeToken } from '@/utils/auth'
import logo from '@/assets/BlackWhiteBgLogo.jpg'

const router = useRouter()
const value = ref(0)

const options = [
  { text: '个人信息', value: 0 },
  { text: '退出登录', value: 1 }
]

const handleLogout = () => {
  removeToken()
  showToast('已退出登录')
  router.push('/pc/login')
}
</script>

<style scoped lang="scss">
.nav-bar {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;

  .left {
    .logo {
      height: 40px;
      width: auto;
    }
  }

  .right {
    display: flex;
    align-items: center;
  }
}
</style> 