<template>
  <div class="h5-login">
    <div class="login-header">
      <img :src="logo" alt="Noah Wang Studio" class="logo" />
      <h2 class="title">Noah Wang STUDIO</h2>
      <p class="subtitle">问卷调查系统</p>
    </div>

    <div class="login-form">
      <van-form @submit="handleSubmit">
        <van-cell-group inset>
          <van-field
            v-model="loginForm.userAccount"
            name="userAccount"
            label="账号"
            placeholder="请输入账号"
            :rules="[{ required: true, message: '请输入账号' }]"
          >
            <template #left-icon>
              <van-icon name="user-o" />
            </template>
          </van-field>
          <van-field
            v-model="loginForm.userPassword"
            type="password"
            name="userPassword"
            label="密码"
            placeholder="请输入密码"
            :rules="[{ required: true, message: '请输入密码' }]"
          >
            <template #left-icon>
              <van-icon name="lock" />
            </template>
          </van-field>
        </van-cell-group>

        <div class="form-actions">
          <van-button
            round
            block
            type="primary"
            native-type="submit"
            :loading="loading"
            size="large"
          >
            登录
          </van-button>
        </div>
      </van-form>
    </div>

    <div class="login-footer">
      <p class="copyright">© {{ new Date().getFullYear() }} Noah Wang Studio. All rights reserved.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast } from 'vant'
import { setToken } from '@/utils/auth'
import { h5Login } from '@/api/auth'
import type { H5LoginParams } from '@/types/auth'
import logo from '@/assets/logo.jpg'

const router = useRouter()
const route = useRoute()
const loading = ref(false)

// 登录表单
const loginForm = reactive<H5LoginParams>({
  userAccount: '',
  userPassword: '',
  // 如果 URL 中有这些参数，则添加到登录请求中
  issueId: route.query.surveyIssueId as string,
  surveyId: route.query.surveyId as string
})

// 处理登录
const handleSubmit = async () => {
  loading.value = true
  try {
    const response = await h5Login(loginForm)
    if (response?.accessToken) {
      setToken(response.accessToken)
      showToast({
        type: 'success',
        message: '登录成功',
        duration: 1000,
        onClose: () => {
          // 如果有问卷 ID，直接跳转到问卷页面
          if (loginForm.surveyId) {
            router.replace(`/survey?id=${loginForm.surveyId}`)
          } else {
            // 否则跳转到首页或重定向地址
            const redirect = route.query.redirect as string
            router.replace(redirect || '/home')
          }
        }
      })
    }
  } catch (error: any) {
    showToast({
      type: 'fail',
      message: error?.message || '登录失败'
    })
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="scss">
.h5-login {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  display: flex;
  flex-direction: column;
  padding: 40px 20px;

  .login-header {
    text-align: center;
    margin-bottom: 48px;

    .logo {
      width: 80px;
      height: 80px;
      border-radius: 16px;
      margin-bottom: 16px;
    }

    .title {
      font-size: 24px;
      font-weight: 600;
      color: #333;
      margin: 0 0 8px;
    }

    .subtitle {
      font-size: 16px;
      color: #666;
      margin: 0;
    }
  }

  .login-form {
    margin-bottom: auto;

    :deep(.van-cell-group) {
      border-radius: 12px;
      overflow: hidden;
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(10px);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
    }

    :deep(.van-field) {
      padding: 16px;
    }

    :deep(.van-field__label) {
      width: 48px;
      color: #333;
    }

    :deep(.van-field__left-icon) {
      margin-right: 8px;
      color: #666;
    }

    .form-actions {
      margin-top: 24px;
      padding: 0 16px;

      :deep(.van-button) {
        height: 44px;
        font-size: 16px;
        background: linear-gradient(135deg, #ffd700 0%, #b8860b 100%);
        border: none;
        box-shadow: 0 4px 12px rgba(184, 134, 11, 0.2);

        &.van-button--loading {
          opacity: 0.8;
        }
      }
    }
  }

  .login-footer {
    text-align: center;
    margin-top: 40px;

    .copyright {
      font-size: 12px;
      color: #666;
      opacity: 0.8;
    }
  }
}
</style>
