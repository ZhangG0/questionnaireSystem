<template>
  <div class="h5-login">
    <van-nav-bar title="登录" />
    <div class="form-content">
      <van-form @submit="handleSubmit">
        <van-cell-group inset>
          <van-field
            v-model="loginForm.username"
            name="username"
            label="用户名"
            placeholder="请输入用户名"
            :rules="[{ required: true, message: '请填写用户名' }]"
          />
          <van-field
            v-model="loginForm.password"
            type="password"
            name="password"
            label="密码"
            placeholder="请输入密码"
            :rules="[{ required: true, message: '请填写密码' }]"
          />
        </van-cell-group>
        <div style="margin: 16px">
          <van-button round block type="primary" native-type="submit" :loading="loading">
            登录
          </van-button>
        </div>
      </van-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { setToken } from '@/utils/auth'

const router = useRouter()
const loading = ref(false)

const loginForm = reactive({
  username: '',
  password: ''
})

const handleSubmit = async () => {
  loading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    const token = 'mock_token_' + Date.now()
    setToken(token)
    showToast('登录成功')
    router.push('/')
  } catch (error) {
    showToast('登录失败')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="scss">
.h5-login {
  min-height: 100vh;
  background-color: #f7f8fa;

  .form-content {
    padding: 20px 16px;
  }
}
</style> 