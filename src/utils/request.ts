import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosRequestHeaders } from 'axios'
import { Message } from '@arco-design/web-vue'
import { getToken, removeToken } from './auth'
import router from "@/router";

// 创建 axios 实例
const request: AxiosInstance = axios.create({
  baseURL: 'http://57.180.252.48',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json;charset=utf-8'
  }
})

// 请求拦截器
request.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getToken()
    if (token && config.headers) {
      (config.headers as AxiosRequestHeaders).Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    Message.error('请求发送失败')
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  (response: AxiosResponse) => {
    const { data } = response
    if (data.code === 200) {
      return data.data
    } else {
      switch (Number(data.code)) {
        case 401:
          Message.error('登录已过期，请重新登录')
          // 清除 token
          removeToken()
          // 判断当前路径是否为 H5 端
          const isH5 = window.location.pathname.startsWith('/h5')
          router.push(isH5 ? '/h5/login' : '/pc/login')
          return Promise.reject(new Error('登录已过期'))
        case 403:
          Message.error('没有权限访问')
          return Promise.reject(new Error('没有权限访问'))
        case 404:
          Message.error('请求的资源不存在')
          return Promise.reject(new Error('资源不存在'))
        case 500:
          Message.error('服务器错误')
          return Promise.reject(new Error('服务器错误'))
        default:
          Message.error(data?.message || '请求失败')
          return Promise.reject(new Error(data?.message || '请求失败'))
      }
    }
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response
      switch (status) {
        case 401:
          Message.error('登录已过期，请重新登录')
          // 清除 token
          removeToken()
          // 判断当前路径是否为 H5 端
          const isH5 = window.location.pathname.startsWith('/h5')
          router.push(isH5 ? '/h5/login' : '/pc/login')
          return Promise.reject(new Error('登录已过期'))
        case 403:
          Message.error('没有权限访问')
          return Promise.reject(new Error('没有权限访问'))
        case 404:
          Message.error('请求的资源不存在')
          return Promise.reject(new Error('资源不存在'))
        case 500:
          Message.error('服务器错误')
          return Promise.reject(new Error('服务器错误'))
        default:
          Message.error(data?.message || '请求失败')
          return Promise.reject(new Error(data?.message || '请求失败'))
      }
    } else if (error.request) {
      Message.error('网络错误，请检查网络连接')
      return Promise.reject(new Error('网络错误'))
    } else {
      Message.error('请求配置错误')
      return Promise.reject(new Error('请求配置错误'))
    }
  }
)

// 定义响应数据的类型接口
export interface ApiResponse<T = any> {
  code: number
  data: T
  message: string
}

// 封装 GET 请求
export function get<T = any>(url: string, params?: any): Promise<T> {
  return request.get(url, { params })
}

// 封装 POST 请求
export function post<T = any>(url: string, data?: any): Promise<T> {
  return request.post(url, data)
}

// 封装 PUT 请求
export function put<T = any>(url: string, data?: any): Promise<T> {
  return request.put(url, data)
}

// 封装 DELETE 请求
export function del<T = any>(url: string): Promise<T> {
  return request.delete(url)
}

export default request 