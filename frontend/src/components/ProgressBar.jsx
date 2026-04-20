export default function ProgressBar({ progress }) {
  return (
    <div style={{ marginTop: '24px' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '8px',
        fontSize: '14px',
        color: '#888'
      }}>
        <span>Uploading...</span>
        <span>{progress}%</span>
      </div>
      <div style={{
        background: '#1a1a1a',
        borderRadius: '99px',
        height: '8px',
        overflow: 'hidden',
        border: '1px solid #333'
      }}>
        <div style={{
          width: `${progress}%`,
          height: '100%',
          background: 'linear-gradient(90deg, #6c63ff, #a78bfa)',
          borderRadius: '99px',
          transition: 'width 0.3s ease',
        }} />
      </div>
    </div>
  )
}