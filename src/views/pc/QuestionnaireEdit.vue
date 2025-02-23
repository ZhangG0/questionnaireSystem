<template>
  <div class="questionnaire-edit">
    <div class="page-header">
      <a-button type="text" class="back-btn" @click="handleBack">
        <icon-left />返回上一页
      </a-button>
      <div class="right">
        <a-button type="primary" :loading="saving" @click="handleSave">保存问卷</a-button>
      </div>
    </div>

    <!-- 问卷标题 -->
    <div class="title-section">
      <a-input
        v-model="survey.title"
        placeholder="请输入问卷标题"
        :style="{ width: '100%' }"
        size="large"
        allow-clear
      />
    </div>

    <!-- 问题列表 -->
    <div class="questions-section">
      <div
        v-for="(question, index) in survey.questions"
        :key="question.id"
        class="question-item"
        :class="{ active: currentQuestionId === question.id }"
        @click="handleQuestionClick(question)"
      >
        <div class="question-header">
          <div class="left">
            <span class="question-index">Q{{ index + 1 }}</span>
            <span class="question-title">{{ question.title }}</span>
            <a-tag size="small" :color="question.required ? 'red' : ''">
              {{ question.required ? '必填' : '选填' }}
            </a-tag>
          </div>
          <div class="right">
            <a-space>
              <a-button-group size="small">
                <a-button :disabled="index === 0" @click.stop="handleMoveUp(index)">
                  <template #icon><icon-up /></template>
                </a-button>
                <a-button
                  :disabled="index === survey.questions.length - 1"
                  @click.stop="handleMoveDown(index)"
                >
                  <template #icon><icon-down /></template>
                </a-button>
              </a-button-group>
              <a-button status="danger" size="small" @click.stop="handleDelete(index)">
                <template #icon><icon-delete /></template>
              </a-button>
            </a-space>
          </div>
        </div>

        <!-- 问题内容 -->
        <div class="question-content">
          <template
            v-if="
              question.type === QuestionType.SINGLE_CHOICE ||
              question.type === QuestionType.MULTIPLE_CHOICE
            "
          >
            <div
              v-for="option in (question as ChoiceQuestion).options"
              :key="option.id"
              class="option-item"
            >
              <a-radio v-if="question.type === QuestionType.SINGLE_CHOICE" :disabled="true">
                {{ option.content }}
              </a-radio>
              <a-checkbox v-else :disabled="true">{{ option.content }}</a-checkbox>
            </div>
          </template>

          <template v-else-if="question.type === QuestionType.DATE_TIME">
            <a-date-picker :disabled="true" style="width: 200px" />
          </template>

          <template v-else-if="question.type === QuestionType.TEXT">
            <a-textarea
              :disabled="true"
              :placeholder="'请输入，最多' + (question as TextQuestion).maxLength + '字'"
            />
          </template>
        </div>
      </div>

      <!-- 添加问题按钮 -->
      <div v-if="!isAddingQuestion" class="add-question">
        <a-button type="dashed" long @click="handleAddQuestion">
          <template #icon><icon-plus /></template>
          添加问题
        </a-button>
      </div>

      <!-- 新问题类型选择 -->
      <div v-else class="new-question">
        <div class="question-header">
          <span class="question-index">Q{{ survey.questions.length + 1 }}</span>
          <a-input
            v-model="newQuestion.title"
            placeholder="请输入问题标题"
            style="width: 300px"
            @keyup.enter="showTypeSelect"
          />
          <a-button type="primary" size="small" @click="showTypeSelect"> 选择问题类型 </a-button>
        </div>
      </div>
    </div>

    <!-- 问题类型选择弹窗 -->
    <a-modal
      v-model:visible="showTypeModal"
      title="选择问题类型"
      :footer="false"
      width="400px"
      @cancel="handleTypeCancel"
    >
      <div class="type-list">
        <div
          v-for="type in questionTypes"
          :key="type.value"
          class="type-item"
          @click="handleTypeSelect(type.value)"
        >
          <div class="type-icon">
            <component :is="type.icon" />
          </div>
          <div class="type-info">
            <div class="type-title">{{ type.label }}</div>
            <div class="type-desc">{{ type.description }}</div>
          </div>
        </div>
      </div>
    </a-modal>

    <!-- 问题设置抽屉 -->
    <a-drawer
        v-model:visible="showSettingDrawer"
        :width="650"
        title="问题设置"
        :footer="false"
        @close="showSettingDrawer = false"
        >
      <template v-if="currentQuestion">
        <a-form :model="currentQuestion" layout="vertical">
          <!-- 通用设置 -->
          <a-form-item field="title" label="问题标题">
            <a-input v-model="currentQuestion.title" placeholder="请输入问题标题" allow-clear />
          </a-form-item>
          <a-form-item field="required" label="是否必填">
            <a-switch v-model="currentQuestion.required" />
          </a-form-item>

          <!-- 选择题特有设置 -->
          <template
            v-if="
              currentQuestion.type === QuestionType.SINGLE_CHOICE ||
              currentQuestion.type === QuestionType.MULTIPLE_CHOICE
            "
          >
            <a-divider>选项列表</a-divider>
            <a-form-item label="选项列表">
              <div class="option-area">
                <div class="option-list">
                  <div
                    v-for="(option, index) in (currentQuestion as ChoiceQuestion).options"
                    :key="option.id"
                    class="option-edit-item"
                  >
                    <a-input v-model="option.content" placeholder="请输入选项内容" allow-clear>
                      <template #prefix>{{ String.fromCharCode(65 + index) }}.</template>
                    </a-input>
                    <a-button
                      type="text"
                      status="danger"
                      :disabled="(currentQuestion as ChoiceQuestion).options.length <= 2"
                      @click="handleDeleteOption(index)"
                    >
                      <template #icon><icon-delete /></template>
                    </a-button>
                  </div>
                </div>
                <div class="option-actions">
                  <a-button type="dashed" size="small" @click="handleAddOption">
                    <template #icon><icon-plus /></template>
                    添加选项
                  </a-button>
                </div>
              </div>
            </a-form-item>
          </template>

          <!-- 填空题特有设置 -->
          <template v-if="currentQuestion.type === QuestionType.TEXT">
            <a-form-item field="maxLength" label="最大字数限制">
              <a-input-number
                v-model="(currentQuestion as TextQuestion).maxLength"
                :min="1"
                :max="1000"
                placeholder="请输入最大字数限制"
              />
            </a-form-item>
          </template>

          <!-- 展示逻辑设置 -->
          <a-divider>展示逻辑</a-divider>
          <div class="logic-settings">
            <a-form-item label="符合条件时">
              <a-select v-model="logicSettings.condition" placeholder="请选择显示条件" style="width: 160px">
                <a-option value="all">全部</a-option>
                <a-option value="any">任一</a-option>
              </a-select>
              <span class="condition-text">关联条件时才显示本题目</span>
            </a-form-item>

            <div class="logic-rules">
              <div v-for="(rule, index) in logicSettings.rules" :key="index" class="logic-rule">
                <div class="rule-header">
                  <span class="rule-index">条件{{ index + 1 }}：</span>
                  <a-button
                    type="text"
                    status="danger"
                    class="delete-btn"
                    @click="removeLogicRule(index)"
                  >
                    <template #icon><icon-delete /></template>
                  </a-button>
                </div>
                <div class="rule-content">
                  <a-form-item label="关联题目">
                    <a-select
                      v-model="rule.questionId"
                      placeholder="选择关联题目"
                      style="width: 200px"
                      allow-clear
                    >
                      <a-option
                        v-for="q in previousQuestions"
                        :key="q.id"
                        :value="q.id"
                        :disabled="q.id === currentQuestion.id"
                      >
                        {{ q.title }}
                      </a-option>
                    </a-select>
                  </a-form-item>
                  <a-form-item label="选项操作">
                    <a-select
                      v-model="rule.operator"
                      placeholder="选择条件"
                      style="width: 200px"
                    >
                      <a-option value="selected">已选中</a-option>
                      <a-option value="not_selected">未选中</a-option>
                    </a-select>
                  </a-form-item>
                  <a-form-item label="题目选项" v-if="rule.questionId">
                    <a-select
                      v-model="rule.optionId"
                      placeholder="选择选项"
                      style="width: 200px"
                      allow-clear
                    >
                      <a-option
                        v-for="option in getRelatedQuestionOptions(rule.questionId)"
                        :key="option.id"
                        :value="option.id"
                      >
                        {{ option.content }}
                      </a-option>
                    </a-select>
                  </a-form-item>
                </div>
              </div>
            </div>

            <div class="add-rule">
              <a-button type="dashed" @click="addLogicRule">
                <template #icon><icon-plus /></template>
                添加条件
              </a-button>
            </div>
          </div>
        </a-form>
      </template>
    </a-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import {
  IconLeft,
  IconPlus,
  IconUp,
  IconDown,
  IconDelete,
  IconEdit,
  IconCalendar,
  IconList,
  IconFile
} from '@arco-design/web-vue/es/icon'
import type {
  Survey,
  Question,
  ChoiceQuestion,
  DateTimeQuestion,
  TextQuestion,
  QuestionOption,
  LogicSettings,
  LogicRule,
  SurveyRequest
} from '@/types/survey'
import { QuestionType, LogicCondition, LogicOperator } from '@/types/survey'
import { v4 as uuidv4 } from 'uuid'
import { saveSurvey } from '@/api/survey' // 导入保存问卷的 API

const router = useRouter()
const route = useRoute()
const isEdit = computed(() => route.query.type === 'edit')

// 问卷数据
const survey = reactive<Survey>({
  id: isEdit.value ? (route.query.id as string) : uuidv4(),
  title: '',
  questions: [],
  isPublished: false
})

// 保存状态
const saving = ref(false)

// 新增问题相关
const isAddingQuestion = ref(false)
const newQuestion = reactive({
  title: ''
})

// 问题类型选择
const showTypeModal = ref(false)
const questionTypes = [
  {
    label: '单选题',
    value: QuestionType.SINGLE_CHOICE,
    icon: IconList,
    description: '从多个选项中选择一个答案'
  },
  {
    label: '多选题',
    value: QuestionType.MULTIPLE_CHOICE,
    icon: IconList,
    description: '从多个选项中选择多个答案'
  },
  {
    label: '时间日期',
    value: QuestionType.DATE_TIME,
    icon: IconCalendar,
    description: '选择日期或日期时间'
  },
  {
    label: '填空题',
    value: QuestionType.TEXT,
    icon: IconFile,
    description: '输入文本作答'
  }
]

// 问题设置
const showSettingDrawer = ref(false)
const currentQuestionId = ref<string>('')
const currentQuestion = computed(() => survey.questions.find(q => q.id === currentQuestionId.value))

// 获取当前问题之前的所有问题
const previousQuestions = computed(() => {
  const currentIndex = survey.questions.findIndex(q => q.id === currentQuestionId.value)
  return survey.questions.slice(0, currentIndex)
})

// 初始化逻辑设置
const initLogicSettings = (): LogicSettings => ({
  condition: LogicCondition.ALL,
  rules: []
})

// 当前问题的逻辑设置
const logicSettings = computed({
  get: () => {
    if (!currentQuestion.value?.logicSettings) {
      currentQuestion.value!.logicSettings = initLogicSettings()
    }
    return currentQuestion.value!.logicSettings
  },
  set: (value: LogicSettings) => {
    if (currentQuestion.value) {
      currentQuestion.value.logicSettings = value
    }
  }
})

// 添加逻辑规则
const addLogicRule = () => {
  logicSettings.value.rules.push({
    questionId: '',
    operator: LogicOperator.SELECTED,
    optionId: ''
  })
}

// 删除逻辑规则
const removeLogicRule = (index: number) => {
  logicSettings.value.rules.splice(index, 1)
}

// 获取关联题目的选项
const getRelatedQuestionOptions = (questionId: string) => {
  const question = previousQuestions.value.find(q => q.id === questionId)
  if (question && (question.type === QuestionType.SINGLE_CHOICE || question.type === QuestionType.MULTIPLE_CHOICE)) {
    return (question as ChoiceQuestion).options
  }
  return []
}

// 返回上一页
const handleBack = () => {
  router.back()
}

// 保存问卷
const handleSave = async () => {
  if (!survey.title) {
    Message.warning('请输入问卷标题');
    return;
  }
  if (survey.questions.length === 0) {
    Message.warning('请至少添加一个问题');
    return;
  }

  saving.value = true;
  try {
    // 构建请求体
    const requestBody: SurveyRequest = {
      surveyId: survey.id, // 只在后端生成的 ID 时传递
      surveysTitle: survey.title,
      questionList: survey.questions.map((question, index) => ({
        frontQuestionId: question.id, // 前端生成的 ID
        questionId: isEdit.value && question.id.startsWith('new_') ? undefined : question.id, // 编辑时使用后端返回的 ID
        surveyId: survey.id,
        questionType: question.type === QuestionType.SINGLE_CHOICE ? "1" :
                      question.type === QuestionType.MULTIPLE_CHOICE ? "2" :
                      question.type === QuestionType.DATE_TIME ? "3" : "4",
        questionTitle: question.title,
        isRequired: question.required ? "1" : "0",
        questionSort: (index + 1).toString(),
        optionList: question.options ? question.options.map((option, optionIndex) => ({
          frontOptionId: option.id, // 前端生成的 ID
          optionId: isEdit.value && option.id.startsWith('new_') ? undefined : option.id, // 编辑时使用后端返回的 ID
          questionId: question.id,
          optionText: option.content,
          optionSort: (optionIndex + 1).toString()
        })) : [],
        logic: question.logicSettings ? {
          logicId: uuidv4(), // 生成逻辑 ID
          questionId: question.id,
          showType: "1",
          logicConditionList: question.logicSettings.rules.map((rule) => ({
            logicConditionId: uuidv4(), // 生成条件 ID
            logicId: uuidv4(), // 生成逻辑 ID
            questionId: rule.questionId,
            frontQuestionId: rule.questionId,
            questionTitle: previousQuestions.value.find(q => q.id === rule.questionId)?.title || '',
            operationType: rule.operator === LogicOperator.SELECTED ? "1" : "2",
            logicConditionOptionList: rule.optionId ? [{
              logicConditionOptionId: uuidv4(), // 生成选项 ID
              logicConditionId: uuidv4(), // 生成条件 ID
              optionId: rule.optionId,
              frontOptionId: rule.optionId,
              optionText: getRelatedQuestionOptions(rule.questionId).find(opt => opt.id === rule.optionId)?.content || ''
            }] : []
          }))
        } : null
      }))
    };

    // 调用保存接口
    const result = await saveSurvey(requestBody);

    if (result) {
      Message.success('保存成功');
      router.back();
    } else {
      Message.error('保存失败');
    }
  } catch (error: any) {
    Message.error(error?.message || '保存失败');
  } finally {
    saving.value = false;
  }
};

// 添加问题
const handleAddQuestion = () => {
  isAddingQuestion.value = true
  newQuestion.title = ''
}

// 显示类型选择
const showTypeSelect = () => {
  if (!newQuestion.title) {
    Message.warning('请输入问题标题')
    return
  }
  showTypeModal.value = true
}

// 选择问题类型
const handleTypeSelect = (type: QuestionType) => {
  let question: Question

  switch (type) {
    case QuestionType.SINGLE_CHOICE:
    case QuestionType.MULTIPLE_CHOICE:
      question = {
        id: uuidv4(),
        type,
        title: newQuestion.title,
        required: true,
        options: [
          { id: uuidv4(), content: '选项1' },
          { id: uuidv4(), content: '选项2' }
        ],
        logicSettings: initLogicSettings()
      }
      break
    case QuestionType.DATE_TIME:
      question = {
        id: uuidv4(),
        type,
        title: newQuestion.title,
        required: true,
        logicSettings: initLogicSettings()
      }
      break
    case QuestionType.TEXT:
      question = {
        id: uuidv4(),
        type,
        title: newQuestion.title,
        required: true,
        maxLength: 200,
        logicSettings: initLogicSettings()
      }
      break
    default:
      return
  }

  survey.questions.push(question)
  showTypeModal.value = false
  isAddingQuestion.value = false
  currentQuestionId.value = question.id
  showSettingDrawer.value = true
}

// 取消选择类型
const handleTypeCancel = () => {
  showTypeModal.value = false
  isAddingQuestion.value = false
}

// 点击问题
const handleQuestionClick = (question: Question) => {
  currentQuestionId.value = question.id
  showSettingDrawer.value = true
}

// 上移问题
const handleMoveUp = (index: number) => {
  if (index > 0) {
    const temp = survey.questions[index]
    survey.questions[index] = survey.questions[index - 1]
    survey.questions[index - 1] = temp
  }
}

// 下移问题
const handleMoveDown = (index: number) => {
  if (index < survey.questions.length - 1) {
    const temp = survey.questions[index]
    survey.questions[index] = survey.questions[index + 1]
    survey.questions[index + 1] = temp
  }
}

// 删除问题
const handleDelete = (index: number) => {
  survey.questions.splice(index, 1)
  if (currentQuestionId.value === survey.questions[index]?.id) {
    showSettingDrawer.value = false
  }
}

// 添加选项
const handleAddOption = () => {
  if (
    currentQuestion.value &&
    (currentQuestion.value.type === QuestionType.SINGLE_CHOICE ||
      currentQuestion.value.type === QuestionType.MULTIPLE_CHOICE)
  ) {
    ;(currentQuestion.value as ChoiceQuestion).options.push({
      id: uuidv4(),
      content: `选项${(currentQuestion.value as ChoiceQuestion).options.length + 1}`
    })
  }
}

// 删除选项
const handleDeleteOption = (index: number) => {
  if (
    currentQuestion.value &&
    (currentQuestion.value.type === QuestionType.SINGLE_CHOICE ||
      currentQuestion.value.type === QuestionType.MULTIPLE_CHOICE)
  ) {
    ;(currentQuestion.value as ChoiceQuestion).options.splice(index, 1)
  }
}
</script>

<style scoped lang="scss">
.questionnaire-edit {
  padding: 24px;
  background: #fff;
  border-radius: 8px;
  min-height: calc(100vh - 100px);

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    padding-bottom: 16px;
    border-bottom: 1px solid var(--color-border);

    .back-btn {
      padding: 8px 16px;
      color: var(--color-text-2);
      font-size: 14px;
      display: flex;
      align-items: center;
      gap: 4px;
      transition: all 0.3s;
      border-radius: 4px;

      &:hover {
        color: rgb(var(--primary-6));
        background: rgba(var(--primary-6), 0.1);
        transform: translateY(-1px);
      }
    }

    .right {
      .arco-btn {
        height: 36px;
        padding: 0 24px;
        font-weight: 500;
        box-shadow: 0 2px 6px rgba(var(--primary-6), 0.2);
        transition: all 0.3s;

        &:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(var(--primary-6), 0.3);
        }
      }
    }
  }

  .title-section {
    margin-bottom: 24px;
    padding: 24px;
    background: #fff;
    border-radius: 8px;
    border: 1px solid var(--color-border);
    transition: all 0.3s;

    &:hover {
      border-color: rgb(var(--primary-6));
      box-shadow: 0 0 0 2px rgba(var(--primary-6), 0.1);
    }

    :deep(.arco-input) {
      height: 44px;
      font-size: 16px;
      font-weight: 500;
    }
  }

  .questions-section {
    .question-item {
      margin-bottom: 16px;
      padding: 20px;
      background: #fff;
      border-radius: 8px;
      border: 1px solid var(--color-border);
      transition: all 0.3s;
      cursor: pointer;

      &:hover {
        border-color: rgb(var(--primary-6));
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
      }

      &.active {
        border-color: rgb(var(--primary-6));
        box-shadow: 0 0 0 2px rgba(var(--primary-6), 0.1);
      }

      .question-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;

        .left {
          display: flex;
          align-items: center;
          gap: 8px;

          .question-index {
            font-weight: 500;
            color: rgb(var(--primary-6));
          }

          .question-title {
            font-weight: 500;
            font-size: 15px;
          }
        }

        .right {
          .arco-btn {
            transition: all 0.3s;

            &:hover {
              transform: translateY(-1px);
              background: rgba(var(--primary-6), 0.1);
              border-color: rgb(var(--primary-6));
              color: rgb(var(--primary-6));
            }

            &[status='danger']:hover {
              background: var(--color-danger-light-1);
              border-color: rgb(var(--danger-6));
              color: rgb(var(--danger-6));
            }
          }
        }
      }

      .question-content {
        padding: 16px 24px;
        background: rgba(var(--gray-1), 0.5);
        border-radius: 4px;
        max-width: 600px;
        margin-left: 0;

        .option-item {
          margin-bottom: 12px;
          display: flex;
          align-items: center;

          :deep(.arco-radio),
          :deep(.arco-checkbox) {
            width: 100%;
            max-width: 500px;
            padding: 8px 12px;
            border-radius: 4px;
            transition: all 0.3s;

            &:hover {
              background: rgba(var(--primary-6), 0.05);
            }
          }

          &:last-child {
            margin-bottom: 0;
          }
        }

        :deep(.arco-textarea-wrapper) {
          width: 100%;
          background: #fff;
          border-radius: 4px;
          border: 1px solid var(--color-border);

          .arco-textarea {
            padding: 12px;
            font-size: 14px;
          }

          &:hover {
            border-color: rgb(var(--primary-6));
            background: #fff;
          }
        }

        :deep(.arco-picker) {
          width: 100%;
          max-width: 500px;
          height: 38px;
          background: #fff;
          border-radius: 4px;

          &:hover {
            border-color: rgb(var(--primary-6));
          }
        }
      }
    }

    .add-question {
      padding: 24px;
      background: #fff;
      border-radius: 8px;
      border: 1px dashed var(--color-border);
      transition: all 0.3s;

      &:hover {
        border-color: rgb(var(--primary-6));
        background: rgba(var(--primary-6), 0.02);
      }

      .arco-btn {
        height: 44px;
        font-size: 15px;
        font-weight: 500;
        transition: all 0.3s;

        &:hover {
          border-color: rgb(var(--primary-6));
          color: rgb(var(--primary-6));
          background: rgba(var(--primary-6), 0.1);
          transform: translateY(-1px);
        }

        .arco-icon {
          font-size: 18px;
        }
      }
    }

    .new-question {
      margin-bottom: 16px;
      padding: 20px;
      background: #fff;
      border-radius: 8px;
      border: 1px dashed var(--color-border);

      .question-header {
        display: flex;
        align-items: center;
        gap: 16px;

        .question-index {
          font-weight: 500;
          color: rgb(var(--primary-6));
        }

        .arco-btn {
          height: 32px;
          padding: 0 16px;
          font-weight: 500;
          transition: all 0.3s;

          &:hover {
            transform: translateY(-1px);
            box-shadow: 0 2px 6px rgba(var(--primary-6), 0.2);
          }
        }
      }
    }
  }
}

.type-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  padding: 8px;

  .type-item {
    padding: 16px;
    border: 1px solid var(--color-border);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s;
    display: flex;
    align-items: center;
    gap: 12px;
    background: #fff;

    &:hover {
      border-color: rgb(var(--primary-6));
      background: rgba(var(--primary-6), 0.02);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    }

    .type-icon {
      font-size: 24px;
      color: rgb(var(--primary-6));
      padding: 12px;
      background: rgba(var(--primary-6), 0.1);
      border-radius: 8px;
    }

    .type-info {
      flex: 1;

      .type-title {
        font-weight: 500;
        margin-bottom: 4px;
        font-size: 15px;
      }

      .type-desc {
        font-size: 13px;
        color: var(--color-text-3);
        line-height: 1.4;
      }
    }
  }
}

.option-area {
  display: flex;
  flex-direction: column;
  width: 100%;
  
  .option-list {
    display: flex;
    flex-direction: column;
    width: 100%;
    gap: 12px;
    
    .option-edit-item {
      display: flex;
      align-items: center;
      gap: 8px;
      width: 100%;

      :deep(.arco-input-wrapper) {
        flex: 1;
        max-width: 500px;
      }

      :deep(.arco-btn) {
        flex-shrink: 0;
      }
    }
  }

  .option-actions {
    margin-top: 16px;

    .arco-btn {
      height: 32px;
      padding: 0 16px;
      font-weight: 500;
      transition: all 0.3s;

      &:hover {
        transform: translateY(-1px);
        box-shadow: 0 2px 6px rgba(var(--primary-6), 0.2);
      }
    }
  }
}

.logic-settings {
  padding: 16px;
  background: #fff;
  border-radius: 4px;
  border: 1px solid var(--color-border);

  .condition-text {
    margin-left: 8px;
    color: var(--color-text-3);
  }

  .logic-rules {
    margin-top: 16px;

    .logic-rule {
      margin-bottom: 16px;
      padding: 16px;
      background: var(--color-fill-1);
      border-radius: 4px;
      border: 1px solid var(--color-border);

      .rule-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;

        .rule-index {
          font-weight: 500;
          color: rgb(var(--primary-6));
        }

        .delete-btn {
          padding: 4px 8px;
          
          &:not(:disabled):hover {
            color: rgb(var(--danger-6));
            background: var(--color-danger-light-1);
          }
        }
      }

      .rule-content {
        display: flex;
        flex-flow: row wrap;
        gap: 16px;

        :deep(.arco-form-item) {
          margin-bottom: 0;
        }

        :deep(.arco-form-item-label-col) {
          padding-right: 12px;
        }
      }

      &:last-child {
        margin-bottom: 0;
      }
    }
  }

  .add-rule {
    margin-top: 16px;
    text-align: center;

    .arco-btn {
      width: 200px;
      height: 36px;
      font-weight: 500;
      transition: all 0.3s;

      &:hover {
        border-color: rgb(var(--primary-6));
        color: rgb(var(--primary-6));
        background: rgba(var(--primary-6), 0.1);
      }

      .arco-icon {
        margin-right: 4px;
      }
    }
  }
}
</style>
