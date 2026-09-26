import axios from 'axios'

export const API_URL = import.meta.env.VITE_API_URL || '/api'

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
})

export function setAuthToken(token) {
  if (token) api.defaults.headers.common.Authorization = `Bearer ${token}`
  else delete api.defaults.headers.common.Authorization
}

// Attach latest token from storage (covers non-context callers)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('lh_token')
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Global 401 handling: clear stale session
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && localStorage.getItem('lh_token')) {
      localStorage.removeItem('lh_token')
      delete api.defaults.headers.common.Authorization
      // Soft-redirect to login unless already there
      if (!window.location.pathname.startsWith('/login')) {
        window.location.assign('/login?expired=1')
      }
    }
    return Promise.reject(err)
  },
)

export function apiErrorMessage(err) {
  return (
    err?.response?.data?.message ||
    err?.message ||
    'Something went wrong. Please try again.'
  )
}
