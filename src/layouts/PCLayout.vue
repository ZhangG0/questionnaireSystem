<template>
  <div class="pc-layout">
    <header class="header">
      <div class="left">
        <img :src="logo" alt="Noah Wang Studio" class="logo" />
        <span class="system-title">Wang Studio 管理后台</span>
      </div>
      <div class="right">
        <a-dropdown trigger="hover">
          <div class="user-info">
            <a-avatar :size="32" class="avatar">
              <icon-user />
            </a-avatar>
            <span class="username">{{ userInfo.userName || userInfo.userAccount }}</span>
            <icon-down :size="14" class="down-icon" />
          </div>
          <template #content>
            <a-doption @click="showChangePasswordModal = true">修改密码</a-doption>
            <a-doption @click="handleLogout">退出登录</a-doption>
          </template>
        </a-dropdown>
      </div>
    </header>
    <div class="main-wrapper">
      <aside class="sidebar">
        <SideMenu />
      </aside>
      <main class="content">
        <router-view></router-view>
      </main>
    </div>

    <!-- 修改密码弹窗 -->
    <a-modal
      v-model:visible="showChangePasswordModal"
      title="修改密码"
      @ok="handleChangePassword"
      @cancel="resetForm"
      :mask-closable="false"
    >
      <a-form
        ref="formRef"
        :model="passwordForm"
        @submit="handleChangePassword"
        :style="{ width: '100%' }"
      >
        <a-form-item
          field="oldPassword"
          label="原密码"
          :rules="[{ required: true, message: '请输入原密码' }]"
        >
          <a-input-password
            v-model="passwordForm.oldPassword"
            placeholder="请输入原密码"
            allow-clear
          />
        </a-form-item>
        <a-form-item
          field="newPassword"
          label="新密码"
          :rules="[
            { required: true, message: '请输入新密码' },
            { minLength: 6, message: '密码长度不能小于6位' }
          ]"
        >
          <a-input-password
            v-model="passwordForm.newPassword"
            placeholder="请输入新密码"
            allow-clear
          />
        </a-form-item>
        <a-form-item
          field="confirmPassword"
          label="确认密码"
          :rules="[
            { required: true, message: '请再次输入新密码' },
            { validator: validateConfirmPassword, message: '两次输入的密码不一致' }
          ]"
        >
          <a-input-password
            v-model="passwordForm.confirmPassword"
            placeholder="请再次输入新密码"
            allow-clear
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import SideMenu from '@/components/pc/SideMenu.vue'
import { IconDown, IconUser } from '@arco-design/web-vue/es/icon'
import { Message } from '@arco-design/web-vue'
import { removeToken } from '@/utils/auth'
import logo from '@/assets/logo.jpg'
import { logout, getUserInfo, updateUser } from '@/api/auth'
import type { UserInfo, UpdateUserParams } from '@/types/auth'

const router = useRouter()
const formRef = ref()
const showChangePasswordModal = ref(false)

// 用户信息
const userInfo = reactive<UserInfo>({
  id: 0,
  userAccount: '',
  userName: '',
  userRole: ''
})

// 修改密码表单
interface PasswordForm {
  oldPassword: string
  newPassword: string
  confirmPassword: string
}

const passwordForm = reactive<PasswordForm>({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 验证确认密码
const validateConfirmPassword = (value: string) => {
  return value === passwordForm.newPassword
}

// 获取用户信息
const fetchUserInfo = async () => {
  try {
    const data = await getUserInfo()
    Object.assign(userInfo, data)
  } catch (error: any) {
    Message.error(error?.message || '获取用户信息失败')
  }
}

// 重置表单
const resetForm = () => {
  passwordForm.oldPassword = ''
  passwordForm.newPassword = ''
  passwordForm.confirmPassword = ''
  showChangePasswordModal.value = false
}

// 修改密码
const handleChangePassword = async () => {
  try {
    await formRef.value.validate()
    await updateUser({
      userAccount: userInfo.userAccount,
      userPassword: passwordForm.newPassword
    })
    Message.success('修改密码成功')
    resetForm()
  } catch (error: any) {
    if (error?.type === 'form') return
    Message.error(error?.message || '修改密码失败')
  }
}

// 退出登录
const handleLogout = async () => {
  try {
    await logout()
    removeToken()
    Message.success('退出登录成功')
    router.push('/pc/login')
  } catch (error: any) {
    Message.error(error?.message || '退出登录失败')
  }
}

onMounted(() => {
  fetchUserInfo()
})
</script>

<style scoped lang="scss">
.pc-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f7f8fa;

  .header {
    height: 60px;
    width: 100%;
    background-color: #fff;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 100;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 20px;

    .left {
      display: flex;
      align-items: center;
      gap: 20px;

      .logo {
        height: 40px;
        width: auto;
      }

      .system-title {
        font-size: 16px;
        font-weight: 500;
        color: var(--color-text-1);
      }
    }

    .right {
      .user-info {
        display: flex;
        align-items: center;
        gap: 8px;
        cursor: pointer;
        padding: 4px 8px;
        border-radius: 4px;
        color: var(--color-text-1);
        transition: all 0.2s;

        .avatar {
          background-color: var(--color-fill-2);
          color: var(--color-text-2);
        }

        .username {
          font-size: 14px;
          margin: 0 4px;
        }

        .down-icon {
          color: var(--color-text-3);
        }

        &:hover {
          background-color: var(--color-fill-2);
        }
      }
    }
  }

  .main-wrapper {
    display: flex;
    margin-top: 60px;
    flex: 1;

    .sidebar {
      width: 240px;
      background-color: #fff;
      min-height: calc(100vh - 60px);
      position: fixed;
      left: 0;
      top: 60px;
      border-right: 1px solid #f0f0f0;
    }

    .content {
      flex: 1;
      margin-left: 240px;
      padding: 20px;
      min-height: calc(100vh - 60px);
    }
  }
}
</style> 