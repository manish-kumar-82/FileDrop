import { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'

export default function ShareCard({ shareUrl, expiresAt, fileName }) {
  const [copied, setCopied] = useState(false)
  const [showQR, setShowQR] = useState(false)

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const formatExpiry = (date) => {
    return new Date(date).toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short'
    })
  }

  return (
    <div style={{
      background: '#1a1a1a',
      border: '1px solid #2a2a2a',
      borderRadius: '16px',
      padding: '24px',
      marginTop: '24px',
    }}>
      {/* Success header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        <div style={{
          width: '40px', height: '40px', borderRadius: '50%',
          background: '#0f2a1a', display: 'flex',
          alignItems: 'center', justifyContent: 'center', fontSize: '20px'
        }}>✅</div>
        <div>
          <p style={{ fontWeight: 600, fontSize: '16px' }}>Upload successful!</p>
          <p style={{ color: '#888', fontSize: '13px' }}>{fileName}</p>
        </div>
      </div>

      {/* Share URL */}
      <div style={{
        background: '#0f0f0f',
        border: '1px solid #333',
        borderRadius: '10px',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        marginBottom: '16px'
      }}>
        <p style={{
          color: '#a78bfa',
          fontSize: '14px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          flex: 1
        }}>
          {shareUrl}
        </p>
        <button
          onClick={copyLink}
          style={{
            background: copied ? '#0f2a1a' : '#6c63ff',
            color: copied ? '#4ade80' : '#fff',
            border: 'none',
            borderRadius: '8px',
            padding: '8px 16px',
            fontSize: '13px',
            fontWeight: 600,
            flexShrink: 0,
            transition: 'all 0.2s'
          }}
        >
          {copied ? '✓ Copied!' : 'Copy Link'}
        </button>
      </div>

      {/* Expiry info */}
      <p style={{ color: '#666', fontSize: '13px', marginBottom: '16px' }}>
        🕐 Expires: {formatExpiry(expiresAt)}
      </p>

      {/* QR Code toggle */}
      <button
        onClick={() => setShowQR(!showQR)}
        style={{
          background: 'transparent',
          border: '1px solid #333',
          color: '#888',
          borderRadius: '8px',
          padding: '8px 16px',
          fontSize: '13px',
          width: '100%',
          transition: 'all 0.2s'
        }}
      >
        {showQR ? 'Hide QR Code' : '📱 Show QR Code'}
      </button>

      {showQR && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginTop: '16px',
          padding: '16px',
          background: '#fff',
          borderRadius: '12px',
        }}>
          <QRCodeSVG value={shareUrl} size={180} />
        </div>
      )}
    </div>
  )
}