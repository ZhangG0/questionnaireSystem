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
            <div class="title-status-row">
              <h3 class="survey-title">{{ item.surveyTitle }}</h3>
              <div class="status-tag" :class="getStatusClass(item.responseStatus)">
                {{ item.responseStatus }}
              </div>
            </div>
            <div class="time">绑定时间：{{ item.bindTime }}</div>
          </div>
          <div class="survey-actions">
            <van-button
              v-if="item.responseStatus === '未填写'"
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
                v-if="item.responseStatus === '已填写'"
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
  surveyTitle: string
  responseId: string
  responseStatus: string
  bindTime: string
}

const surveyList = ref<SurveyItem[]>([])

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
      // 确保返回数据符合SurveyItem接口要求
      surveyList.value = response.map(item => ({
        surveyId: item.surveyId,
        surveyTitle: item.surveyTitle,
        responseId: item.responseId || '',
        responseStatus: item.responseStatus,
        bindTime: item.bindTime
      }))
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
  if (item.responseStatus === '未填写') {
    // 未填写状态，进入填写页面
    router.push({
      name: 'h5Survey',
      query: {
        id: item.surveyId,
        responseId: item.responseId,
        title: item.surveyTitle,
        type: 'edit'
      }
    })
  } else if (item.responseStatus === '已填写') {
    // 已填写状态，进入查看页面，可编辑
    router.push({
      name: 'h5Survey',
      query: {
        id: item.surveyId,
        responseId: item.responseId,
        title: item.surveyTitle,
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
      responseId: item.responseId,
      title: item.surveyTitle,
      type: item.responseStatus === '已填写，不可修改' ? 'readonly' : 'view'
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
  fetchSurveysList()
})
</script>

<style scoped lang="scss">
.h5-home {
  min-height: 100vh;
  background-color: #f7f8fa;
  padding: 5.33vw; // 20px转换为vw (基于375px设计稿)

  .header {
    text-align: center;
    margin-bottom: 6.4vw; // 24px

    .logo {
      width: 32vw; // 120px
      height: auto;
      margin-bottom: 4.27vw; // 16px
      border-radius: 2.67vw; // 10px
      box-shadow: 0 1.07vw 2.67vw rgba(0, 0, 0, 0.08);
    }

    .user-info {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 2.67vw; // 10px

      .welcome {
        font-size: 4.8vw; // 18px
        color: #333;
        margin: 0;
        font-weight: 600;
      }

      .edit-btn {
        font-size: 3.73vw; // 14px
        border-radius: 4.27vw; // 16px
        padding: 0 3.2vw; // 12px
      }
    }
  }

  .survey-list {
    .survey-items {
      .survey-item {
        background: #fff;
        border-radius: 4.27vw; // 16px
        padding: 5.33vw; // 20px
        margin-bottom: 4.27vw; // 16px
        box-shadow: 0 1.07vw 3.2vw rgba(0, 0, 0, 0.05);
        transition: all 0.3s ease;
        border: 0.27vw solid rgba(0, 0, 0, 0.03); // 1px
        
        &:hover {
          transform: translateY(-0.53vw); // -2px
          box-shadow: 0 1.6vw 4.27vw rgba(0, 0, 0, 0.08);
        }

        .survey-info {
          margin-bottom: 4.27vw; // 16px
          
          .title-status-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 3.2vw; // 12px
            
            .survey-title {
              font-size: 4.53vw; // 17px
              font-weight: 600;
              color: #333;
              margin: 0;
              max-width: 70%;
              overflow: hidden;
              text-overflow: ellipsis;
              display: -webkit-box;
              -webkit-line-clamp: 2;
              -webkit-box-orient: vertical;
            }
            
            .status-tag {
              padding: 1.33vw 2.67vw; // 5px 10px
              border-radius: 3.2vw; // 12px
              font-size: 3.47vw; // 13px
              font-weight: 500;
              white-space: nowrap;
              border: 0.27vw solid transparent; // 1px
              
              &.status-pending {
                background-color: #e8f3ff;
                color: #1989fa;
                border-color: rgba(25, 137, 250, 0.2);
              }

              &.status-completed {
                background-color: #e8f7ef;
                color: #07c160;
                border-color: rgba(7, 193, 96, 0.2);
              }

              &.status-locked {
                background-color: #f5f5f5;
                color: #909399;
                border-color: rgba(144, 147, 153, 0.2);
              }
            }
          }

          .time {
            font-size: 3.47vw; // 13px
            color: #999;
            display: flex;
            align-items: center;
          }
        }

        .survey-actions {
          display: flex;
          justify-content: flex-end;
          gap: 2.67vw; // 10px

          .van-button {
            min-width: 18.13vw; // 68px
            border-radius: 5.33vw; // 20px
            font-size: 3.73vw; // 14px
            font-weight: 500;
            transition: all 0.2s;
            
            &:active {
              transform: scale(0.98);
            }

            &--primary {
              background: #1989fa;
              border-color: #1989fa;
              box-shadow: 0 0.8vw 2.13vw rgba(25, 137, 250, 0.2); // 3px 8px
              
              &:hover {
                background: #0d7fe4;
                border-color: #0d7fe4;
              }
            }

            &--plain {
              color: #666;
              border-color: #dcdee0;
              
              &:hover {
                color: #1989fa;
                border-color: #1989fa;
                background-color: rgba(25, 137, 250, 0.05);
              }
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
    padding: 5.33vw; // 20px

    .tips {
      margin-top: 4.27vw; // 16px
      font-size: 3.2vw; // 12px
      color: #999;
      line-height: 1.6;
      text-align: center;
      background-color: #f9f9f9;
      padding: 2.67vw; // 10px
      border-radius: 2.13vw; // 8px
    }
  }
}
</style>
