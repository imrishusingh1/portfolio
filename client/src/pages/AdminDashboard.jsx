import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './AdminDashboard.css'

const SECTION_LABELS = {
  hero: '🏠 Hero',
  services: '⚙️ Services',
  about: '👤 About (with Experiences)',
  portfolio: '📁 Portfolio',
  certifications: '🎓 Certifications',
  education: '📚 Education',
  achievements: '🏆 Achievements',
  opensource: '🐙 Open Source',
  process: '🔄 Process',
  blog: '📝 Blog',
  research: '🔬 Research',
  research: '🔬 Research',
  pricing: '💰 Pricing',
  contact: '📬 Contact',
  navbar: '🧭 Navigation Bar',
}

export default function AdminDashboard() {
  const { token, logout, isLoggedIn, loading: authLoading, API } = useAuth()
  const navigate = useNavigate()
  const [sections, setSections] = useState([])
  const [messages, setMessages] = useState([])
  const [adminReviews, setAdminReviews] = useState([])
  const [visitors, setVisitors] = useState(null)
  const [notifyEnabled, setNotifyEnabled] = useState(false)
  const [activeTab, setActiveTab] = useState('hero')
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState('')
  const [videoUploadProgress, setVideoUploadProgress] = useState(0)
  const [videoCvUrl, setVideoCvUrl] = useState(null)
  
  const fileRef = useRef(null)
  const profileRef = useRef(null)
  const videoRef = useRef(null)
  const xhrRef = useRef(null)

  useEffect(() => {
    if (!authLoading && !isLoggedIn) navigate('/admin')
  }, [authLoading, isLoggedIn])

  useEffect(() => { 
    if (token) {
      fetchSections()
      fetchVideoCvUrl()
    }
  }, [token])

  async function fetchSections() {
    const res = await fetch(`${API}/api/sections/admin/all`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (res.ok) {
      const data = await res.json()
      setSections(data)
    }
  }

  async function fetchMessages() {
    const res = await fetch(`${API}/api/messages`)
    if (res.ok) setMessages(await res.json())
  }

  async function fetchAdminReviews() {
    const res = await fetch(`${API}/api/reviews/admin/all`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    if (res.ok) setAdminReviews(await res.json())
  }

  async function fetchVisitors() {
    const res = await fetch(`${API}/api/visitors`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    if (res.ok) setVisitors(await res.json())
  }

  async function fetchVideoCvUrl() {
    try {
      const res = await fetch(`${API}/api/upload/video-cv-url`)
      if (res.ok) {
        const data = await res.json()
        setVideoCvUrl(data.url)
      }
    } catch (e) {
      console.error(e)
    }
  }

  async function fetchNotifySetting() {
    const res = await fetch(`${API}/api/visitors/notify-setting`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    if (res.ok) {
      const data = await res.json()
      setNotifyEnabled(data.enabled)
    }
  }

  async function toggleNotify() {
    const newVal = !notifyEnabled
    setNotifyEnabled(newVal)
    const res = await fetch(`${API}/api/visitors/notify-setting`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ enabled: newVal })
    })
    if (res.ok) {
      showToast(newVal ? '🔔 Email notifications ON' : '🔕 Email notifications OFF')
    } else {
      setNotifyEnabled(!newVal) // revert on error
    }
  }

  async function deleteReview(id) {
    if (!confirm('Are you sure you want to delete this review?')) return;
    const res = await fetch(`${API}/api/reviews/admin/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      showToast('Review deleted');
      fetchAdminReviews();
    }
  }

  async function updateReview(id, updates) {
    const res = await fetch(`${API}/api/reviews/admin/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(updates)
    });
    if (res.ok) {
      showToast('Review updated');
      fetchAdminReviews();
    }
  }

  function showToast(msg) {
    setToast(msg)
    setTimeout(() => setToast(''), 2500)
  }

  async function toggleSection(key) {
    const res = await fetch(`${API}/api/sections/admin/${key}/toggle`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
    })
    if (res.ok) {
      const updated = await res.json()
      setSections(prev => prev.map(s => s.sectionKey === key ? { ...s, enabled: updated.enabled } : s))
      showToast(`${key} ${updated.enabled ? 'enabled' : 'disabled'}`)
    }
  }

  async function saveSection(key, data) {
    setSaving(true)
    const res = await fetch(`${API}/api/sections/admin/${key}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ data }),
    })
    if (res.ok) {
      await fetchSections()
      showToast(`${key} saved!`)
    }
    setSaving(false)
  }

  async function uploadResume(e) {
    const file = e.target.files[0]
    if (!file) return
    const fd = new FormData()
    fd.append('resume', file)
    const res = await fetch(`${API}/api/upload/resume`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: fd,
    })
    if (res.ok) showToast('Resume uploaded!')
    else showToast('Upload failed')
  }

  async function uploadProfilePic(e) {
    const file = e.target.files[0]
    if (!file) return
    const fd = new FormData()
    fd.append('image', file)
    const res = await fetch(`${API}/api/upload/profile`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: fd,
    })
    if (res.ok) {
      showToast('Profile photo updated!')
      setTimeout(() => window.location.reload(), 1000)
    } else {
      showToast('Upload failed')
    }
  }

  function handleVideoCvUpload(e) {
    const file = e.target.files[0]
    if (!file) return
    
    if (!file.type.startsWith('video/')) {
      showToast('Please select a valid video file')
      return
    }

    const fd = new FormData()
    fd.append('video', file)
    
    setVideoUploadProgress(1) // Start progress
    
    xhrRef.current = new XMLHttpRequest()
    const xhr = xhrRef.current
    xhr.open('POST', `${API}/api/upload/video-cv`)
    xhr.setRequestHeader('Authorization', `Bearer ${token}`)
    
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100)
        setVideoUploadProgress(Math.max(1, percent))
      }
    }
    
    xhr.onload = () => {
      setVideoUploadProgress(0)
      xhrRef.current = null
      if (xhr.status >= 200 && xhr.status < 300) {
        const response = JSON.parse(xhr.responseText)
        setVideoCvUrl(response.path)
        showToast('Video CV uploaded successfully!')
      } else {
        showToast('Video upload failed')
      }
    }
    
    xhr.onerror = () => {
      setVideoUploadProgress(0)
      xhrRef.current = null
      showToast('Error uploading video')
    }

    xhr.onabort = () => {
      setVideoUploadProgress(0)
      xhrRef.current = null
      showToast('Upload cancelled')
    }
    
    xhr.send(fd)
  }

  function cancelVideoCvUpload() {
    if (xhrRef.current) {
      xhrRef.current.abort()
      if (videoRef.current) videoRef.current.value = ''
    }
  }

  async function deleteVideoCv() {
    if (!confirm('Are you sure you want to delete your Video CV?')) return;
    try {
      const res = await fetch(`${API}/api/upload/video-cv`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setVideoCvUrl(null);
        showToast('Video CV deleted successfully');
      } else {
        showToast('Failed to delete Video CV');
      }
    } catch (e) {
      showToast('Error deleting Video CV');
    }
  }

  const currentSection = sections.find(s => s.sectionKey === activeTab)

  if (authLoading) return <div className="admin-dash-loading">Loading...</div>

  return (
    <div className="admin-dash">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <h2 className="admin-sidebar-title">⚡ Admin</h2>
        <nav className="admin-nav">
          {Object.entries(SECTION_LABELS).map(([key, label]) => {
            const sec = sections.find(s => s.sectionKey === key)
            return (
              <button
                key={key}
                className={`admin-nav-btn ${activeTab === key ? 'active' : ''} ${sec && !sec.enabled ? 'disabled-sec' : ''}`}
                onClick={() => setActiveTab(key)}
              >
                {label}
                {sec && (
                  <span
                    className={`toggle-dot ${sec.enabled ? 'on' : 'off'}`}
                    title={sec.enabled ? 'Enabled' : 'Disabled'}
                  />
                )}
              </button>
            )
          })}
          <hr className="admin-nav-divider" />
          <button
            className={`admin-nav-btn ${activeTab === 'messages' ? 'active' : ''}`}
            onClick={() => { setActiveTab('messages'); fetchMessages() }}
          >
            📬 Messages
          </button>
          <button
            className={`admin-nav-btn ${activeTab === 'reviews' ? 'active' : ''}`}
            onClick={() => { setActiveTab('reviews'); fetchAdminReviews() }}
          >
            ⭐ Reviews
          </button>
          <button
            className={`admin-nav-btn ${activeTab === 'resume' ? 'active' : ''}`}
            onClick={() => setActiveTab('resume')}
          >
            📄 Resume
          </button>
          <button
            className={`admin-nav-btn ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            🖼️ Profile Photo
          </button>
          <button
            className={`admin-nav-btn ${activeTab === 'video_cv' ? 'active' : ''}`}
            onClick={() => setActiveTab('video_cv')}
          >
            🎥 Video CV
          </button>
          <button
            className={`admin-nav-btn ${activeTab === 'visitors' ? 'active' : ''}`}
            onClick={() => { setActiveTab('visitors'); fetchVisitors(); fetchNotifySetting() }}
          >
            👁️ Visitors
          </button>
        </nav>
        <button className="admin-logout-btn" onClick={() => { logout(); navigate('/admin') }}>
          Logout
        </button>
      </aside>

      {/* Main content */}
      <main className="admin-main">
        {toast && <div className="admin-toast">{toast}</div>}

        {/* Section editor */}
        {activeTab !== 'messages' && activeTab !== 'resume' && activeTab !== 'profile' && activeTab !== 'video_cv' && activeTab !== 'reviews' && activeTab !== 'visitors' && currentSection && (
          <SectionEditor
            section={currentSection}
            onSave={saveSection}
            onToggle={toggleSection}
            saving={saving}
          />
        )}

        {/* Messages */}
        {activeTab === 'messages' && (
          <div className="admin-panel">
            <h2>📬 Contact Messages</h2>
            {messages.length === 0 && <p className="admin-empty">No messages yet.</p>}
            {messages.map(m => (
              <div key={m._id} className="msg-card">
                <div className="msg-meta">
                  <strong>{m.name}</strong> · <span>{m.email}</span>
                  <span className="msg-date">{new Date(m.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="msg-body">{m.message}</p>
              </div>
            ))}
          </div>
        )}

        {/* Reviews */}
        {activeTab === 'reviews' && (
          <div className="admin-panel">
            <h2>⭐ Reviews Management</h2>
            {adminReviews.length === 0 && <p className="admin-empty">No reviews found.</p>}
            {adminReviews.map(r => (
              <div key={r._id} className="msg-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="msg-meta" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <strong>{r.name}</strong> <span style={{color:'#666', fontSize:'13px'}}>({r.role})</span>
                    <div>
                      <span style={{color:'#f59e0b'}}>{'★'.repeat(r.stars)}</span>
                      <span style={{color:'#ccc'}}>{'★'.repeat(5 - r.stars)}</span>
                    </div>
                    <div className="msg-date">{new Date(r.createdAt).toLocaleString()}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => {
                        const newText = prompt('Edit review text:', r.text);
                        if (newText !== null && newText !== r.text) updateReview(r._id, { text: newText });
                    }} className="admin-save-btn" style={{ padding: '6px 12px', fontSize: '12px' }}>✏️ Edit</button>
                    <button onClick={() => deleteReview(r._id)} className="admin-save-btn" style={{ padding: '6px 12px', fontSize: '12px', background: '#dc2626' }}>🗑️ Delete</button>
                  </div>
                </div>
                <p className="msg-body" style={{ marginTop: '4px', fontStyle: 'italic', background: '#f9fafb', padding: '12px', borderRadius: '6px' }}>"{r.text}"</p>
              </div>
            ))}
          </div>
        )}

        {/* Resume upload */}
        {activeTab === 'resume' && (
          <div className="admin-panel">
            <h2>📄 Upload Resume</h2>
            <p>Upload your resume PDF. It will be available for download on your portfolio.</p>
            <input type="file" accept=".pdf" ref={fileRef} onChange={uploadResume} style={{ display: 'none' }} />
            <button className="admin-upload-btn" onClick={() => fileRef.current?.click()}>
              Choose PDF File
            </button>
            <a href={`${API}/uploads/resume.pdf`} target="_blank" rel="noreferrer" className="admin-preview-link">
              Preview Current Resume ↗
            </a>
          </div>
        )}

        {/* Visitors */}
        {activeTab === 'visitors' && (
          <div className="admin-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
              <h2 style={{ margin: 0 }}>👁️ Visitor Tracker</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: notifyEnabled ? '#f0fdf4' : '#fafafa', border: `1px solid ${notifyEnabled ? '#86efac' : '#e5e7eb'}`, borderRadius: '10px', padding: '10px 16px' }}>
                <span style={{ fontSize: '20px' }}>{notifyEnabled ? '🔔' : '🔕'}</span>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#333' }}>Email Alerts</div>
                  <div style={{ fontSize: '11px', color: notifyEnabled ? '#16a34a' : '#9ca3af' }}>{notifyEnabled ? 'ON — notifying on every visit' : 'OFF — no notifications'}</div>
                </div>
                <label className="toggle-switch" style={{ margin: 0 }}>
                  <input type="checkbox" checked={notifyEnabled} onChange={toggleNotify} />
                  <span className="toggle-slider" />
                </label>
              </div>
            </div>
            {!visitors && <p className="admin-empty">Loading visitor data...</p>}
            {visitors && (
              <>
                <div style={{ display: 'flex', gap: '24px', marginBottom: '24px', flexWrap: 'wrap' }}>
                  <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '16px 24px', minWidth: '160px' }}>
                    <div style={{ fontSize: '28px', fontWeight: 800, color: '#16a34a' }}>{visitors.totalUniqueVisitors}</div>
                    <div style={{ fontSize: '13px', color: '#555', marginTop: '4px' }}>Unique Visitors</div>
                  </div>
                  <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '12px', padding: '16px 24px', minWidth: '160px' }}>
                    <div style={{ fontSize: '28px', fontWeight: 800, color: '#2563eb' }}>{visitors.totalVisits}</div>
                    <div style={{ fontSize: '13px', color: '#555', marginTop: '4px' }}>Total Page Views</div>
                  </div>
                </div>
                {visitors.visitors.length === 0 && <p className="admin-empty">No visitors tracked yet.</p>}
                {visitors.visitors.map((v, i) => (
                  <div key={v._id || i} className="msg-card" style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                      <div>
                        <strong style={{ fontFamily: 'monospace', fontSize: '15px' }}>{v.ip}</strong>
                        <span style={{ marginLeft: '10px', background: '#e0f2fe', color: '#0369a1', borderRadius: '6px', padding: '2px 8px', fontSize: '12px', fontWeight: 600 }}>
                          {v.visitCount} visit{v.visitCount !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <span style={{ fontSize: '12px', color: '#888' }}>Last: {v.lastVisit_IST}</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: '8px', marginTop: '12px' }}>
                      <div style={{ fontSize: '13px' }}>📍 <strong>Location:</strong> {v.location}</div>
                      <div style={{ fontSize: '13px' }}>🌐 <strong>ISP:</strong> {v.isp}</div>
                      <div style={{ fontSize: '13px' }}>📱 <strong>Device:</strong> {v.deviceType} — {v.device}</div>
                      <div style={{ fontSize: '13px' }}>💻 <strong>OS:</strong> {v.os}</div>
                      <div style={{ fontSize: '13px' }}>🧭 <strong>Browser:</strong> {v.browser}</div>
                      <div style={{ fontSize: '13px' }}>🕐 <strong>First visit:</strong> {v.firstVisit_IST}</div>
                    </div>
                    {v.visits && v.visits.length > 0 && (
                      <details style={{ marginTop: '10px' }}>
                        <summary style={{ cursor: 'pointer', fontSize: '13px', color: '#5865F2', fontWeight: 600 }}>📋 Visit History ({v.visits.length})</summary>
                        <div style={{ marginTop: '8px', maxHeight: '200px', overflowY: 'auto' }}>
                          {v.visits.map((visit, j) => (
                            <div key={j} style={{ fontSize: '12px', padding: '6px 10px', background: j % 2 === 0 ? '#f9fafb' : '#fff', borderRadius: '6px', marginBottom: '4px' }}>
                              <span style={{ color: '#888' }}>{visit.timestamp_IST}</span>
                              {visit.page && <span style={{ marginLeft: '10px', color: '#333' }}>📄 {visit.page}</span>}
                              {visit.referrer && <span style={{ marginLeft: '10px', color: '#888' }}>←  {visit.referrer}</span>}
                            </div>
                          ))}
                        </div>
                      </details>
                    )}
                    {v.sessions && v.sessions.length > 0 && (
                      <details style={{ marginTop: '10px' }}>
                        <summary style={{ cursor: 'pointer', fontSize: '13px', color: '#d97706', fontWeight: 600 }}>
                          📊 Session Insights ({v.sessions.length} session{v.sessions.length !== 1 ? 's' : ''})
                        </summary>
                        <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                          {v.sessions.map((sess, si) => {
                            const maxSec = Math.max(...(sess.sections.map(s => s.seconds)), 1)
                            return (
                              <div key={si} style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', padding: '12px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#92400e', marginBottom: '10px' }}>
                                  <span>🕐 {sess.recordedAt_IST}</span>
                                  <span>⏱ {sess.totalSeconds}s on site</span>
                                </div>
                                {sess.sections.length > 0 && (
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '10px' }}>
                                    {sess.sections.map((sec, sj) => (
                                      <div key={sj} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span style={{ fontSize: '11px', width: '90px', textTransform: 'capitalize', color: '#555', flexShrink: 0 }}>{sec.name}</span>
                                        <div style={{ flex: 1, background: '#e5e7eb', borderRadius: '4px', height: '10px', overflow: 'hidden' }}>
                                          <div style={{ width: `${Math.round((sec.seconds / maxSec) * 100)}%`, background: '#f59e0b', height: '100%', borderRadius: '4px', minWidth: '6px', transition: 'width 0.4s' }} />
                                        </div>
                                        <span style={{ fontSize: '11px', color: '#555', flexShrink: 0 }}>{sec.seconds}s</span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                                {/* New unified clicks (new sessions) */}
                                {sess.clicks && sess.clicks.length > 0 && (() => {
                                  const typeStyle = {
                                    social:  { bg: '#dbeafe', border: '#93c5fd', color: '#1d4ed8', icon: '🔗' },
                                    nav:     { bg: '#fef3c7', border: '#fde68a', color: '#92400e', icon: '🗺' },
                                    button:  { bg: '#dcfce7', border: '#86efac', color: '#166534', icon: '⚡' },
                                    link:    { bg: '#f3e8ff', border: '#d8b4fe', color: '#7e22ce', icon: '↗' },
                                    email:   { bg: '#ccfbf1', border: '#5eead4', color: '#0f766e', icon: '📧' },
                                    other:   { bg: '#f3f4f6', border: '#d1d5db', color: '#374151', icon: '•' },
                                  }
                                  return (
                                    <div style={{ fontSize: '11px', color: '#666', marginTop: '6px' }}>
                                      <span style={{ fontWeight: 600 }}>🖱 Clicks:</span>{' '}
                                      <div style={{ marginTop: '4px', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                        {sess.clicks.map((c, ci) => {
                                          const s = typeStyle[c.type] || typeStyle.other
                                          return (
                                            <span key={ci} title={c.time} style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.color, borderRadius: '4px', padding: '2px 7px', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                                              <span>{s.icon}</span>{c.label}
                                            </span>
                                          )
                                        })}
                                      </div>
                                    </div>
                                  )
                                })()}
                                {/* Legacy nav clicks (older sessions) */}
                                {(!sess.clicks || sess.clicks.length === 0) && sess.navClicks && sess.navClicks.length > 0 && (
                                  <div style={{ fontSize: '11px', color: '#666', marginTop: '6px' }}>
                                    <span style={{ fontWeight: 600 }}>🖱 Nav clicks:</span>{' '}
                                    {sess.navClicks.map((c, ci) => (
                                      <span key={ci} style={{ background: '#fef3c7', border: '1px solid #fde68a', borderRadius: '4px', padding: '1px 6px', marginRight: '4px', display: 'inline-block', marginBottom: '3px' }}>{c}</span>
                                    ))}
                                  </div>
                                )}
                                {(!sess.clicks || sess.clicks.length === 0) && sess.socialClicks && sess.socialClicks.length > 0 && (
                                  <div style={{ fontSize: '11px', color: '#666', marginTop: '6px' }}>
                                    <span style={{ fontWeight: 600 }}>🔗 Social clicks:</span>{' '}
                                    {sess.socialClicks.map((c, ci) => (
                                      <span key={ci} style={{ background: '#dbeafe', border: '1px solid #93c5fd', color: '#1d4ed8', borderRadius: '4px', padding: '1px 6px', marginRight: '4px', display: 'inline-block', marginBottom: '3px' }}>{c}</span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      </details>
                    )}
                  </div>
                ))}
              </>
            )}
          </div>
        )}

        {/* Video CV upload */}
        {activeTab === 'video_cv' && (
          <div className="admin-panel">
            <h2>🎥 Upload Video CV</h2>
            <p>Upload your video resume. It will be displayed on the /vcv page.</p>
            <input type="file" accept="video/*" ref={videoRef} onChange={handleVideoCvUpload} style={{ display: 'none' }} />
            <button className="admin-upload-btn" onClick={() => videoRef.current?.click()} disabled={videoUploadProgress > 0}>
              {videoUploadProgress > 0 ? 'Uploading...' : 'Choose Video File'}
            </button>
            
            {videoUploadProgress > 0 && (
              <div style={{ marginTop: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 600, color: '#555', marginBottom: '8px' }}>
                  <span>
                    {videoUploadProgress === 100 
                      ? 'Processing video with Cloudinary... (This may take a minute)' 
                      : 'Uploading to server...'}
                  </span>
                  <span>{videoUploadProgress}%</span>
                </div>
                <div className="admin-progress-bar">
                  <div className="admin-progress-fill" style={{ width: `${videoUploadProgress}%` }} />
                </div>
                <button 
                  onClick={cancelVideoCvUpload}
                  className="admin-save-btn" 
                  style={{ background: '#dc2626', padding: '6px 12px', fontSize: '12px', marginTop: '12px' }}
                >
                  ✕ Cancel Upload
                </button>
              </div>
            )}

            {videoCvUrl && videoUploadProgress === 0 && (
              <div style={{ marginTop: 32 }}>
                <h3 style={{ fontSize: '16px', marginBottom: '12px' }}>Current Video Preview</h3>
                <div style={{ borderRadius: '14px', overflow: 'hidden', border: '2px solid #1d1d1d', background: '#000', maxWidth: '600px', aspectRatio: '16/9' }}>
                  <video 
                    src={videoCvUrl} 
                    controls 
                    style={{ width: '100%', height: '100%', display: 'block' }}
                  />
                </div>
                <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <p style={{ fontSize: 13, color: '#666', margin: 0 }}>
                    Make sure it looks good! You can upload a new one at any time.
                  </p>
                  <button 
                    onClick={deleteVideoCv}
                    className="admin-save-btn" 
                    style={{ background: '#dc2626', padding: '8px 16px', fontSize: '13px' }}
                  >
                    🗑️ Delete Video
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Profile upload */}
        {activeTab === 'profile' && (
          <div className="admin-panel">
            <h2>🖼️ Upload Profile Photo</h2>
            <p>Upload a new profile picture. Recommended size is 440x440px or square aspect ratio.</p>
            <input type="file" accept="image/*" ref={profileRef} onChange={uploadProfilePic} style={{ display: 'none' }} />
            <button className="admin-upload-btn" onClick={() => profileRef.current?.click()}>
              Choose Image File
            </button>
            <div style={{ marginTop: 24 }}>
              <img 
                src={`${API}/api/upload/profile-pic?t=${new Date().getTime()}`} 
                onError={(e) => { e.target.src = '/rishusingh.jpg'; e.target.style.opacity = 0.5 }} 
                alt="Current Profile" 
                style={{ width: 140, height: 140, objectFit: 'cover', borderRadius: '50%', border: '2px solid #1d1d1d' }} 
              />
              <p style={{ marginTop: 8, fontSize: 14, color: '#666' }}>Current Photo</p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

/* ── Generic Section Editor ── */
function SectionEditor({ section, onSave, onToggle, saving }) {
  const [data, setData] = useState(section.data)

  useEffect(() => { setData(section.data) }, [section])

  function updateField(path, value) {
    setData(prev => {
      const copy = JSON.parse(JSON.stringify(prev))
      const keys = path.split('.')
      let obj = copy
      for (let i = 0; i < keys.length - 1; i++) {
        if (keys[i].match(/^\d+$/)) keys[i] = parseInt(keys[i])
        obj = obj[keys[i]]
      }
      const lastKey = keys[keys.length - 1].match(/^\d+$/) ? parseInt(keys[keys.length - 1]) : keys[keys.length - 1]
      obj[lastKey] = value
      return copy
    })
  }

  function addItem(arrayPath) {
    setData(prev => {
      const copy = JSON.parse(JSON.stringify(prev))
      const keys = arrayPath.split('.')
      let arr = copy
      for (const k of keys) arr = arr[k]
      if (Array.isArray(arr)) {
        // Primitive array (strings/numbers) → just add one empty value
        if (arr.length === 0 || typeof arr[0] !== 'object') {
          arr.unshift(typeof arr[0] === 'number' ? 0 : '')
        } else {
          // Object array → clone first item as blank template
          const template = { ...arr[0] }
          Object.keys(template).forEach(k => {
            if (typeof template[k] === 'string') template[k] = ''
            if (typeof template[k] === 'number') template[k] = 0
            if (Array.isArray(template[k])) template[k] = []
          })
          arr.unshift(template)
        }
      }
      return copy
    })
  }

  function removeItem(arrayPath, index) {
    setData(prev => {
      const copy = JSON.parse(JSON.stringify(prev))
      const keys = arrayPath.split('.')
      let arr = copy
      for (const k of keys) arr = arr[k]
      if (Array.isArray(arr)) arr.splice(index, 1)
      return copy
    })
  }

  async function handleImageUpload(path, file) {
    if (!file) return
    const fd = new FormData()
    fd.append('image', file)
    try {
      const token = localStorage.getItem('admin_token')
      const API = import.meta.env.VITE_API_URL || ''
      const res = await fetch(`${API}/api/upload/image`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'x-api-secret': import.meta.env.VITE_API_SECRET || '' },
        body: fd,
      })
      if (res.ok) {
        const json = await res.json()
        updateField(path, json.path)
      } else {
        alert('Upload failed')
      }
    } catch (e) {
      alert('Upload error')
    }
  }

  return (
    <div className="admin-panel">
      <div className="admin-panel-header">
        <h2>{section.sectionKey.charAt(0).toUpperCase() + section.sectionKey.slice(1)} Editor</h2>
        <div className="admin-panel-actions">
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={section.enabled}
              onChange={() => onToggle(section.sectionKey)}
            />
            <span className="toggle-slider" />
            <span className="toggle-label">{section.enabled ? 'Enabled' : 'Disabled'}</span>
          </label>
          <button
            className="admin-save-btn"
            onClick={() => onSave(section.sectionKey, data)}
            disabled={saving}
          >
            {saving ? 'Saving...' : '💾 Save'}
          </button>
        </div>
      </div>

      <div className="editor-fields">
        {renderFields(data, '', updateField, addItem, removeItem, handleImageUpload)}
      </div>
    </div>
  )
}

/* ── Recursive field renderer ── */
function renderFields(obj, prefix, updateField, addItem, removeItem, handleImageUpload) {
  if (obj === null || obj === undefined) return null

  return Object.entries(obj).map(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key

    if (Array.isArray(value)) {
      return (
        <div key={path} className="editor-array">
          <div className="editor-array-header">
            <h4>{formatLabel(key)}</h4>
            <button className="editor-add-btn" onClick={() => addItem(path)}>+ Add</button>
          </div>
          {value.map((item, i) => (
            <div key={i} className="editor-array-item">
              <div className="editor-array-item-header">
                <span className="editor-item-num">#{i + 1}</span>
                <button className="editor-remove-btn" onClick={() => removeItem(path, i)}>✕</button>
              </div>
              {typeof item === 'object' && item !== null
                ? renderFields(item, `${path}.${i}`, updateField, addItem, removeItem, handleImageUpload)
                : (
                  <input
                    className="editor-input"
                    value={item ?? ''}
                    onChange={e => updateField(`${path}.${i}`, e.target.value)}
                  />
                )}
            </div>
          ))}
        </div>
      )
    }

    if (typeof value === 'object' && value !== null) {
      return (
        <div key={path} className="editor-group">
          <h4>{formatLabel(key)}</h4>
          {renderFields(value, path, updateField, addItem, removeItem, handleImageUpload)}
        </div>
      )
    }

    if (typeof value === 'boolean') {
      return (
        <div key={path} className="editor-field" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span>{formatLabel(key)}</span>
          <label className="toggle-switch" style={{ margin: 0 }}>
            <input
              type="checkbox"
              checked={value}
              onChange={e => updateField(path, e.target.checked)}
            />
            <span className="toggle-slider" />
          </label>
        </div>
      )
    }

    const isLong = typeof value === 'string' && (value.length > 80 || value.includes('\n'))
    const isImageField = key.toLowerCase().includes('image') || key.toLowerCase().includes('thumbnail') || key.toLowerCase() === 'img'

    return (
      <label key={path} className="editor-field">
        <span>{formatLabel(key)}</span>
        {isLong ? (
          <textarea
            className="editor-textarea"
            value={value ?? ''}
            onChange={e => updateField(path, e.target.value)}
            rows={3}
          />
        ) : (
          <div style={{ display: 'flex', gap: '8px', flex: 1 }}>
            <input
              className="editor-input"
              value={value ?? ''}
              onChange={e => updateField(path, e.target.value)}
              style={isImageField ? { flex: 1 } : {}}
            />
            {isImageField && (
              <label className="admin-upload-btn" style={{ padding: '0 12px', fontSize: '13px', cursor: 'pointer', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center' }}>
                Upload Image
                <input 
                  type="file" 
                  accept="image/*" 
                  style={{ display: 'none' }} 
                  onChange={e => handleImageUpload(path, e.target.files[0])} 
                />
              </label>
            )}
          </div>
        )}
      </label>
    )
  })
}

function formatLabel(key) {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/_/g, ' ')
    .replace(/^./, c => c.toUpperCase())
}
