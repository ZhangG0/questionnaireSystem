// Token 的 key
const TOKEN_KEY = 'admin_token'

// 获取 token
export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY)
}

// 设置 token
export const setToken = (token: string) => {
  localStorage.setItem(TOKEN_KEY, token)
}

// 删除 token
export const removeToken = () => {
  localStorage.removeItem(TOKEN_KEY)
} 