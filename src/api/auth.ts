import { post, get } from '@/utils/request'
import type { LoginParams, LoginResponse, UpdateUserParams, UserInfo, UserQueryParams, RegisterParams, UserDetailInfo, UpdateUserDetailParams, H5LoginParams } from '@/types/auth'

/**
 * 用户登录
 * @param params 登录参数
 */
export const login = (params: LoginParams) => {
  return post<LoginResponse>('/user/login', params)
}

/**
 * 用户登出
 */
export const logout = () => {
  return post<void>('/user/logout')
}

/**
 * 获取用户信息
 */
export const getUserInfo = () => {
  return post<UserInfo>('/user/getLoginUser')
}

/**
 * 获取用户详情
 * @param userId 用户ID
 */
export const getUserDetail = (userId: string) => {
  return post<UserDetailInfo>('/user/getUserInfo', { userId })
}

/**
 * 修改用户详情
 * @param params 修改用户详情参数
 */
export const updateUserDetail = (params: UpdateUserDetailParams) => {
  return post<boolean>('/user/update', params)
}

/**
 * 注册新用户
 * @param params 注册参数
 */
export const register = (params: RegisterParams) => {
  return post<string>('/user/register', params)
}

/**
 * 更新用户信息（包括修改密码）
 * @param params 更新用户参数
 */
export const updateUser = (params: UpdateUserParams) => {
  return post<void>('/user/updateLoginUser', params)
}

/**
 * 查询用户列表
 * @param params 查询参数
 */
export const queryUserList = (params: UserQueryParams) => {
  return post<UserInfo[]>('/user/queryUserList', params)
}

/**
 * H5 用户登录
 * @param params 登录参数
 */
export const h5Login = (params: H5LoginParams) => {
  return post<LoginResponse>('/app/user/login', params)
}

/**
 * H5 更新用户信息
 * @param params 更新用户参数
 */
export const h5UpdateUser = (params: { wechatName: string }) => {
  return post<string>('/app/user/update', params)
}

/**
 * H5 获取用户信息
 */
export const h5GetUserInfo = () => {
  return post<UserInfo>('/app/user/info')
}
