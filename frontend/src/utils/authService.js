import axios from 'axios'

export const register = async (username, email, password) => {
  const res = await axios.post('/api/auth/register', { username, email, password }, { withCredentials: true })
  return res.data
}

export const login = async (email, password) => {
  const res = await axios.post('/api/auth/login', { email, password }, { withCredentials: true })
  return res.data
}

export const logout = async () => {
  const res = await axios.post('/api/auth/logout', {}, { withCredentials: true })
  return res.data
}

export const getMe = async () => {
  const res = await axios.get('/api/auth/me', { withCredentials: true })
  return res.data
}