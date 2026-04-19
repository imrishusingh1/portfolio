import { useState, useRef, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import './VideoCv.css'

// ── Icons (inline SVGs) ───────────────────────────────────
const IconPlay = () => (
  <svg viewBox="0 0 24 24" fill="currentColor"><polygon points="6,3 20,12 6,21" /></svg>
)
const IconPause = () => (
  <svg viewBox="0 0 24 24" fill="currentColor"><rect x="5" y="3" width="4" height="18"/><rect x="15" y="3" width="4" height="18"/></svg>
)
const IconVolume = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>
)
const IconMute = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>
)
const IconFullscreen = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>
)
const IconPip = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><rect x="12" y="9" width="8" height="6" rx="1" fill="currentColor" opacity="0.3"/></svg>
)
const IconDownload = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
)
const IconArrow = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
)
const IconRewind = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 19 2 12 11 5 11 19"/><polygon points="22 19 13 12 22 5 22 19"/></svg>
)
const IconForward = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 19 22 12 13 5 13 19"/><polygon points="2 19 11 12 2 5 2 19"/></svg>
)

/* 4-point sparkle SVG */
const Sparkle = ({ size = 28, color = '#908aee' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M12 0C12 0 14 8 12 12C8 12 0 12 0 12C0 12 8 12 12 12C12 16 12 24 12 24C12 24 12 16 12 12C16 12 24 12 24 12C24 12 16 12 12 12C12 8 12 0 12 0Z"/>
  </svg>
)

// ── Helpers ────────────────────────────────────────────────
function formatTime(s) {
  if (!s || isNaN(s)) return '0:00'
  const mins = Math.floor(s / 60)
  const secs = Math.floor(s % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2]

// ══════════════════════════════════════════════════════════
//  VIDEO CV PAGE
// ══════════════════════════════════════════════════════════
export default function VideoCv() {
  const API = import.meta.env.VITE_API_URL || 'http://localhost:5000'
  const [videoSrc, setVideoSrc] = useState(null)
  const [loading, setLoading] = useState(true)

  const videoRef = useRef(null)
  const containerRef = useRef(null)
  const controlsTimeout = useRef(null)

  const [playing, setPlaying] = useState(false)
  const [showPoster, setShowPoster] = useState(true)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [buffered, setBuffered] = useState(0)
  const [volume, setVolume] = useState(1)
  const [muted, setMuted] = useState(false)
  const [speedIdx, setSpeedIdx] = useState(2) // 1x
  const [controlsVisible, setControlsVisible] = useState(false)
  const [isPip, setIsPip] = useState(false)

  // ── Play / Pause ──
  const togglePlay = useCallback(() => {
    const v = videoRef.current
    if (!v) return
    if (v.paused) {
      v.play()
      setPlaying(true)
      setShowPoster(false)
    } else {
      v.pause()
      setPlaying(false)
    }
  }, [])

  const handlePosterClick = useCallback(() => {
    const v = videoRef.current
    if (!v) return
    v.play()
    setPlaying(true)
    setShowPoster(false)
  }, [])

  // ── Time tracking ──
  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    const onTime = () => setCurrentTime(v.currentTime)
    const onDuration = () => setDuration(v.duration)
    const onProgress = () => {
      if (v.buffered.length > 0) {
        setBuffered(v.buffered.end(v.buffered.length - 1))
      }
    }
    const onEnded = () => { setPlaying(false); setShowPoster(true) }
    v.addEventListener('timeupdate', onTime)
    v.addEventListener('loadedmetadata', onDuration)
    v.addEventListener('progress', onProgress)
    v.addEventListener('ended', onEnded)
    return () => {
      v.removeEventListener('timeupdate', onTime)
      v.removeEventListener('loadedmetadata', onDuration)
      v.removeEventListener('progress', onProgress)
      v.removeEventListener('ended', onEnded)
    }
  }, [videoSrc])

  // ── Fetch Video URL ──
  useEffect(() => {
    fetch(`${API}/api/upload/video-cv-url`)
      .then(res => res.json())
      .then(data => {
        if (data.url) setVideoSrc(data.url)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }, [API])

  // ── Seek ──
  const handleSeek = useCallback((e) => {
    const v = videoRef.current
    if (!v || !duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    v.currentTime = pct * duration
    setCurrentTime(v.currentTime)
  }, [duration])

  // ── Volume ──
  const handleVolumeChange = useCallback((e) => {
    const val = parseFloat(e.target.value)
    setVolume(val)
    if (videoRef.current) {
      videoRef.current.volume = val
      videoRef.current.muted = val === 0
      setMuted(val === 0)
    }
  }, [])

  const toggleMute = useCallback(() => {
    const v = videoRef.current
    if (!v) return
    v.muted = !v.muted
    setMuted(v.muted)
  }, [])

  // ── Speed ──
  const cycleSpeed = useCallback(() => {
    const next = (speedIdx + 1) % SPEEDS.length
    setSpeedIdx(next)
    if (videoRef.current) videoRef.current.playbackRate = SPEEDS[next]
  }, [speedIdx])

  // ── Skip 10s ──
  const skip = useCallback((secs) => {
    const v = videoRef.current
    if (!v) return
    v.currentTime = Math.max(0, Math.min(v.duration || 0, v.currentTime + secs))
  }, [])

  // ── Fullscreen ──
  const toggleFullscreen = useCallback(() => {
    const el = containerRef.current
    if (!el) return
    if (!document.fullscreenElement) {
      el.requestFullscreen?.()
    } else {
      document.exitFullscreen?.()
    }
  }, [])

  // ── PiP ──
  const togglePip = useCallback(async () => {
    const v = videoRef.current
    if (!v) return
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture()
        setIsPip(false)
      } else {
        await v.requestPictureInPicture()
        setIsPip(true)
      }
    } catch {}
  }, [])

  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    const onEnterPip = () => setIsPip(true)
    const onLeavePip = () => setIsPip(false)
    v.addEventListener('enterpictureinpicture', onEnterPip)
    v.addEventListener('leavepictureinpicture', onLeavePip)
    return () => {
      v.removeEventListener('enterpictureinpicture', onEnterPip)
      v.removeEventListener('leavepictureinpicture', onLeavePip)
    }
  }, [])

  // ── Show controls on mouse move ──
  const showControls = useCallback(() => {
    setControlsVisible(true)
    clearTimeout(controlsTimeout.current)
    controlsTimeout.current = setTimeout(() => setControlsVisible(false), 3000)
  }, [])

  // ── Keyboard shortcuts ──
  useEffect(() => {
    const handler = (e) => {
      if (e.target.tagName === 'INPUT') return
      switch(e.key) {
        case ' ':
        case 'k':
          e.preventDefault()
          togglePlay()
          break
        case 'ArrowLeft':
          e.preventDefault()
          skip(-10)
          break
        case 'ArrowRight':
          e.preventDefault()
          skip(10)
          break
        case 'f':
          e.preventDefault()
          toggleFullscreen()
          break
        case 'm':
          e.preventDefault()
          toggleMute()
          break
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [togglePlay, skip, toggleFullscreen, toggleMute])

  const progressPct = duration ? (currentTime / duration) * 100 : 0
  const bufferedPct = duration ? (buffered / duration) * 100 : 0

  return (
    <div className="vcv-page">
      {/* ── Animated background blobs ── */}
      <div className="vcv-blob vcv-blob-1" />
      <div className="vcv-blob vcv-blob-2" />
      <div className="vcv-blob vcv-blob-3" />

      {/* ── Sparkle decorations ── */}
      <div className="vcv-sparkle vcv-sparkle-1"><Sparkle size={32} /></div>
      <div className="vcv-sparkle vcv-sparkle-2"><Sparkle size={24} color="#b8b0e8" /></div>
      <div className="vcv-sparkle vcv-sparkle-3"><Sparkle size={20} color="#d4f5c4" /></div>

      {/* ── Top Bar ── */}
      <div className="vcv-topbar">
        <Link to="/" className="vcv-logo">Rishu Singh</Link>
        <Link to="/" className="vcv-back">
          <IconArrow /> <span>Back to Portfolio</span>
        </Link>
      </div>

      {/* ── Content ── */}
      <div className="vcv-content">
        {/* Header */}
        <div className="vcv-header">
          <div className="vcv-badge">
            <span className="vcv-badge-dot" />
            Video Resume
          </div>
          <h1 className="vcv-title">
            My <span className="vcv-title-accent">Video CV</span>
          </h1>
          <p className="vcv-subtitle">
            Get to know me beyond the written word — my skills, experience,
            and personality in a quick video presentation.
          </p>
        </div>

        {/* Glassy Video Player */}
        <div className="vcv-player-wrapper">
          <div className="vcv-glass-frame">
            {loading ? (
              <div style={{ padding: '80px 20px', textAlign: 'center', color: '#555', fontFamily: 'var(--font-head)' }}>
                Loading Video CV...
              </div>
            ) : !videoSrc ? (
              <div style={{ padding: '80px 20px', textAlign: 'center', color: '#555', fontFamily: 'var(--font-head)' }}>
                <h3>No Video CV Available Yet</h3>
                <p style={{ marginTop: '10px', fontSize: '14px' }}>The video resume will be displayed here once uploaded from the admin dashboard.</p>
              </div>
            ) : (
              <div
                ref={containerRef}
                className={`vcv-player-container ${controlsVisible ? 'controls-visible' : ''}`}
                onMouseMove={showControls}
                onMouseLeave={() => setControlsVisible(false)}
              >
                <video
                  ref={videoRef}
                  className="vcv-video"
                  src={videoSrc}
                  preload="metadata"
                  playsInline
                  onClick={togglePlay}
                />

              {/* Poster overlay */}
              <div
                className={`vcv-poster-overlay ${!showPoster ? 'hidden' : ''}`}
                onClick={handlePosterClick}
              >
                <button className="vcv-big-play" aria-label="Play video">
                  <IconPlay />
                </button>
              </div>

              {/* PiP indicator */}
              {isPip && (
                <div className="vcv-pip-indicator">
                  ▶ Playing in Picture-in-Picture
                </div>
              )}

              {/* Custom Controls */}
              <div className="vcv-controls">
                {/* Progress */}
                <div className="vcv-progress-bar" onClick={handleSeek}>
                  <div className="vcv-progress-buffered" style={{ width: `${bufferedPct}%` }} />
                  <div className="vcv-progress-filled" style={{ width: `${progressPct}%` }} />
                </div>

                {/* Buttons row */}
                <div className="vcv-controls-row">
                  <button className="vcv-ctrl-btn" onClick={togglePlay} aria-label={playing ? 'Pause' : 'Play'}>
                    {playing ? <IconPause /> : <IconPlay />}
                  </button>
                  <button className="vcv-ctrl-btn" onClick={() => skip(-10)} aria-label="Rewind 10s">
                    <IconRewind />
                  </button>
                  <button className="vcv-ctrl-btn" onClick={() => skip(10)} aria-label="Forward 10s">
                    <IconForward />
                  </button>

                  <span className="vcv-time">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>

                  <div className="vcv-spacer" />

                  {/* Volume */}
                  <div className="vcv-volume-group">
                    <button className="vcv-ctrl-btn" onClick={toggleMute} aria-label={muted ? 'Unmute' : 'Mute'}>
                      {muted ? <IconMute /> : <IconVolume />}
                    </button>
                    <input
                      type="range"
                      className="vcv-volume-slider"
                      min="0"
                      max="1"
                      step="0.05"
                      value={muted ? 0 : volume}
                      onChange={handleVolumeChange}
                      aria-label="Volume"
                    />
                  </div>

                  {/* Speed */}
                  <button className="vcv-speed-btn" onClick={cycleSpeed}>
                    {SPEEDS[speedIdx]}x
                  </button>

                  {/* PiP */}
                  {'pictureInPictureEnabled' in document && (
                    <button className="vcv-ctrl-btn" onClick={togglePip} aria-label="Picture in Picture">
                      <IconPip />
                    </button>
                  )}

                  {/* Fullscreen */}
                  <button className="vcv-ctrl-btn" onClick={toggleFullscreen} aria-label="Fullscreen">
                    <IconFullscreen />
                  </button>
                </div>
              </div>
            </div>
            )}
          </div>
        </div>

        {/* Info card */}
        <div className="vcv-info-card">
          <div className="vcv-info-left">
            <div className="vcv-avatar">RS</div>
            <div className="vcv-info-text">
              <h3>Rishu Singh — Full-Stack Developer</h3>
              <p>Video resume • Updated {new Date().getFullYear()}</p>
            </div>
          </div>
          {videoSrc ? (
            <a
              href={videoSrc.includes('cloudinary.com') ? videoSrc.replace('/upload/', '/upload/fl_attachment/') : videoSrc}
              download
              className="vcv-download-btn"
              target="_blank"
              rel="noreferrer"
            >
              <IconDownload /> Download Video CV
            </a>
          ) : (
            <button className="vcv-download-btn" disabled style={{ opacity: 0.5, cursor: 'not-allowed' }}>
              <IconDownload /> Download Video CV
            </button>
          )}
        </div>

      </div>

      {/* Footer */}
      <div className="vcv-footer">
        © {new Date().getFullYear()} Rishu Singh · <Link to="/">rishurajput.com</Link>
      </div>
    </div>
  )
}
