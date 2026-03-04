import axios from 'axios'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export const generateBody = async (description) => {
  const res = await axios.post(`${API}/api/ai/generate-body`, { description }, { withCredentials: true })
  return res.data.body
}

export const explainResponse = async (request, response) => {
  const res = await axios.post(`${API}/api/ai/explain-response`, { request, response }, { withCredentials: true })
  return res.data.explanation
}