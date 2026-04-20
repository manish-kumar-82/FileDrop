import { useRef, useState } from 'react'

export default function DropZone({ onFileSelect, selectedFile }) {
  const inputRef = useRef()
  const [dragging, setDragging] = useState(false)

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) onFileSelect(file)
  }

  const formatSize = (bytes) => {
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    if (bytes < 1024 * 1024 * 1024) return (bytes / 1024 / 1024).toFixed(1) + ' MB'
    return (bytes / 1024 / 1024 / 1024).toFixed(2) + ' GB'
  }

  return (
    <div
      onClick={() => inputRef.current.click()}
      onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      style={{
        border: `2px dashed ${dragging ? '#6c63ff' : '#333'}`,
        borderRadius: '16px',
        padding: '48px 24px',
        textAlign: 'center',
        cursor: 'pointer',
        background: dragging ? '#1a1a2e' : '#1a1a1a',
        transition: 'all 0.2s',
      }}
    >
      <input
        type="file"
        ref={inputRef}
        style={{ display: 'none' }}
        onChange={(e) => onFileSelect(e.target.files[0])}
      />

      {selectedFile ? (
        <div>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>📄</div>
          <p style={{ fontSize: '18px', fontWeight: 600, color: '#fff' }}>
            {selectedFile.name}
          </p>
          <p style={{ color: '#888', marginTop: '6px' }}>
            {formatSize(selectedFile.size)}
          </p>
          <p style={{ color: '#6c63ff', marginTop: '8px', fontSize: '14px' }}>
            Click to change file
          </p>
        </div>
      ) : (
        <div>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>☁️</div>
          <p style={{ fontSize: '20px', fontWeight: 600 }}>
            Drop your file here
          </p>
          <p style={{ color: '#888', marginTop: '8px' }}>
            or click to browse — any file, up to 2GB
          </p>
        </div>
      )}
    </div>
  )
}