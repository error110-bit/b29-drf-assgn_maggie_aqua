import axios from 'axios'
 
const BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api'
 
const api = axios.create({ baseURL: BASE })
 
api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('access')
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})
 
export const getStudios = () => api.get('/studio/').then(r => r.data)
export const createStudio = data => api.post('/studio/', data).then(r => r.data)
export const getUsers = () => api.get('/users/list/').then(r => r.data)
export const createStudioMembership = data =>
  api.post('/studiomember/', data).then(r => r.data)
