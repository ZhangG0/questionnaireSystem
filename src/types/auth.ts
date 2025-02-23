// 登录请求参数类型
export interface LoginParams {
  userAccount: string
  userPassword: string
}

// 登录响应数据类型
export interface LoginResponse {
  accessToken: string
  expireIn: number
}

// 注册请求参数类型
export interface RegisterParams {
  userAccount: string
  userPassword: string
  wechatName?: string
}

// 更新用户信息参数类型
export interface UpdateUserParams {
  userAccount: string
  userPassword: string
  wechatName?: string
}

// 修改用户详情参数类型
export interface UpdateUserDetailParams {
  userId: string
  userAccount: string
  userPassword: string
  wechatName: string
}

// 用户列表查询参数
export interface UserQueryParams {
  userAccount?: string
  wechatName?: string
  startTime?: string
  endTime?: string
}

// 用户问卷信息
export interface UserSurvey {
  surveyId: string
  surveyTitle: string
  bindTime: string
  responseId: string | null
  responseStatus: string
}

// 用户详情信息
export interface UserDetailInfo {
  userId: string
  userAccount: string
  userPassword: string
  wechatName: string
  surveysUserVOList: UserSurvey[]
}

// 用户信息类型
export interface UserInfo {
  id: string
  userAccount: string
  userPassword: string
  wechatName: string
  userRole: string
  gmtCreate: string
  gmtModified: string
  status: string
} 