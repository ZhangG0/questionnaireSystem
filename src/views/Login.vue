<template>
  <div class="login-container">
    <div class="login-box">
      <div class="login-title">
        <h2>问卷管理系统</h2>
      </div>
      <a-form :model="loginForm" class="login-form" @submit="handleSubmit">
        <a-form-item field="username" label="用户名">
          <a-input v-model="loginForm.username" placeholder="请输入用户名">
            <template #prefix>
              <icon-user />
            </template>
          </a-input>
        </a-form-item>
        <a-form-item field="password" label="密码">
          <a-input-password v-model="loginForm.password" placeholder="请输入密码">
            <template #prefix>
              <icon-lock />
            </template>
          </a-input-password>
        </a-form-item>
        <div class="login-options">
          <a-checkbox v-model="rememberMe">记住我</a-checkbox>
          <a-link>忘记密码？</a-link>
        </div>
        <a-button type="primary" html-type="submit" long :loading="loading"> 登录 </a-button>
      </a-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import { setToken } from '@/utils/auth'

const router = useRouter()
const loading = ref(false)
const rememberMe = ref(false)

const loginForm = reactive({
  username: '',
  password: ''
})

const handleSubmit = async () => {
  loading.value = true
  try {
    // 这里添加实际的登录逻辑
    await new Promise(resolve => setTimeout(resolve, 1000))

    // 模拟获取 token，实际项目中应该是从后端获取
    const token = 'mock_token_' + Date.now()
    setToken(token)

    Message.success('登录成功')

    // 获取重定向地址
    const redirect = router.currentRoute.value.query.redirect as string
    router.push(redirect || '/')
  } catch (error) {
    Message.error('登录失败')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="scss">
.login-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: var(--color-fill-2);
}

.login-box {
  width: 400px;
  padding: 40px;
  background: var(--color-bg-2);
  border-radius: 4px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.login-title {
  text-align: center;
  margin-bottom: 40px;

  h2 {
    margin: 0;
    font-size: 24px;
    color: var(--color-text-1);
  }
}

.login-form {
  .login-options {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }
}
</style>
