import axios from 'axios'
 
const BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api'
 
const api = axios.create({ baseURL: BASE })
 
api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('access')
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})

export const getProjects = () => api.get('/projects/').then(r => r.data)
export const createProject = data => api.post('/projects/', data).then(r => r.data)
export const joinProject = (projectId, role = ['DESIGNER','CLIENT_VIEWER','ADMIN','PROJECT_LEAD','WRITER']) =>
  api.post('/projectmembers/', { project: projectId, role }).then(r => r.data)
export const getProjectMembers = projectId =>
  api.get(`/projectmembers/?project=${projectId}`).then(r => r.data)
export const getTasks = projectId =>
  api.get(`/tasks/?project=${projectId}`).then(r => r.data)
export const createTask = data => api.post('/tasks/', data).then(r => r.data)
export const getStages = projectId =>
  api.get(`/stages/?project=${projectId}`).then(r => r.data)
export const createStage = data => api.post('/stages/', data).then(r => r.data)
export const moveStage = (projectId, stage) =>
  api.post(`/projects/${projectId}/move-stage/`, { stage }).then(r => r.data)
export const proposeStage = (projectId, stageId) =>
  api.post(`/projects/${projectId}/propose-stage/`, { stage_id: stageId }).then(r => r.data)
export const getStageApprovals = (stageId) =>
  api.get(`/stageapprovals/?stage=${stageId}`).then(r => r.data)
export const approveStageProposal = (approvalId) =>
  api.post(`/stageapprovals/${approvalId}/approve/`).then(r => r.data)
export const rejectStageProposal = (approvalId) =>
  api.post(`/stageapprovals/${approvalId}/reject/`).then(r => r.data)

