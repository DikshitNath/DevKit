import axios from 'axios'

export const generateBody = async (description) => {
  const res = await axios.post('/api/ai/generate-body', { description }, { withCredentials: true })
  return res.data.body
}

export const explainResponse = async (request, response) => {
  const res = await axios.post('/api/ai/explain-response', { request, response }, { withCredentials: true })
  return res.data.explanation
}