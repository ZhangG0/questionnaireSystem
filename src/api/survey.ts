import { post } from '@/utils/request';
import type { SurveyRequest, SurveyDetail } from '@/types/survey';

/**
 * 保存问卷
 * @param params 保存问卷的请求参数
 */
export const saveSurvey = (params: SurveyRequest) => {
  console.log(params);
  return post<string>('/surveys/saveSurveys', params);
}

/**
 * 删除问卷
 * @param params 删除问卷的请求参数
 */
export const deleteSurvey = (params: { surveyId: string }) => {
  return post<boolean>('/surveys/logicDeleteSurveys', params);
}

/**
 * 下发问卷
 * @param params 下发问卷的请求参数
 */
export const issueSurvey = (params: { surveyId: string }) => {
  return post<string>('/surveys/issueSurvey', params);
}

/**
 * 获取问卷列表
 */
interface SurveyListResponse {
  id: string
  title: string
  description: string | null
  gmtCreate: string
  gmtModified: string
  status: string
}

export const getSurveysList = () => {
  return post<SurveyListResponse[]>('/surveys/getSurveysList')
}

/**
 * 获取问卷回答列表
 */
interface GetUserResponseParams {
  userAccount?: string
  wechatName?: string
  startTime?: string
  endTime?: string
  surveyId: string
}

interface UserResponse {
  userId: string
  userAccount: string
  wechatName: string
  submitTime: string
  responseId: string
}

export const getUserResponse = (params: GetUserResponseParams) => {
  return post<UserResponse[]>('/responses/getUserResponse', params);
}

/**
 * 获取问卷数量统计
 */
interface QuantityStatisticsResponse {
  todayAdd: string
  total: string
}

export const getQuantityStatistics = (params: { surveyId: string }) => {
  return post<QuantityStatisticsResponse>('/responses/getQuantityStatistics', params);
}

/**
 * 获取 H5 端问卷列表
 */
export const getH5SurveysList = () => {
  return post<{
    surveyId: string
    status: string
    bindTime: string
  }[]>('/app/surveys/list')
}

/**
 * 获取问卷详情
 */
export const getH5SurveyDetail = (params: { surveyId: string }) => {
  return post<SurveyDetail>('/app/surveys/getSurveysBySurveyId', params)
}

/**
 * 复制问卷
 */
export const copySurvey = (params: { surveyId: string }) => {
  return post<SurveyRequest>('/surveys/copySurveys', params)
}

/**
 * 获取编辑问卷详情
 */
export const getEditSurvey = (params: { surveyId: string }) => {
  return post<SurveyRequest>('/surveys/editSurveys', params)
} 