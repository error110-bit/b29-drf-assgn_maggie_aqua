import axios from 'axios'
 
const BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api'
 
const api = axios.create({ baseURL: BASE })
 
api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('access')
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})

export const getThreads = stageId =>
  api.get(`/threads/?stage=${stageId}`).then(r => r.data)
export const createThread = data => api.post('/threads/', data).then(r => r.data)
export const getComments = threadId =>
  api.get(`/comments/?thread=${threadId}`).then(r => r.data)
export const createComment = data => api.post('/comments/', data).then(r => r.data)

export const getStages = projectId =>
  api.get(`/stages/?project=${projectId}`).then(r => r.data)

export const createStage = data => api.post('/stages/', data).then(r => r.data)
