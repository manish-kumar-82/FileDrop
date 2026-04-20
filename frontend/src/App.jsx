import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Download from './pages/Download'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/download/:fileId" element={<Download />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App