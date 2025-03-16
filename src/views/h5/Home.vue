<template>
  <div class="h5-home">
    <!-- 头部 -->
    <div class="header">
      <img :src="logo" alt="Noah Wang Studio" class="logo" />
      <div class="user-info">
        <h2 class="welcome">欢迎您，{{ userInfo.wechatName || userInfo.userAccount }}</h2>
        <van-button size="small" class="edit-btn" @click="showEditDialog = true">
          修改昵称
        </van-button>
      </div>
    </div>

    <!-- 问卷列表 -->
    <div class="survey-list">
      <div class="survey-items">
        <div v-for="item in surveyList" :key="item.surveyId" class="survey-item">
          <div class="survey-info">
            <div class="status-tag" :class="getStatusClass(item.status)">
              {{ item.status }}
            </div>
            <div class="time">绑定时间：{{ item.bindTime }}</div>
          </div>
          <div class="survey-actions">
            <van-button 
              v-if="item.status === '未填写'" 
              type="primary" 
              size="small" 
              @click="handleFill(item)"
            >
              去填写
            </van-button>
            <template v-else>
              <van-button 
                plain 
                size="small" 
                @click="handleView(item)"
              >
                查看
              </van-button>
              <van-button 
                v-if="item.status === '已填写'" 
                type="primary" 
                size="small" 
                @click="handleFill(item)"
              >
                编辑
              </van-button>
            </template>
          </div>
        </div>
      </div>
    </div>

    <!-- 修改昵称弹窗 -->
    <van-dialog
      v-model:show="showEditDialog"
      title="修改昵称"
      show-cancel-button
      @confirm="handleUpdateNickname"
      :before-close="handleDialogClose"
    >
      <div class="dialog-content">
        <van-field
          v-model="nicknameForm.wechatName"
          placeholder="限制20个中文字符"
          :rules="[{ required: true, message: '请填写昵称' }]"
        />
        <div class="tips">
          请填写正确的微信或QQ昵称，如填写错误，<br/>
          将无法进行正确的XP匹配
        </div>
      </div>
    </van-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { h5GetUserInfo, h5UpdateUser } from '@/api/auth'
import { getH5SurveysList } from '@/api/survey'
import type { UserInfo } from '@/types/auth'
import logo from '@/assets/BlackWhiteBgLogo.jpg'

const router = useRouter()

// 用户信息
const userInfo = ref<UserInfo>({} as UserInfo)

// 问卷列表
interface SurveyItem {
  surveyId: string
  status: string
  bindTime: string
}

const surveyList = ref<SurveyItem[]>([
  {
    surveyId: '1',
    status: '未填写',
    bindTime: '2024-02-10'
  },
  {
    surveyId: '2',
    status: '已填写',
    bindTime: '2024-02-09'
  },
  {
    surveyId: '3',
    status: '已填写，不可修改',
    bindTime: '2024-02-08'
  }
])

// 修改昵称相关
const showEditDialog = ref(false)
const nicknameForm = reactive({
  wechatName: ''
})

// 获取用户信息
const fetchUserInfo = async () => {
  try {
    const response = await h5GetUserInfo()
    if (response) {
      userInfo.value = response
      // 初始化修改表单
      nicknameForm.wechatName = response.wechatName || ''
    }
  } catch (error: any) {
    showToast(error?.message || '获取用户信息失败')
  }
}

// 获取问卷列表
const fetchSurveysList = async () => {
  try {
    const response = await getH5SurveysList()
    if (response) {
      surveyList.value = response
    }
  } catch (error: any) {
    showToast(error?.message || '获取问卷列表失败')
  }
}

// 处理修改昵称
const handleUpdateNickname = async () => {
  if (!nicknameForm.wechatName) {
    showToast('请输入昵称')
    return false
  }
  
  // 检查昵称长度
  if (nicknameForm.wechatName.length > 20) {
    showToast('昵称不能超过20个字符')
    return false
  }

  try {
    const response = await h5UpdateUser({ wechatName: nicknameForm.wechatName })
    if (response) {
      showToast('修改成功')
      fetchUserInfo() // 刷新用户信息
      return true
    }
    return false
  } catch (error: any) {
    showToast(error?.message || '修改失败')
    return false
  }
}

// 处理弹窗关闭
const handleDialogClose = (action: string) => {
  if (action === 'cancel') {
    // 取消时重置表单
    nicknameForm.wechatName = userInfo.value.wechatName || ''
    return true
  }
  return true
}

// 填写问卷
const handleFill = (item: SurveyItem) => {
  if (item.status === '未填写') {
    // 未填写状态，进入填写页面
    router.push({
      name: 'h5Survey',
      query: { 
        id: item.surveyId,
        type: 'edit'
      }
    })
  } else if (item.status === '已填写') {
    // 已填写状态，进入查看页面，可编辑
    router.push({
      name: 'h5Survey',
      query: { 
        id: item.surveyId,
        type: 'view'
      }
    })
  }
}

// 查看问卷
const handleView = (item: SurveyItem) => {
  router.push({
    name: 'h5Survey',
    query: { 
      id: item.surveyId,
      type: item.status === '已填写，不可修改' ? 'readonly' : 'view'
    }
  })
}

// 获取状态样式类
const getStatusClass = (status: string) => {
  switch (status) {
    case '未填写':
      return 'status-pending'
    case '已填写':
      return 'status-completed'
    case '已填写，不可修改':
      return 'status-locked'
    default:
      return ''
  }
}

onMounted(() => {
  fetchUserInfo()
  // fetchSurveysList() // 暂时注释掉，使用 mock 数据
})
</script>

<style scoped lang="scss">
.h5-home {
  min-height: 100vh;
  background-color: #f7f8fa;
  padding: 20px;

  .header {
    text-align: center;
    margin-bottom: 24px;

    .logo {
      width: 120px;
      height: auto;
      margin-bottom: 16px;
    }

    .user-info {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;

      .welcome {
        font-size: 18px;
        color: #333;
        margin: 0;
      }

      .edit-btn {
        font-size: 14px;
      }
    }
  }

  .survey-list {
    .survey-items {
      .survey-item {
        background: #fff;
        border-radius: 12px;
        padding: 16px;
        margin-bottom: 12px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);

        .survey-info {
          margin-bottom: 12px;

          .status-tag {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 14px;
            font-weight: 500;
            margin-bottom: 8px;

            &.status-pending {
              background-color: #e8f3ff;
              color: #1989fa;
            }

            &.status-completed {
              background-color: #e8f7ef;
              color: #07c160;
            }

            &.status-locked {
              background-color: #f5f5f5;
              color: #909399;
            }
          }

          .time {
            font-size: 13px;
            color: #999;
          }
        }

        .survey-actions {
          display: flex;
          justify-content: flex-end;
          gap: 8px;

          .van-button {
            min-width: 64px;
            border-radius: 6px;

            &--primary {
              background: #1989fa;
              border-color: #1989fa;
            }

            &--plain {
              color: #666;
              border-color: #dcdee0;
            }

            &--disabled {
              opacity: 0.6;
            }
          }
        }
      }
    }
  }

  .dialog-content {
    padding: 16px;

    .tips {
      margin-top: 12px;
      font-size: 12px;
      color: #999;
      line-height: 1.5;
      text-align: center;
    }
  }
}
</style> 