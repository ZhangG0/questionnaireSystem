<template>
  <div class="user-detail">
    <div class="page-header">
      <a-button type="text" class="back-btn" @click="handleBack">
        <icon-left />返回上一页
      </a-button>
    </div>

    <div class="content">
      <!-- 基本信息 -->
      <div class="info-section">
        <div class="section-header">
          <div class="left">
            <icon-user class="section-icon" />
            <h3 class="section-title">基本信息</h3>
          </div>
          <div class="right">
            <a-button type="primary" @click="handleEdit">
              <template #icon>
                <icon-edit />
              </template>
              修改信息
            </a-button>
          </div>
        </div>
        <a-descriptions
          :data="userInfo"
          layout="inline-horizontal"
          :column="1"
          class="user-descriptions"
        >
          <template #value="{ value, index, data }">
            <template v-if="data?.type === 'password'">
              <div class="password-field">
                <span>{{ showPassword ? data.value : '******' }}</span>
                <a-button type="text" class="eye-btn" @click="togglePassword">
                  <icon-eye-invisible v-if="!showPassword" />
                  <icon-eye v-else />
                </a-button>
              </div>
            </template>
            <template v-else>
              {{ data.value }}
            </template>
          </template>
        </a-descriptions>
      </div>

      <!-- 问卷列表 -->
      <div class="questionnaire-section">
        <div class="section-header">
          <div class="left">
            <icon-file class="section-icon" />
            <h3 class="section-title">已绑定的问卷</h3>
          </div>
        </div>
        <div class="questionnaire-list">
          <a-card
            v-for="item in questionnaireList"
            :key="item.surveyId"
            class="questionnaire-card"
            :hoverable="true"
          >
            <template #title>
              <div class="card-title">
                <icon-file-pdf class="card-icon" />
                {{ item.surveyTitle }}
              </div>
            </template>
            <template #extra>
              <a-tag :color="getStatusColor(item.responseStatus)">{{ item.responseStatus }}</a-tag>
            </template>
            <div class="card-content">
              <a-button type="primary" size="small" @click="handleView(item)">查看问卷</a-button>
            </div>
          </a-card>
        </div>
      </div>
    </div>

    <!-- 编辑弹窗 -->
    <a-modal
      v-model:visible="showEditModal"
      title="编辑用户信息"
      :mask-closable="false"
      @ok="handleEditSubmit"
      @cancel="showEditModal = false"
    >
      <a-form ref="formRef" :model="editForm" :style="{ width: '100%' }">
        <a-form-item
          field="userAccount"
          label="用户名"
          :rules="[{ required: true, message: '请输入用户名' }]"
        >
          <a-input v-model="editForm.userAccount" placeholder="请输入用户名" allow-clear />
        </a-form-item>
        <a-form-item
          field="userPassword"
          label="密码"
          :rules="[{ required: true, message: '请输入密码' }]"
        >
          <a-input-password v-model="editForm.userPassword" placeholder="请输入密码" allow-clear />
        </a-form-item>
        <a-form-item
          field="wechatName"
          label="微信名"
          :rules="[{ required: true, message: '请输入微信名' }]"
        >
          <a-input v-model="editForm.wechatName" placeholder="请输入微信名" allow-clear />
        </a-form-item>
      </a-form>
      <template #footer>
        <a-space>
          <a-button @click="showEditModal = false">取消</a-button>
          <a-button type="primary" :loading="submitting" @click="handleEditSubmit"> 确定 </a-button>
        </a-space>
      </template>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import {
  IconLeft,
  IconUser,
  IconFile,
  IconFilePdf,
  IconEdit,
  IconEye,
  IconEyeInvisible
} from '@arco-design/web-vue/es/icon'
import { getUserDetail, updateUserDetail } from '@/api/auth'
import type { UserSurvey, UpdateUserDetailParams } from '@/types/auth'

interface DescriptionItem {
  label: string
  value: string
  type?: 'text' | 'password'
}

const router = useRouter()
const route = useRoute()
const userId = route.query.id as string

// 密码显示状态
const showPassword = ref(false)

// 切换密码显示
const togglePassword = () => {
  showPassword.value = !showPassword.value
}

// 用户基本信息
const userInfo = ref<DescriptionItem[]>([
  {
    label: '用户名',
    value: '',
    type: 'text'
  },
  {
    label: '密码',
    value: '',
    type: 'password'
  },
  {
    label: '微信名',
    value: '',
    type: 'text'
  }
])

// 问卷列表
const questionnaireList = ref<UserSurvey[]>([])

// 编辑表单
const showEditModal = ref(false)
const formRef = ref()
const editForm = reactive<UpdateUserDetailParams>({
  userId: '',
  userAccount: '',
  userPassword: '',
  wechatName: ''
})

// 添加提交状态
const submitting = ref(false)

// 获取用户详情
const fetchUserDetail = async () => {
  try {
    const data = await getUserDetail(userId)

    // 更新用户信息
    userInfo.value[0].value = data.userAccount
    userInfo.value[1].value = data.userPassword
    userInfo.value[2].value = data.wechatName

    // 更新问卷列表
    questionnaireList.value = data.surveysUserVOList

    // 更新编辑表单初始值
    editForm.userId = data.userId
    editForm.userAccount = data.userAccount
    editForm.userPassword = data.userPassword
    editForm.wechatName = data.wechatName
  } catch (error: any) {
    Message.error(error?.message || '获取用户信息失败')
  }
}

// 状态颜色映射
const getStatusColor = (status: string) => {
  const colorMap: Record<string, string> = {
    未填写: 'gray',
    已填写: 'green',
    '已填写，不可修改': 'blue'
  }
  return colorMap[status] || 'gray'
}

// 事件处理
const handleBack = () => {
  router.back()
}

const handleEdit = () => {
  editForm.userId = userId
  editForm.userAccount = userInfo.value[0].value
  editForm.userPassword = userInfo.value[1].value
  editForm.wechatName = userInfo.value[2].value
  showEditModal.value = true
}

const handleEditSubmit = async () => {
  try {
    await formRef.value.validate()
    submitting.value = true

    await updateUserDetail(editForm)
    Message.success('修改成功')
    showEditModal.value = false
    await fetchUserDetail() // 重新获取用户信息
  } catch (error: any) {
    if (error?.type === 'form') return
    Message.error(error?.message || '修改失败')
  } finally {
    submitting.value = false
  }
}

const handleView = (questionnaire: UserSurvey) => {
  // 跳转到问卷详情页
  router.push(`/pc/questionnaire/${questionnaire.surveyId}`)
}

onMounted(() => {
  fetchUserDetail()
})
</script>

<style scoped lang="scss">
.user-detail {
  padding: 24px;
  background: #fff;
  border-radius: 8px;
  min-height: calc(100vh - 100px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

  .page-header {
    margin-bottom: 32px;

    .back-btn {
      padding: 8px 16px;
      color: var(--color-text-2);
      font-size: 14px;
      transition: all 0.3s;

      &:hover {
        color: rgb(var(--primary-6));
        background: var(--color-fill-2);
      }

      .icon-left {
        margin-right: 6px;
      }
    }
  }

  .content {
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;

      .left {
        display: flex;
        align-items: center;
        gap: 8px;

        .section-icon {
          font-size: 20px;
          color: rgb(var(--primary-6));
        }

        .section-title {
          margin: 0;
          font-size: 18px;
          font-weight: 500;
          color: var(--color-text-1);
        }
      }
    }

    .info-section {
      margin-bottom: 40px;
      background: var(--color-fill-2);
      padding: 24px;
      border-radius: 8px;
      border: 1px solid var(--color-border);

      :deep(.user-descriptions) {
        margin-top: 8px;

        .arco-descriptions-item {
          padding: 16px 0;
          border-bottom: 1px solid var(--color-border-2);

          &:last-child {
            border-bottom: none;
          }

          .arco-descriptions-item-label {
            color: var(--color-text-3);
            font-weight: 500;
            width: 100px;
          }

          .arco-descriptions-item-value {
            color: var(--color-text-1);
            font-weight: 400;
          }
        }

        .password-field {
          display: flex;
          align-items: center;
          gap: 8px;

          .eye-btn {
            padding: 4px;
            height: 24px;
            color: var(--color-text-3);

            &:hover {
              color: rgb(var(--primary-6));
              background: var(--color-fill-3);
            }

            :deep(.arco-icon) {
              font-size: 16px;
            }
          }
        }
      }
    }

    .questionnaire-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 20px;
      margin-top: 20px;

      .questionnaire-card {
        border: 1px solid var(--color-border);
        border-radius: 8px;
        transition: all 0.3s;

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
        }

        :deep(.arco-card-header) {
          border-bottom: 1px solid var(--color-border);
          padding: 16px 20px;
          background: var(--color-fill-2);
          border-radius: 8px 8px 0 0;

          .card-title {
            display: flex;
            align-items: center;
            gap: 8px;
            color: var(--color-text-1);
            font-weight: 500;

            .card-icon {
              color: rgb(var(--primary-6));
            }
          }
        }

        :deep(.arco-card-body) {
          padding: 16px 20px;
        }

        .card-content {
          display: flex;
          justify-content: flex-end;
          margin-top: 8px;
        }

        :deep(.arco-tag) {
          border-radius: 4px;
          padding: 0 8px;
          font-size: 13px;
        }
      }
    }
  }
}

// 弹窗样式优化
:deep(.arco-modal) {
  .arco-modal-header {
    border-bottom: 1px solid var(--color-border);
    padding: 16px 20px;

    .arco-modal-title {
      font-size: 18px;
      font-weight: 600;
    }
  }

  .arco-modal-body {
    padding: 20px;
  }

  .arco-modal-footer {
    border-top: 1px solid var(--color-border);
    padding: 16px 20px;
  }

  .arco-form-item-label {
    font-weight: 500;
  }
}
</style>
