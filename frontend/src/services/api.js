import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = localStorage.getItem('refresh_token')
        if (refreshToken) {
          const response = await axios.post(`${API_URL}/auth/refresh`, null, {
            headers: {
              Authorization: `Bearer ${refreshToken}`,
            },
          })

          const { access_token, refresh_token } = response.data
          localStorage.setItem('access_token', access_token)
          localStorage.setItem('refresh_token', refresh_token)

          originalRequest.headers.Authorization = `Bearer ${access_token}`
          return api(originalRequest)
        }
      } catch (refreshError) {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (email, password) => api.post('/auth/login', null, { params: { email, password } }),
  getCurrentUser: () => api.get('/auth/me'),
}

export const productsAPI = {
  list: (params) => api.get('/products', { params }),
  get: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
  getCategories: () => api.get('/products/categories/list'),
}

export const salesAPI = {
  list: (params) => api.get('/sales', { params }),
  create: (data) => api.post('/sales', data),
  getAnalytics: (days = 30) => api.get('/sales/analytics', { params: { days } }),
}

export const forecastAPI = {
  getDemand: (productId, forecastDays = 30) =>
    api.post(`/forecast/demand/${productId}`, null, { params: { forecast_days: forecastDays } }),
  getPricing: (productId) => api.post(`/forecast/pricing/${productId}`),
  getReorderPoints: (leadTimeDays = 7) =>
    api.get('/forecast/reorder-points', { params: { lead_time_days: leadTimeDays } }),
  getBatchPricing: () => api.post('/forecast/batch-pricing'),
}

export const inventoryAPI = {
  getAlerts: () => api.get('/inventory/alerts'),
  getSummary: () => api.get('/inventory/summary'),
}

export const eventsAPI = {
  getHolidays: (year) => api.get('/events/holidays', { params: { year } }),
  getUpcoming: (days = 30) => api.get('/events/upcoming', { params: { days } }),
  createCustom: (data) => api.post('/events/custom', data),
  listCustom: () => api.get('/events/custom'),
}

export default api
