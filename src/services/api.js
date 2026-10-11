const API_BASE_URL = window.location.origin + '/washwiz/php-api'

async function request(endpoint, { method = 'GET', body, headers = {} } = {}) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  }

  if (body !== undefined) {
    options.body = JSON.stringify(body)
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, options)

  let data
  try {
    data = await response.json()
  } catch (e) {
    throw new Error(`Server error (HTTP ${response.status})`)
  }

  if (!response.ok || data.success === false) {
    throw new Error(data.message || 'Request failed')
  }

  return data
}

export const api = {
  get: (endpoint) => request(endpoint, { method: 'GET' }),
  post: (endpoint, body) => request(endpoint, { method: 'POST', body }),
  put: (endpoint, body) => request(endpoint, { method: 'PUT', body }),
  del: (endpoint, body) => request(endpoint, { method: 'DELETE', body }),
}

export default api
