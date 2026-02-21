import axios from 'axios'

const api = axios.create({ withCredentials: true })

export const getSnippets = async () => {
  const res = await api.get('/api/snippets')
  return res.data
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