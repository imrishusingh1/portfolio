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
  const [activeTab, setActiveTab] = useState('hero')
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState('')
  const fileRef = useRef(null)
  const profileRef = useRef(null)

  useEffect(() => {
    if (!authLoading && !isLoggedIn) navigate('/admin')
  }, [authLoading, isLoggedIn])

  useEffect(() => { if (token) fetchSections() }, [token])

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
        </nav>
        <button className="admin-logout-btn" onClick={() => { logout(); navigate('/admin') }}>
          Logout
        </button>
      </aside>

      {/* Main content */}
      <main className="admin-main">
        {toast && <div className="admin-toast">{toast}</div>}

        {/* Section editor */}
        {activeTab !== 'messages' && activeTab !== 'resume' && activeTab !== 'profile' && activeTab !== 'reviews' && currentSection && (
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
                onError={(e) => { e.target.src = '/profile.png'; e.target.style.opacity = 0.5 }} 
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
        const template = arr.length > 0 ? { ...arr[0] } : {}
        Object.keys(template).forEach(k => {
          if (typeof template[k] === 'string') template[k] = ''
          if (typeof template[k] === 'number') template[k] = 0
        })
        arr.unshift(template)
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
      const API = import.meta.env.VITE_API_URL || 'https://api.rishusingh.me'
      const res = await fetch(`${API}/api/upload/image`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
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
