const HISTORY_KEY = 'api_tester_history'
const MAX_HISTORY = 50  // keep last 50 requests

export const saveToHistory = (request, response) => {
  const history = getHistory()
  
  const entry = {
    id: Date.now().toString(),
    timestamp: new Date().toISOString(),
    request: {
      url: request.url,
      method: request.method,
      headers: request.headers,
      body: request.body
    },
    response: {
      status: response.status,
      statusText: response.statusText,
      data: response.data,
      timeTaken: response.timeTaken
    }
  }

  const updated = [entry, ...history].slice(0, MAX_HISTORY)
  localStorage.setItem(HISTORY_KEY, JSON.stringify(updated))
  return entry
}

export const getHistory = () => {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY)) || []
  } catch {
    return []
  }
}

export const deleteFromHistory = (id) => {
  const history = getHistory().filter(entry => entry.id !== id)
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history))
}

export const clearHistory = () => {
  localStorage.removeItem(HISTORY_KEY)
}