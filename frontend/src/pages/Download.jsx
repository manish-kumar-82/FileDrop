import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'

const API = 'http://localhost:5000'

export default function Download() {
  const { fileId } = useParams()
  const [fileInfo, setFileInfo] = useState(null)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    axios.get(`${API}/api/download/info/${fileId}`)
      .then(res => setFileInfo(res.data))
      .catch(() => setError('File not found or link has expired.'))
      .finally(() => setLoading(false))
  }, [fileId])

  const formatSize = (bytes) => {
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    if (bytes < 1024 * 1024 * 1024) return (bytes / 1024 / 1024).toFixed(1) + ' MB'
    return (bytes / 1024 / 1024 / 1024).toFixed(2) + ' GB'
  }

const handleDownload = async () => {
  setError('')

  if (fileInfo.hasPassword && !password) {
    setError('Please enter password first')
    return
  }

  setDownloading(true)

  try {
    if (fileInfo.hasPassword) {
      // Step 1 — pehle sirf password verify karo (blob nahi)
      const verifyRes = await axios.get(
        `${API}/api/download/info/${fileId}?password=${encodeURIComponent(password)}`,
        { validateStatus: (s) => true }
      )

      if (verifyRes.status === 401 || verifyRes.data?.error === 'Wrong password') {
        setError('Wrong password. Please try again.')
        return
      }

      if (verifyRes.status === 403) {
        setError('Download limit reached.')
        return
      }

      // Step 2 — password sahi hai, ab download karo
      window.location.href = `${API}/api/download/file/${fileId}?password=${encodeURIComponent(password)}`

    } else {
      window.location.href = `${API}/api/download/file/${fileId}`
    }

  } catch (err) {
    setError('Download failed. Try again.')
  } finally {
    setDownloading(false)
  }
}

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#888' }}>Loading...</p>
    </div>
  )

  if (error && !fileInfo) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: '48px' }}>😕</p>
        <p style={{ color: '#f87171', marginTop: '16px', fontSize: '18px' }}>{error}</p>
      </div>
    </div>
  )

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center', padding: '24px'
    }}>
      <div style={{ width: '100%', maxWidth: '460px' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 700 }}>📦 FileDrop</h1>
          <p style={{ color: '#888', marginTop: '8px' }}>Someone shared a file with you</p>
        </div>

        {/* File card */}
        <div style={{
          background: '#1a1a1a', border: '1px solid #2a2a2a',
          borderRadius: '16px', padding: '24px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
            <div style={{
              width: '52px', height: '52px', borderRadius: '12px',
              background: '#0f1a2a', display: 'flex',
              alignItems: 'center', justifyContent: 'center', fontSize: '28px'
            }}>📄</div>
            <div>
              <p style={{ fontWeight: 600, fontSize: '16px', wordBreak: 'break-all' }}>
                {fileInfo.originalName}
              </p>
              <p style={{ color: '#888', fontSize: '13px', marginTop: '4px' }}>
                {formatSize(fileInfo.size)}
              </p>
            </div>
          </div>

          {/* File details */}
          <div style={{
            background: '#0f0f0f', borderRadius: '10px',
            padding: '12px 16px', marginBottom: '20px',
            display: 'flex', flexDirection: 'column', gap: '8px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
              <span style={{ color: '#666' }}>Expires</span>
              <span style={{ color: '#888' }}>
                {new Date(fileInfo.expiresAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
              <span style={{ color: '#666' }}>Downloads</span>
              <span style={{ color: '#888' }}>
                {fileInfo.downloadCount}{fileInfo.downloadLimit ? `/${fileInfo.downloadLimit}` : ''}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
              <span style={{ color: '#666' }}>Password</span>
              <span style={{ color: fileInfo.hasPassword ? '#f59e0b' : '#4ade80' }}>
                {fileInfo.hasPassword ? '🔒 Protected' : '🔓 None'}
              </span>
            </div>
          </div>

          {/* Password input */}
          {fileInfo.hasPassword && (
            <input
              type="password"
              placeholder="Enter password to download"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%', padding: '10px 14px', marginBottom: '16px',
                background: '#0f0f0f', border: '1px solid #333',
                borderRadius: '10px', color: '#fff', fontSize: '14px'
              }}
            />
          )}

          {/* Error */}
          {error && (
            <p style={{
              color: '#f87171', background: '#2a0f0f',
              border: '1px solid #5a1f1f', borderRadius: '10px',
              padding: '10px 14px', marginBottom: '16px', fontSize: '13px'
            }}>
              ⚠️ {error}
            </p>
          )}

          {/* Download button */}
          <button
            onClick={handleDownload}
            disabled={downloading}
            style={{
              width: '100%', padding: '14px',
              fontSize: '16px', fontWeight: 600,
              background: downloading ? '#333' : '#6c63ff',
              color: downloading ? '#666' : '#fff',
              border: 'none', borderRadius: '12px',
              transition: 'all 0.2s',
            }}
          >
            {downloading ? 'Downloading...' : '⬇️ Download File'}
          </button>
        </div>

        {/* Upload own file */}
        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: '#555' }}>
          Want to share a file?{' '}
          <a href="/" style={{ color: '#6c63ff', textDecoration: 'none' }}>
            Upload on FileDrop
          </a>
        </p>

      </div>
    </div>
  )
}