import { post } from '@/utils/request';
import type { SurveyRequest } from '@/types/survey';

/**
 * 保存问卷
 * @param params 保存问卷的请求参数
 */
export const saveSurvey = (params: SurveyRequest) => {
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
export const getSurveysList = () => {
  return post<{ id: string; title: string; description: string | null; gmtCreate: string; gmtModified: string; status: string }[]>('/surveys/getSurveysList');
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