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
        v-model="survey.surveysTitle"
        placeholder="请输入问卷标题"
        :style="{ width: '100%' }"
        size="large"
        allow-clear
      />
    </div>

    <!-- 问题列表 -->
    <div class="questions-section">
      <div
        v-for="(question, index) in survey.questionList"
        :key="question.questionId"
        class="question-item"
        :class="{ active: currentQuestionId === question.questionId }"
        @click="handleQuestionClick(question)"
      >
        <div class="question-header">
          <div class="left">
            <span class="question-index">Q{{ index + 1 }}</span>
            <span class="question-title">{{ question.questionTitle }}</span>
            <a-tag size="small" :color="question.isRequired === '1' ? 'red' : ''">
              {{ question.isRequired === '1' ? '必填' : '选填' }}
            </a-tag>
          </div>
          <div class="right">
            <a-space>
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
              question.questionType === QuestionType.SINGLE_CHOICE ||
              question.questionType === QuestionType.MULTIPLE_CHOICE
            "
          >
            <div
              v-for="option in question.optionList"
              :key="option.optionId || option.frontOptionId"
              class="option-item"
            >
              <a-radio v-if="question.questionType === QuestionType.SINGLE_CHOICE" :disabled="true">
                {{ option.optionText }}
              </a-radio>
              <a-checkbox v-else :disabled="true">{{ option.optionText }}</a-checkbox>
            </div>
          </template>

          <template v-else-if="question.questionType === QuestionType.DATE">
            <a-date-picker :disabled="true" style="width: 200px" />
          </template>

          <template v-else-if="question.questionType === QuestionType.TEXT">
            <a-textarea :disabled="true" placeholder="请输入" />
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
          <span class="question-index">Q{{ survey.questionList.length + 1 }}</span>
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
            <a-input
              v-model="currentQuestion.questionTitle"
              placeholder="请输入问题标题"
              allow-clear
            />
          </a-form-item>
          <a-form-item field="required" label="是否必填">
            <a-switch 
              :model-value="currentQuestion.isRequired === '1'"
              @change="(val) => currentQuestion.isRequired = val ? '1' : '0'"
            />
          </a-form-item>

          <!-- 选择题特有设置 -->
          <template
            v-if="
              currentQuestion.questionType === QuestionType.SINGLE_CHOICE ||
              currentQuestion.questionType === QuestionType.MULTIPLE_CHOICE
            "
          >
            <a-divider>选项列表</a-divider>
            <a-form-item label="选项列表">
              <div class="option-area">
                <div class="option-list">
                  <div
                    v-for="(option, index) in currentQuestion.optionList as Array<OptionRequest>"
                    :key="option.optionId"
                    class="option-edit-item"
                  >
                    <a-input v-model="option.optionText" placeholder="请输入选项内容" allow-clear>
                      <template #prefix>{{ String.fromCharCode(65 + index) }}.</template>
                    </a-input>
                    <a-button
                      type="text"
                      status="danger"
                      :disabled="currentQuestion.optionList.length <= 2"
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

          <!-- 展示逻辑设置 -->
          <a-divider>展示逻辑</a-divider>
          <div class="logic-settings">
            <a-form-item label="符合条件时">
              <a-select
                v-model="currentQuestion.logic.showType"
                placeholder="请选择显示条件"
                style="width: 160px"
              >
                <a-option :value="LogicShowType.ALL">全部</a-option>
                <a-option :value="LogicShowType.ANY">任一</a-option>
              </a-select>
              <span class="condition-text">关联条件时才显示本题目</span>
            </a-form-item>

            <!-- 如果没有可选的前置题目，显示提示 -->
            <div v-if="previousQuestions.length === 0" class="empty-tip">
              <a-empty description="暂无可关联的选择题" />
            </div>

            <!-- 有可选的前置题目时显示规则列表 -->
            <template v-else>
              <div class="logic-rules">
                <div
                  v-for="(rule, index) in currentQuestion?.logic?.logicConditionList"
                  :key="index"
                  class="logic-rule"
                >
                  <div class="rule-header">
                    <span class="rule-index">条件{{ index + 1 }}：</span>
                    <a-button
                      type="text"
                      status="danger"
                      class="delete-btn"
                      @click="removeLogicRule(Number(index))"
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
                          :key="q.questionId || q.frontQuestionId"
                          :value="q.questionId || q.frontQuestionId"
                          :disabled="
                            q.questionId === currentQuestion.questionId ||
                            q.frontQuestionId === currentQuestion.frontQuestionId
                          "
                        >
                          {{ q.questionTitle }}
                        </a-option>
                      </a-select>
                    </a-form-item>
                    <a-form-item label="选项操作">
                      <a-select
                        v-model="rule.operationType"
                        placeholder="选择条件"
                        style="width: 200px"
                      >
                        <a-option :value="LogicShowType.ANY">任一选中</a-option>
                        <a-option :value="LogicShowType.ALL">全部选中</a-option>
                      </a-select>
                    </a-form-item>
                    <a-form-item label="选项选择" v-if="rule.questionId">
                      <a-select
                        v-model="rule.selectedOptionIds"
                        placeholder="请选择选项"
                        style="width: 200px"
                        allow-clear
                        multiple
                      >
                        <a-option
                          v-for="option in getRelatedQuestionOptions(rule?.questionId || rule?.frontQuestionId)"
                          :key="option.optionId || option.frontOptionId || option.optionText"
                          :value="option.optionId || option.frontOptionId"
                          :label="option.optionText"
                        >
                          {{ option.optionText }}
                        </a-option>
                      </a-select>
                    </a-form-item>
                  </div>
                </div>
              </div>

              <div class="add-rule">
                <a-button 
                  type="dashed" 
                  @click="addLogicRule"
                  :disabled="previousQuestions.length === 0"
                >
                  <template #icon><icon-plus /></template>
                  添加条件
                </a-button>
              </div>
            </template>
          </div>
        </a-form>
      </template>
    </a-drawer>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import {
  IconCalendar,
  IconDelete,
  IconDown,
  IconFile,
  IconLeft,
  IconList,
  IconPlus,
  IconUp
} from '@arco-design/web-vue/es/icon'
import {
  Logic,
  LogicCondition,
  LogicShowType,
  OptionRequest,
  QuestionRequest,
  QuestionType,
  SurveyRequest
} from '@/types/survey'
import { v4 as uuidv4 } from 'uuid'
import { copySurvey, getEditSurvey, saveSurvey } from '@/api/survey'

const router = useRouter()
const route = useRoute()

// 编辑模式：new(新建) / edit(编辑) / copy(复制)
const editType = computed(() => (route.query.type as string) || 'new')

// 问卷数据
const survey = ref<SurveyRequest>({
  surveyId: '',
  surveysTitle: '',
  questionList: []
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
    value: QuestionType.DATE,
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
const currentQuestion = computed(() =>
  survey.value.questionList.find(
    q => q.frontQuestionId === currentQuestionId.value || q.questionId === currentQuestionId.value
  )
)

// 获取可以作为逻辑条件的前置问题（只返回单选和多选题）
const previousQuestions = computed(() => {
  const currentIndex = survey.value.questionList.findIndex(
    q => q.questionId === currentQuestionId.value
  )
  return survey.value.questionList.slice(0, currentIndex).filter(q => 
    q.questionType === QuestionType.SINGLE_CHOICE || 
    q.questionType === QuestionType.MULTIPLE_CHOICE
  )
})

// 在 LogicCondition 接口中添加一个临时字段用于存储选中的选项ID
interface LogicConditionWithSelectedIds extends LogicCondition {
  selectedOptionIds: string[]
}

// 初始化逻辑设置
const initLogicSettings = (): Logic => {
  return {
    showType: LogicShowType.ALL,
    logicConditionList: []
  }
}

// 当前问题的逻辑设置
const logicSettings = computed({
  get: () => {
    if (!currentQuestion.value?.logic) {
      currentQuestion.value!.logic = initLogicSettings()
    }
    return currentQuestion.value!.logic
  },
  set: (value: Logic) => {
    if (currentQuestion.value) {
      currentQuestion.value.logic = value
    }
  }
})

// 添加逻辑规则
const addLogicRule = () => {
  if (!currentQuestion.value) return
  
  if (!currentQuestion.value.logic) {
    currentQuestion.value.logic = {
      showType: LogicShowType.ALL,
      logicConditionList: []
    }
  }
  
  // 初始化一个新的逻辑条件
  const newLogicCondition: LogicConditionWithSelectedIds = {
    logicConditionId: '',
    logicId: '',
    questionId: '',
    frontQuestionId: '',
    questionTitle: '',
    operationType: LogicShowType.ALL,
    logicConditionOptionList: [],
    selectedOptionIds: [] // 初始化为空数组
  }
  
  currentQuestion.value.logic.logicConditionList.push(newLogicCondition)
}

// 处理问题点击，初始化逻辑条件的selectedOptionIds
const handleQuestionClick = (question: QuestionRequest) => {
  // 如果logic是空值则初始化一下
  if (!question.logic) {
    question.logic = initLogicSettings()
  }
  
  // 初始化每个逻辑条件的selectedOptionIds和关联问题ID
  if (question.logic.logicConditionList) {
    question.logic.logicConditionList.forEach(rule => {
      // 从logicConditionOptionList中提取选项ID
      const selectedIds = rule.logicConditionOptionList.map(option => 
        option.optionId || option.frontOptionId || ''
      ).filter(id => id)
      
      // 设置selectedOptionIds
      ;(rule as LogicConditionWithSelectedIds).selectedOptionIds = selectedIds
      
      // 如果questionId为null，尝试从选项中找到关联的问题
      if (!rule.questionId && !rule.frontQuestionId && rule.logicConditionOptionList.length > 0) {
        const firstOptionId = rule.logicConditionOptionList[0].optionId || rule.logicConditionOptionList[0].frontOptionId
        
        // 查找包含该选项的问题
        const relatedQuestion = survey.value.questionList.find(q => 
          q.optionList?.some(opt => 
            opt.optionId === firstOptionId || opt.frontOptionId === firstOptionId
          )
        )
        
        if (relatedQuestion) {
          rule.questionId = relatedQuestion.questionId
          rule.frontQuestionId = relatedQuestion.frontQuestionId
          rule.questionTitle = relatedQuestion.questionTitle
        }
      }
    })
  }
  
  // 使用 frontQuestionId 作为主要标识，因为新建的问题只有 frontQuestionId
  currentQuestionId.value = question.frontQuestionId || question.questionId || ''
  showSettingDrawer.value = true
}

// 监听选项ID变化，更新logicConditionOptionList
const updateLogicOptions = (rule: LogicConditionWithSelectedIds) => {
  if (!rule.selectedOptionIds || !rule.questionId) return
  
  // 获取关联题目的所有选项
  const allOptions = getRelatedQuestionOptions(rule.questionId || rule.frontQuestionId)
  
  // 根据选中的ID过滤出选中的选项
  rule.logicConditionOptionList = rule.selectedOptionIds
    .filter(id => id) // 过滤掉空字符串
    .map(id => {
      const option = allOptions.find(o => o.optionId === id || o.frontOptionId === id)
      if (option) {
        return {
          logicConditionOptionId: '',
          logicConditionId: rule.logicConditionId || '',
          optionId: option.optionId || '',
          frontOptionId: option.frontOptionId || '',
          optionText: option.optionText
        }
      }
      return null
    }).filter(Boolean) as LogicConditionOption[]
}

// 添加监听器
watch(() => currentQuestion.value?.logic?.logicConditionList, (newList) => {
  if (!newList) return
  
  // 为每个规则添加监听
  newList.forEach(rule => {
    watch(() => (rule as LogicConditionWithSelectedIds).selectedOptionIds, () => {
      updateLogicOptions(rule as LogicConditionWithSelectedIds)
    }, { deep: true })
  })
}, { deep: true, immediate: true })

// 删除逻辑规则
const removeLogicRule = (index: number) => {
  logicSettings.value.logicConditionList.splice(index, 1)
}

// 获取关联题目的选项（questionId 或 frontQuestionId）
const getRelatedQuestionOptions = (questionId: string) => {
  if (!questionId) return []
  
  const question = survey.value.questionList.find(q => 
    (q.questionId === questionId || q.frontQuestionId === questionId) && 
    (q.questionType === QuestionType.SINGLE_CHOICE || q.questionType === QuestionType.MULTIPLE_CHOICE)
  )
  return question?.optionList || []
}

// 返回上一页
const handleBack = () => {
  router.back()
}

// 初始化问卷数据
const initSurvey = async () => {
  if (editType.value === 'new') {
    // 新建问卷
    survey.value = {
      surveyId: '',
      surveysTitle: '未命名问卷',
      questionList: []
    }
  } else {
    // 编辑或复制
    const surveyId = route.query.surveyId as string
    try {
      let response: SurveyRequest

      if (editType.value === 'copy') {
        // 复制问卷
        response = await copySurvey({ surveyId })
      } else {
        // 编辑问卷
        response = await getEditSurvey({ surveyId })
      }

      // 转换数据结构
      survey.value = response
    } catch (error) {
      Message.error(editType.value === 'copy' ? '复制问卷失败' : '获取问卷详情失败')
    }
  }
}

// 保存问卷
const handleSave = async () => {
  try {
    const request: SurveyRequest = survey.value

    // 重新设置问题排序
    request.questionList.forEach((question, index) => {
      question.questionSort = (index + 1).toString()
      
      // 当逻辑的List为空时，不保存逻辑
      if (question.logic && question.logic.logicConditionList.length === 0) {
        question.logic = null
      }
    })
    
    console.log(request)

    const response = await saveSurvey(request)
    if (response) {
      Message.success('保存成功')
      router.push('/pc/questionnaireManagement')
    }
  } catch (error) {
    console.log(error)
  }
}

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

// 选择问题类型 此时必然是新建问题
const handleTypeSelect = (type: QuestionType) => {
  const newQuestionId = `new_${uuidv4()}`
  const question: QuestionRequest = {
    frontQuestionId: newQuestionId,
    questionType: type,
    questionTitle: newQuestion.title || '新问题',
    isRequired: '0',  // 默认非必填
    questionSort: (survey.value.questionList.length + 1).toString(),
    optionList:
      type === QuestionType.SINGLE_CHOICE || type === QuestionType.MULTIPLE_CHOICE
        ? [
            {
              frontOptionId: `new_${uuidv4()}`,
              optionText: '选项1',
              optionSort: '1'
            },
            {
              frontOptionId: `new_${uuidv4()}`,
              optionText: '选项2',
              optionSort: '2'
            }
          ]
        : [],
    logic: {
      logicConditionList: [],
      showType: LogicShowType.ANY
    }
  }

  survey.value.questionList.push(question)
  // 添加问题后立即设置为当前问题
  currentQuestionId.value = newQuestionId
  showSettingDrawer.value = true
  showTypeModal.value = false
  isAddingQuestion.value = false
}

// 取消选择类型
const handleTypeCancel = () => {
  showTypeModal.value = false
  isAddingQuestion.value = false
}

// 删除问题
const handleDelete = (index: number) => {
  const question = survey.value.questionList[index]
  if (currentQuestionId.value === (question.frontQuestionId || question.questionId)) {
    currentQuestionId.value = ''
    showSettingDrawer.value = false
  }
  survey.value.questionList.splice(index, 1)
}

// 添加选项
const handleAddOption = () => {
  if (
    currentQuestion.value &&
    (currentQuestion.value.questionType === QuestionType.SINGLE_CHOICE ||
      currentQuestion.value.questionType === QuestionType.MULTIPLE_CHOICE)
  ) {
    currentQuestion.value.optionList?.push({
      frontOptionId: `new_${uuidv4()}`,
      optionText: `选项${currentQuestion.value.optionList?.length + 1}`,
      optionSort: (currentQuestion.value.optionList?.length + 1).toString()
    })
  }
}

// 删除选项
const handleDeleteOption = (index: number) => {
  if (
    currentQuestion.value &&
    (currentQuestion.value.questionType === QuestionType.SINGLE_CHOICE ||
      currentQuestion.value.questionType === QuestionType.MULTIPLE_CHOICE)
  ) {
    currentQuestion.value?.optionList?.splice(index, 1)
    
    // 重新排序
    currentQuestion.value?.optionList?.forEach((option, idx) => {
      option.optionSort = (idx + 1).toString()
    })
  }
}

onMounted(() => {
  initSurvey()
})
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

  .empty-tip {
    padding: 24px;
    text-align: center;
    background: var(--color-fill-2);
    border-radius: 4px;
  }
}
</style>
