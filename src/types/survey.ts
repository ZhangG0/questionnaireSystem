// 问题类型枚举
export enum QuestionType {
  SINGLE_CHOICE = 'single_choice', // 单选题
  MULTIPLE_CHOICE = 'multiple_choice', // 多选题
  DATE_TIME = 'date_time', // 时间日期
  TEXT = 'text' // 填空题
}

// 逻辑规则操作符
export enum LogicOperator {
  SELECTED = 'selected',
  NOT_SELECTED = 'not_selected'
}

// 逻辑规则条件
export enum LogicCondition {
  ALL = 'all',
  ANY = 'any'
}

// 逻辑规则
export interface LogicRule {
  questionId: string
  operator: LogicOperator
  optionId?: string
}

// 展示逻辑设置
export interface LogicSettings {
  condition: LogicCondition
  rules: LogicRule[]
}

// 问题选项类型
export interface QuestionOption {
  id: string
  content: string
}

// 问题基础类型
export interface BaseQuestion {
  id: string
  type: QuestionType
  title: string
  required: boolean
  logicSettings?: LogicSettings
}

// 选择题（单选/多选）
export interface ChoiceQuestion extends BaseQuestion {
  type: QuestionType.SINGLE_CHOICE | QuestionType.MULTIPLE_CHOICE
  options: QuestionOption[]
}

// 时间日期题
export interface DateTimeQuestion extends BaseQuestion {
  type: QuestionType.DATE_TIME
}

// 填空题
export interface TextQuestion extends BaseQuestion {
  type: QuestionType.TEXT
  maxLength?: number // 最大字数限制
}

// 问题类型联合
export type Question = ChoiceQuestion | DateTimeQuestion | TextQuestion

// 问卷类型
export interface Survey {
  id: string
  title: string
  questions: Question[]
  isPublished: boolean
  createTime?: string
  updateTime?: string
}

// 问卷请求参数类型
export interface SurveyRequest {
  surveyId: string;
  surveysTitle: string;
  questionList: QuestionRequest[];
}

// 问题请求参数类型
export interface QuestionRequest {
  frontQuestionId: string;
  questionId: string;
  surveyId: string;
  questionType: string; // 1: 单选, 2: 多选, 3: 时间日期, 4: 填空
  questionTitle: string;
  isRequired: string; // "1" 或 "0"
  questionSort: string;
  optionList: OptionRequest[];
  logic?: LogicRequest | null; // 逻辑设置
}

// 选项请求参数类型
export interface OptionRequest {
  frontOptionId: string;
  optionId: string;
  questionId: string;
  optionText: string;
  optionSort: string;
}

// 逻辑请求参数类型
export interface LogicRequest {
  logicId: string;
  questionId: string;
  showType: string; // 假设为 "1"
  logicConditionList: LogicConditionRequest[];
}

// 逻辑条件请求参数类型
export interface LogicConditionRequest {
  logicConditionId: string;
  logicId: string;
  questionId: string;
  frontQuestionId: string;
  questionTitle: string;
  operationType: string; // "1" 或 "2"
  logicConditionOptionList: LogicConditionOptionRequest[];
}

// 逻辑条件选项请求参数类型
export interface LogicConditionOptionRequest {
  logicConditionOptionId: string;
  logicConditionId: string;
  optionId: string;
  frontOptionId: string;
  optionText: string;
} 