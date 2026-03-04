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

export const generateSnippet = async (prompt, language) => {
  const res = await axios.post(`${API}/api/ai/generate-snippet`, { prompt, language }, { withCredentials: true })
  return res.data.code
}

export const explainJson = async (json) => {
  const res = await axios.post(`${API}/api/ai/explain-json`, { json }, { withCredentials: true })
  return res.data.explanation
}

export const generateJson = async (description) => {
  const res = await axios.post(`${API}/api/ai/generate-json`, { description }, { withCredentials: true })
  return res.data.json
}

export const explainRegex = async (pattern, flags) => {
  const res = await axios.post(`${API}/api/ai/explain-regex`, { pattern, flags }, { withCredentials: true })
  return res.data.explanation
}

export const generateRegex = async (description) => {
  const res = await axios.post(`${API}/api/ai/generate-regex`, { description }, { withCredentials: true })
  return res.data
}

export const generatePalette = async (description) => {
  const res = await axios.post(`${API}/api/ai/generate-palette`, { description }, { withCredentials: true })
  return res.data.colors
}