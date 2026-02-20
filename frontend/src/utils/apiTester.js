import axios from 'axios'

export const sendRequest = async ({ url, method, headers, body }) => {
  const isLocal = url.includes('localhost') || url.includes('127.0.0.1')

  const headersObj = {}
  headers.forEach(({ key, value }) => {
    if (key) headersObj[key] = value
  })

  let parsedBody = null
  if (body && method !== 'GET') {
    try {
      parsedBody = JSON.parse(body)
    } catch {
      throw new Error('Invalid JSON in request body')
    } 
  }

  if (isLocal) {
    const proxiedUrl = url.replace('http://localhost:3000', '')
    const start = Date.now()
    const response = await axios({
      method,
      url: proxiedUrl,
      headers: headersObj,
      data: parsedBody,
      withCredentials: true
    })
    return {
      status: response.status,
      statusText: response.statusText,
      data: response.data,
      timeTaken: Date.now() - start
    }
  } else {
    // hit external APIs directly
    const start = Date.now()
    const response = await axios({
      method,
      url,
      headers: headersObj,
      data: parsedBody
    })
    return {
      status: response.status,
      statusText: response.statusText,
      data: response.data,
      timeTaken: Date.now() - start
    }
  }
}