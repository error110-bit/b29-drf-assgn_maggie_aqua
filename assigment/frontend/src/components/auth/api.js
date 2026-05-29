import axios from 'axios'
 
const BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api'
 
const api = axios.create({ baseURL: BASE })
 
api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('access')
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})
 
export const login = data => api.post('/users/login/', data, { headers: {} }).then(r => r.data)
export const register = data => api.post('/users/register/', data, { headers: {} }).then(r => r.data)
export const getCurrentUser = () => api.get('/users/user/').then(r => r.data)
