import axios from 'axios'

// Get the URL and safely remove any accidental trailing slashes
const rawUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const cleanUrl = rawUrl.replace(/\/+$/, '');

// Create an Axios instance with pre-configured settings
const apiClient = axios.create({
  baseURL: `${cleanUrl}/api/ai`,
  withCredentials: true // Ensures HttpOnly cookies are sent automatically on all these requests
})

export const generateBody = async (description) => {
  const res = await apiClient.post('/generate-body', { description })
  return res.data.body
}

export const explainResponse = async (request, response) => {
  const res = await apiClient.post('/explain-response', { request, response })
  return res.data.explanation
}

export const generateSnippet = async (prompt, language) => {
  const res = await apiClient.post('/generate-snippet', { prompt, language })
  return res.data.code
}

export const explainJson = async (json) => {
  const res = await apiClient.post('/explain-json', { json })
  return res.data.explanation
}

export const generateJson = async (description) => {
  const res = await apiClient.post('/generate-json', { description })
  return res.data.json
}

export const explainRegex = async (pattern, flags) => {
  const res = await apiClient.post('/explain-regex', { pattern, flags })
  return res.data.explanation
}

export const generateRegex = async (description) => {
  const res = await apiClient.post('/generate-regex', { description })
  return res.data
}

export const generateColorPalette = async (description, numColors) => {
  const res = await apiClient.post('/generate-palette', { description })
  return res.data.colors
}