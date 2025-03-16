// 问题类型枚举
export enum QuestionType {
  SINGLE_CHOICE = '1',   // 单选
  MULTIPLE_CHOICE = '2', // 多选
  DATE = '3',           // 日期
  TEXT = '4'            // 文本
}

// 逻辑展示类型枚举
export enum LogicShowType {
  ALL = '1',  // 全部条件
  ANY = '2'   // 任一条件
}

// API 接口相关类型
export interface SurveyRequest {
  surveyId: string
  surveysTitle: string
  questionList: QuestionRequest[]
}

export interface QuestionRequest {
  frontQuestionId?: string  // 前端生成的问题ID
  questionId?: string       // 后端返回的问题ID
  surveyId?: string        // 问卷ID
  questionType: QuestionType
  questionTitle: string
  isRequired: string       // "1" 或 "0"
  questionSort: string
  optionList?: OptionRequest[]
  logic: Logic | null
}

export interface OptionRequest {
  frontOptionId?: string
  optionId?: string
  questionId?: string
  optionText: string
  optionSort: string
}

// 逻辑相关类型
export interface Logic {
  logicId?: string
  questionId?: string
  showType: LogicShowType
  logicConditionList: LogicCondition[]
}

export interface LogicCondition {
  logicConditionId?: string
  logicId?: string
  questionId?: string
  frontQuestionId?: string
  questionTitle: string
  operationType: LogicShowType
  logicConditionOptionList: LogicConditionOption[]
}

export interface LogicConditionOption {
  logicConditionOptionId?: string
  logicConditionId?: string
  optionId?: string
  frontOptionId?: string
  optionText: string
}

// 问卷详情
export interface SurveyDetail {
  surveyId: string
  surveysTitle: string
  questionList: Question[]
}

// 问题
export interface Question {
  frontQuestionId: string
  questionId: string
  surveyId: string
  questionType: string
  questionTitle: string
  isRequired: string
  questionSort: string
  optionList: Option[]
  logic: Logic | null
}

// 选项
export interface Option {
  frontOptionId: string
  optionId: string
  questionId: string
  optionText: string
  optionSort: string
  optionResult: boolean | string | null
} 