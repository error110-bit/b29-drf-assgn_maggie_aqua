import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  getStages, createStage,
  getThreads, createThread,
  getComments, createComment,

} from './DiscussionApi'
import { getCurrentUser } from '../../components/auth/api'
const STAGE_CHOICES = ['DRAFT', 'REVIEW', 'REVISION', 'APPROVED', 'COMPLETED']

export default function DiscussionPage() {
  const { projectId } = useParams()
  const [stages, setStages] = useState([])
  const [selectedStage, setSelectedStage] = useState(null)
  const [threads, setThreads] = useState([])
  const [selectedThread, setSelectedThread] = useState(null)
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [currentUser, setCurrentUser] = useState(null)

  const [showAddStage, setShowAddStage] = useState(false)
  const [newStage, setNewStage] = useState('REVIEW')
  const [stageLoading, setStageLoading] = useState(false)
  const [stageError, setStageError] = useState('')

  const [threadLoading, setThreadLoading] = useState(false)
  const [commentLoading, setCommentLoading] = useState(false)
  const [loading, setLoading] = useState(true)

  const canManageStages = currentUser &&
    ['admin', 'project_lead'].includes(currentUser.role)

  useEffect(() => {
    const init = async () => {
      try {
        const [user, s] = await Promise.all([getCurrentUser(), getStages(projectId)])
        setCurrentUser(user)
        setStages(s)
        if (s.length > 0) setSelectedStage(s[0])
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [projectId])

  useEffect(() => {
    if (!selectedStage) return
    setSelectedThread(null)
    setComments([])
    getThreads(selectedStage.id).then(setThreads).catch(console.error)
  }, [selectedStage])

  useEffect(() => {
    if (!selectedThread) return
    getComments(selectedThread.id).then(setComments).catch(console.error)
  }, [selectedThread])

  const handleAddStage = async (e) => {
    e.preventDefault()
    setStageError('')

    if (stages.some(s => s.stage === newStage)) {
      setStageError(`A ${newStage} stage already exists in this project.`)
      return
    }

    setStageLoading(true)
    try {
      const stage = await createStage({ project: projectId, stage: newStage })
      await createThread({ stage: stage.id })
      const updated = await getStages(projectId)
      setStages(updated)
      setSelectedStage(stage)
      setShowAddStage(false)
      setNewStage('REVIEW')
    } catch (e) {
      setStageError(e.response?.data?.detail || JSON.stringify(e.response?.data) || 'Failed to create stage')
    } finally {
      setStageLoading(false)
    }
  }

  const handleCreateThread = async () => {
    if (!selectedStage) return
    setThreadLoading(true)
    try {
      const thread = await createThread({ stage: selectedStage.id })
      setThreads(prev => [...prev, thread])
      setSelectedThread(thread)
    } catch (e) {
      alert(e.response?.data?.detail || 'Failed to create thread')
    } finally {
      setThreadLoading(false)
    }
  }

  const handleSendComment = async (e) => {
    e.preventDefault()
    if (!newComment.trim() || !selectedThread) return
    setCommentLoading(true)
    try {
      const comment = await createComment({ thread: selectedThread.id, message: newComment })
      setComments(prev => [...prev, comment])
      setNewComment('')
    } catch (e) {
      alert(e.response?.data?.detail || 'Failed to post comment')
    } finally {
      setCommentLoading(false)
    }
  }

  if (loading) return <div className="loading">Loading discussions…</div>

  return (
    <div className="page">
      <div className="breadcrumb">
        <Link to={`/projects/${projectId}`}>Project</Link> / Discussions
      </div>

      <div className="page-header">
        <h1>Discussions</h1>
        {canManageStages && (
          <button
            className="btn-secondary"
            onClick={() => { setShowAddStage(v => !v); setStageError('') }}
          >
            {showAddStage ? 'Cancel' : '+ Add Stage'}
          </button>
        )}
      </div>

      {showAddStage && canManageStages && (
        <form className="stage-add-form" onSubmit={handleAddStage}>
          <select
            value={newStage}
            onChange={e => setNewStage(e.target.value)}
          >
            {STAGE_CHOICES.filter(c => !stages.some(s => s.stage === c)).map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          {stageError && <p className="stage-error">{stageError}</p>}
          <button type="submit" className="btn-primary" disabled={stageLoading}>
            {stageLoading ? 'Creating…' : 'Create Stage'}
          </button>
        </form>
      )}

      {stages.length === 0 && (
        <div className="empty">
          <p>No stages yet.</p>
          {canManageStages
            ? <p>Click <strong>+ Add Stage</strong> above to create one.</p>
            : <p>Ask your project lead to add stages.</p>
          }
        </div>
      )}

      {stages.length > 0 && (
        <div className="discussion-layout">
          <div className="stage-tabs">
            {stages.map(s => (
              <button
                key={s.id}
                className={`stage-tab ${selectedStage?.id === s.id ? 'active' : ''}`}
                onClick={() => setSelectedStage(s)}
              >
                {s.stage}
              </button>
            ))}
          </div>

          <div className="discussion-body">
            <div className="thread-panel">
              <div className="panel-header">
                <span>Threads</span>
                <button className="btn-sm" onClick={handleCreateThread} disabled={threadLoading}>
                  {threadLoading ? '…' : '+ New'}
                </button>
              </div>
              {threads.length === 0 && <p className="empty-sm">No threads yet.</p>}
              {threads.map(t => (
                <div
                  key={t.id}
                  className={`thread-item ${selectedThread?.id === t.id ? 'active' : ''}`}
                  onClick={() => setSelectedThread(t)}
                >
                  <span>Thread #{t.id}</span>
                  <span className="thread-meta">
                    {new Date(t.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>

            <div className="comment-panel">
              {!selectedThread && (
                <div className="empty-comments">Select a thread to view comments</div>
              )}
              {selectedThread && (
                <>
                  <div className="panel-header">
                    <span>Thread #{selectedThread.id}</span>
                  </div>
                  <div className="comments-list">
                    {comments.length === 0 && <p className="empty-sm">No comments yet.</p>}
                    {comments.map(c => (
                      <div key={c.id} className="comment">
                        <div className="comment-meta">
                          User #{c.user} · {new Date(c.created_at).toLocaleString()}
                        </div>
                        <p>{c.message}</p>
                      </div>
                    ))}
                  </div>
                  <form className="comment-form" onSubmit={handleSendComment}>
                    <textarea
                      placeholder="Write a comment…"
                      value={newComment}
                      onChange={e => setNewComment(e.target.value)}
                      rows={2}
                      required
                    />
                    <button type="submit" disabled={commentLoading}>
                      {commentLoading ? '…' : 'Post'}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}