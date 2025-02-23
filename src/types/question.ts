// 问题类型枚举
export enum QuestionType {
  SINGLE_CHOICE = 'single_choice',
  MULTIPLE_CHOICE = 'multiple_choice',
  DATE_TIME = 'date_time',
  TEXT = 'text'
}

// 逻辑操作符枚举
export enum LogicOperator {
  SELECTED = 'selected',
  NOT_SELECTED = 'not_selected'
}

// 逻辑条件枚举
export enum LogicCondition {
  ALL = 'all',
  ANY = 'any'
}

// 逻辑规则接口
export interface LogicRule {
  questionId: string
  operator: LogicOperator
  optionId: string
}

// 逻辑设置接口
export interface LogicSettings {
  condition: LogicCondition
  rules: LogicRule[]
}

// 问题选项接口
export interface QuestionOption {
  id: string
  content: string
}

// 问题基础接口
export interface BaseQuestion {
  id: string
  type: QuestionType
  title: string
  required: boolean
  description?: string
  logicSettings?: LogicSettings
}

// 选择题接口
export interface ChoiceQuestion extends BaseQuestion {
  type: QuestionType.SINGLE_CHOICE | QuestionType.MULTIPLE_CHOICE
  options: QuestionOption[]
  other?: boolean
}

// 时间日期题接口
export interface DateTimeQuestion extends BaseQuestion {
  type: QuestionType.DATE_TIME
  showTime: boolean
}

// 填空题接口
export interface TextQuestion extends BaseQuestion {
  type: QuestionType.TEXT
  maxLength?: number
}

// 问题类型联合
export type Question = ChoiceQuestion | DateTimeQuestion | TextQuestion 