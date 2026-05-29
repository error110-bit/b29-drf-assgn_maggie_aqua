import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './components/auth/Login'
import Signup from './components/auth/Signup'
import Layout from './pages/Layout'
import HomePage from './pages/HomePage'
import StudioList from './pages/studio/StudioList'
import CreateStudio from './pages/studio/CreateStudio'
import ProjectList from './pages/project/ProjectList'
import CreateProject from './pages/project/CreateProject'
import ProjectDetail from './pages/project/ProjectDetail'
import TaskList from './pages/project/TaskList'
import CreateTask from './pages/project/CreateTask'
import AttachmentList from './pages/attachment/AttachmentList'
import CreateAttachment from './pages/attachment/CreatAttachment'
import DiscussionPage from './pages/discussions/DiscussionPage'
import NotificationList from './pages/notification/NotificationList'

function ProtectedRoute({ children }) {
  return localStorage.getItem('access') ? children : <Navigate to="/login" />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route path="/" element={<HomePage />} />

          <Route path="/studios" element={<StudioList />} />
          <Route path="/studios/create" element={<CreateStudio />} />

          <Route path="/studios/:studioId/projects" element={<ProjectList />} />
          <Route path="/studios/:studioId/projects/create" element={<CreateProject />} />

         
          <Route path="/projects/:projectId" element={<ProjectDetail />} />
          <Route path="/projects/:projectId/tasks" element={<TaskList />} />
          <Route path="/projects/:projectId/tasks/create" element={<CreateTask />} />
          <Route path="/projects/:projectId/attachments" element={<AttachmentList />} />
          <Route path="/projects/:projectId/attachments/create" element={<CreateAttachment />} />
          <Route path="/projects/:projectId/discussions" element={<DiscussionPage />} />

        
          <Route path="/notifications" element={<NotificationList />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}