<template>
  <div class="h5-survey">
    <!-- 头部 -->
    <div class="survey-header">
      <div class="header-left">
        <van-icon name="arrow-left" @click="handleBack" />
      </div>
      <div class="header-title">{{ pageTitle }}</div>
      <div class="header-right">
        <template v-if="type === 'view' && !isReadOnly">
          <van-button 
            type="primary" 
            size="mini"
            class="edit-btn"
            @click="handleEdit"
          >
            修改
          </van-button>
        </template>
      </div>
    </div>

    <!-- 问卷内容 -->
    <div class="survey-content">
      <!-- 问卷标题 -->
      <div class="survey-title">
        <h1>{{ survey.surveysTitle }}</h1>
      </div>

      <!-- 问题列表 -->
      <div class="questions-list">
        <div 
          v-for="(question, index) in survey.questionList" 
          :key="question.questionId"
          class="question-item"
        >
          <!-- 问题标题 -->
          <div class="question-title">
            <span class="question-index">{{ index + 1 }}.</span>
            {{ question.questionTitle }}
            <span class="required-mark" v-if="question.isRequired === '1'">*</span>
          </div>

          <!-- 问题内容 -->
          <div class="question-content">
            <component 
              :is="getQuestionComponent(question.questionType)"
              v-model="answers[question.questionId]"
              :question="question"
              :disabled="type !== 'edit'"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- 底部按钮 -->
    <div class="survey-footer" v-if="type === 'edit'">
      <van-button 
        type="primary" 
        block 
        @click="handleSubmit"
      >
        提交
      </van-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast, showDialog } from 'vant'
import { getH5SurveyDetail, getH5SurveyAllDetail, editH5SurveyAllDetail } from '@/api/survey'
import { QuestionType } from '@/types/survey'
import type { SurveyDetail, Question } from '@/types/survey'
import SingleChoice from './components/SingleChoice.vue'
import MultipleChoice from './components/MultipleChoice.vue'
import DatePicker from './components/DatePicker.vue'
import TextInput from './components/TextInput.vue'

const route = useRoute()
const router = useRouter()

// 页面类型：view(查看) / edit(编辑) / readonly(仅查看)
const type = computed(() => (route.query.type as string) || 'edit')
// 是否是只读模式（不可编辑）
const isReadOnly = computed(() => type.value === 'readonly')

// 页面标题
const pageTitle = computed(() => {
  switch (type.value) {
    case 'view':
      return '查看问卷'
    case 'readonly':
      return '查看问卷'
    case 'edit':
      return '填写问卷'
    default:
      return '问卷'
  }
})

// 问卷数据
const survey = ref<SurveyDetail>({
  surveyId: '',
  surveysTitle: (route.query.title as string) || '----',
  questionList: []
})

// 答案数据
const answers = ref<Record<string, any>>({})

// 获取问题对应的组件
const getQuestionComponent = (type: string) => {
  switch (type) {
    case QuestionType.SINGLE_CHOICE:
      return SingleChoice
    case QuestionType.MULTIPLE_CHOICE:
      return MultipleChoice
    case QuestionType.DATE:
      return DatePicker
    case QuestionType.TEXT:
      return TextInput
    default:
      return 'div'
  }
}

// 返回上一页
const handleBack = () => {
  router.back()
}

// 进入编辑模式
const handleEdit = () => {
  router.replace({
    path: route.path,
    query: { 
      ...route.query,
      type: 'edit'
    }
  })
}

// 提交问卷
const handleSubmit = async () => {
  // 后续实现提交逻辑
}

// 获取问卷详情
const fetchSurveyDetail = async () => {
  try {
    const surveyId = route.query.id as string
    if (!surveyId) {
      showToast('问卷ID不能为空')
      return
    }

    const responseId = route.query.responseId as string
    let response

    // 根据不同场景选择不同的API请求
    if (!responseId) {
      // 没有responseId，表示新填写的问卷
      response = await getH5SurveyDetail({ surveyId })
    } else if (type.value === 'edit') {
      // 编辑模式，使用editH5SurveyAllDetail
      response = await editH5SurveyAllDetail({ surveyId, responseId })
    } else {
      // 查看模式，使用getH5SurveyAllDetail
      response = await getH5SurveyAllDetail({ surveyId, responseId })
    }

    if (response) {
      // 更新问卷数据
      survey.value = {
        surveyId: response.surveyId,
        surveysTitle: response.surveysTitle,
        questionList: response.questionList
      }

      // 初始化答案数据
      response.questionList.forEach(question => {
        // 如果已经有答案，使用已有答案
        if (responseId && (question as any).answer) {
          // TODO: 复现答案
          answers.value[question.questionId] = (question as any).answer
        } else {
          if (question.questionType === QuestionType.MULTIPLE_CHOICE) {
            // 多选题初始化为空数组
            answers.value[question.questionId] = []
          } else if (question.questionType === QuestionType.SINGLE_CHOICE) {
            // 单选题初始化为空字符串
            answers.value[question.questionId] = ''
          } else {
            // 其他类型初始化为 null
            answers.value[question.questionId] = null
          }
        }
      })
    }
  } catch (error) {
    showToast('获取问卷详情失败')
  }
}

onMounted(() => {
  fetchSurveyDetail()
})
</script>

<style scoped lang="scss">
.h5-survey {
  min-height: 100vh;
  background-color: #f7f8fa;
  padding-bottom: 80px;

  .survey-header {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 44px;
    background: #fff;
    display: flex;
    align-items: center;
    padding: 0 16px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    z-index: 100;

    .header-left,
    .header-right {
      flex: none;
      width: 60px;
    }

    .header-title {
      flex: 1;
      text-align: center;
      font-size: 16px;
      font-weight: 500;
    }

    .header-right {
      flex: none;
      width: 60px;
      display: flex;
      justify-content: flex-end;

      .edit-btn {
        height: 24px;
        padding: 0 8px;
        font-size: 12px;
        border-radius: 4px;

        &.van-button--primary {
          background: #1989fa;
          border-color: #1989fa;
        }
      }
    }
  }

  .survey-content {
    padding: 60px 16px 16px;

    .survey-title {
      background: #fff;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 12px;
      text-align: center;

      h1 {
        font-size: 20px;
        font-weight: 600;
        margin: 0 0 8px;
      }
    }

    .questions-list {
      .question-item {
        background: #fff;
        padding: 16px;
        border-radius: 8px;
        margin-bottom: 12px;

        .question-title {
          font-size: 16px;
          font-weight: 500;
          margin-bottom: 12px;

          .question-index {
            margin-right: 4px;
          }

          .required-mark {
            color: #ee0a24;
            margin-left: 4px;
          }
        }

        .question-content {
          // 后续根据具体题型添加样式
        }
      }
    }
  }

  .survey-footer {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 16px;
    background: #fff;
    box-shadow: 0 -1px 2px rgba(0, 0, 0, 0.05);
  }
}
</style> 