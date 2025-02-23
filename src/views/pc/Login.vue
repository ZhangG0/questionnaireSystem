<template>
  <div class="pc-login">
    <div class="login-container">
      <div class="left-panel">
        <div class="logo">
          <img :src="logo" alt="Noah Wang Studio" />
        </div>
      </div>
      <div class="right-panel">
        <h1 class="welcome-text">欢迎登录Noah Wang STUDIO 后台管理平台</h1>
        <van-form @submit="handleSubmit" class="login-form">
          <van-field
            v-model="loginForm.userAccount"
            name="userAccount"
            placeholder="请输入登录账号"
            :rules="[{ required: true, message: '请填写登录账号' }]"
            class="custom-input"
          />
          <van-field
            v-model="loginForm.userPassword"
            type="password"
            name="userPassword"
            placeholder="请输入登录密码"
            :rules="[{ required: true, message: '请填写登录密码' }]"
            class="custom-input"
          />
          <div class="submit-btn">
            <van-button
              round
              block
              type="primary"
              native-type="submit"
              :loading="loading"
              class="login-button"
            >
              立即登录
            </van-button>
          </div>
        </van-form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { setToken } from '@/utils/auth'
import type { LoginParams } from '@/types/auth'
import { login } from '@/api/auth'
import img from '@/assets/logo.jpg'

const router = useRouter()
const loading = ref(false)
const logo = img

const loginForm = reactive<LoginParams>({
  userAccount: '',
  userPassword: ''
})

const handleSubmit = async () => {
  loading.value = true
  try {
    const response = await login(loginForm)
    console.log(response)
    setToken(response?.accessToken)
    showToast('登录成功')
    router.push('/pc/home')
  } catch (error: any) {
    showToast(error?.message || '登录失败')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="scss">
.pc-login {
  height: 100vh;
  width: 100vw;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #1c1c1c;

  .login-container {
    display: flex;
    width: 1000px;
    height: 600px;
    background: #2a2a2a;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  }

  .left-panel {
    flex: 1;
    background: #1c1c1c;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40px;

    .logo {
      width: 100%;
      max-width: 300px;
      img {
        width: 100%;
        height: auto;
      }
    }
  }

  .right-panel {
    flex: 1;
    padding: 40px;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .welcome-text {
    color: #ffffff;
    font-size: 24px;
    margin-bottom: 40px;
    text-align: center;
  }

  .login-form {
    width: 100%;
    max-width: 360px;
    margin: 0 auto;

    :deep(.custom-input) {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      margin-bottom: 20px;

      .van-field__control {
        color: #ffffff;
        &::placeholder {
          color: rgba(255, 255, 255, 0.5);
        }
      }
    }

    .submit-btn {
      margin-top: 40px;
    }

    .login-button {
      height: 44px;
      font-size: 16px;
      background: linear-gradient(135deg, #ffd700 0%, #b8860b 100%);
      border: none;

      &:active {
        opacity: 0.9;
      }
    }
  }
}
</style> 