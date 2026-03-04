import axios from 'axios'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const api = axios.create({
  baseURL: API,
  withCredentials: true
})

export const getSnippets = async () => {
  const res = await api.get('/api/snippets')
  // handle both { snippets: [...] } and [...] response shapes
  return Array.isArray(res.data) ? res.data : (res.data.snippets || [])
}

export const createSnippet = async (data) => {
  const res = await api.post('/api/snippets', data)
  return res.data
}

export const updateSnippet = async (id, data) => {
  const res = await api.put(`/api/snippets/${id}`, data)
  return res.data
}

export const deleteSnippet = async (id) => {
  const res = await api.delete(`/api/snippets/${id}`)
  return res.data
}