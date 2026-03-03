import axios from 'axios'

const api = axios.create({ withCredentials: true })

export const register = async (username, email, password) => {
  const res = await api.post('/api/auth/register', { username, email, password })
  return res.data
}

export const login = async (email, password) => {
  const res = await api.post('/api/auth/login', { email, password })
  return res.data
}

export const logout = async () => {
  const res = await api.post('/api/auth/logout')
  return res.data
}

export const getMe = async () => {
  const res = await api.get('/api/auth/me')
  return res.data
}

export const updateProfile = async (data) => {
  const res = await api.put('/api/auth/profile', data)
  return res.data
}

export const forgotPassword = async (email) => {
  const res = await api.post('/api/auth/forgot-password', { email })
  return res.data
}

export const resetPassword = async (token, password) => {
  const res = await api.post('/api/auth/reset-password', { token, password })
  return res.data
}

export const deleteAccount = async (password) => {
  const res = await api.delete('/api/auth/delete-account', {
    data: { password },
  })
  return res.data
}