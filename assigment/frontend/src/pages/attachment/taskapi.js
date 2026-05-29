import axios from 'axios'
 
const BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api'
 
const api = axios.create({ baseURL: BASE })
 
api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('access')
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})

export const getAttachments = taskId =>
  api.get(`/attachments/?task=${taskId}`).then(r => r.data)
export const getAllAttachments = () => api.get('/attachments/').then(r => r.data)
export const createAttachment = data => api.post('/attachments/', data).then(r => r.data)
