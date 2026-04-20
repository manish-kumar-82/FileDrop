import { useState } from 'react'
import axios from 'axios'
import DropZone from '../components/DropZone'
import ProgressBar from '../components/ProgressBar'
import ShareCard from '../components/ShareCard'

const API = 'http://localhost:5000'

export default function Home() {
  const [file, setFile] = useState(null)
  const [expireHours, setExpireHours] = useState(24)
  const [password, setPassword] = useState('')
  const [downloadLimit, setDownloadLimit] = useState('')
  const [progress, setProgress] = useState(0)
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const handleUpload = async () => {
    if (!file) return setError('Please select a file first!')
    setError('')
    setUploading(true)
    setProgress(0)
    setResult(null)

    const formData = new FormData()
    formData.append('file', file)
    formData.append('expireHours', expireHours)
    if (password) formData.append('password', password)
    if (downloadLimit) formData.append('downloadLimit', downloadLimit)

    try {
      const res = await axios.post(`${API}/api/upload`, formData, {
        onUploadProgress: (e) => {
          const percent = Math.round((e.loaded * 100) / e.total)
          setProgress(percent)
        },
      })
      setResult(res.data)
    } catch (err) {
      setError(err.response?.data?.error || 'Upload failed. Try again.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
    }}>
      <div style={{ width: '100%', maxWidth: '520px' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ fontSize: '36px', fontWeight: 700 }}>
            📦 FileDrop
          </h1>
          <p style={{ color: '#888', marginTop: '8px' }}>
            Share any file instantly — no account needed
          </p>
        </div>

        {/* Dropzone */}
        <DropZone onFileSelect={setFile} selectedFile={file} />

        {/* Options */}
        {!result && (
          <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>

            {/* Expiry */}
            <div>
              <label style={{ fontSize: '13px', color: '#888', marginBottom: '6px', display: 'block' }}>
                Link expiry
              </label>
              <select
                value={expireHours}
                onChange={(e) => setExpireHours(e.target.value)}
                style={{
                  width: '100%', padding: '10px 14px',
                  background: '#1a1a1a', border: '1px solid #333',
                  borderRadius: '10px', color: '#fff', fontSize: '14px'
                }}
              >
                <option value={1}>1 hour</option>
                <option value={6}>6 hours</option>
                <option value={24}>24 hours</option>
                <option value={72}>3 days</option>
                <option value={168}>7 days</option>
              </select>
            </div>

            {/* Password */}
            <div>
              <label style={{ fontSize: '13px', color: '#888', marginBottom: '6px', display: 'block' }}>
                Password (optional)
              </label>
              <input
                type="password"
                placeholder="Leave empty for no password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%', padding: '10px 14px',
                  background: '#1a1a1a', border: '1px solid #333',
                  borderRadius: '10px', color: '#fff', fontSize: '14px'
                }}
              />
            </div>

            {/* Download limit */}
            <div>
              <label style={{ fontSize: '13px', color: '#888', marginBottom: '6px', display: 'block' }}>
                Download limit (optional)
              </label>
              <input
                type="number"
                placeholder="e.g. 5 (leave empty for unlimited)"
                value={downloadLimit}
                onChange={(e) => setDownloadLimit(e.target.value)}
                style={{
                  width: '100%', padding: '10px 14px',
                  background: '#1a1a1a', border: '1px solid #333',
                  borderRadius: '10px', color: '#fff', fontSize: '14px'
                }}
              />
            </div>
          </div>
        )}

        {/* Progress */}
        {uploading && <ProgressBar progress={progress} />}

        {/* Error */}
        {error && (
          <p style={{
            color: '#f87171', background: '#2a0f0f',
            border: '1px solid #5a1f1f', borderRadius: '10px',
            padding: '12px 16px', marginTop: '16px', fontSize: '14px'
          }}>
            ⚠️ {error}
          </p>
        )}

        {/* Upload button */}
        {!result && (
          <button
            onClick={handleUpload}
            disabled={uploading || !file}
            style={{
              width: '100%', marginTop: '20px',
              padding: '14px', fontSize: '16px', fontWeight: 600,
              background: uploading || !file ? '#333' : '#6c63ff',
              color: uploading || !file ? '#666' : '#fff',
              border: 'none', borderRadius: '12px',
              transition: 'all 0.2s',
            }}
          >
            {uploading ? `Uploading... ${progress}%` : '🚀 Upload & Get Link'}
          </button>
        )}

        {/* Share card */}
        {result && (
          <>
            <ShareCard
              shareUrl={result.shareUrl}
              expiresAt={result.expiresAt}
              fileName={file.name}
            />
            <button
              onClick={() => { setResult(null); setFile(null); setProgress(0) }}
              style={{
                width: '100%', marginTop: '12px',
                padding: '12px', fontSize: '14px',
                background: 'transparent', color: '#888',
                border: '1px solid #333', borderRadius: '12px',
              }}
            >
              Upload another file
            </button>
          </>
        )}

      </div>
    </div>
  )
}