// Root component — defines all routes and renders global layout (Navbar, Footer, Login modal)
import { Routes, Route } from 'react-router-dom'
import { useContext } from 'react'
import { ToastContainer } from 'react-toastify'
import { AppContext } from './context/AppContext.jsx'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import Login from './components/Login.jsx'
import Home from './pages/Home.jsx'
import Dashboard from './pages/Dashboard.jsx'
import ScanText from './pages/ScanText.jsx'
import ScanEmail from './pages/ScanEmail.jsx'
import ScanJob from './pages/ScanJob.jsx'
import ScanUrl from './pages/ScanUrl.jsx'
import ScanScreenshot from './pages/ScanScreenshot.jsx'
import ScanDocument from './pages/ScanDocument.jsx'
import Result from './pages/Result.jsx'
import History from './pages/History.jsx'
import Profile from './pages/Profile.jsx'

const App = () => {
  const { showLogin } = useContext(AppContext)

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Navbar />

      {/* Login modal — conditionally rendered when showLogin is true */}
      {showLogin && <Login />}

      {/* All page routes */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/scan/text" element={<ScanText />} />
        <Route path="/scan/email" element={<ScanEmail />} />
        <Route path="/scan/job" element={<ScanJob />} />
        <Route path="/scan/url" element={<ScanUrl />} />
        <Route path="/scan/screenshot" element={<ScanScreenshot />} />
        <Route path="/scan/document" element={<ScanDocument />} />
        <Route path="/result/:id" element={<Result />} />  {/* :id is the MongoDB scan _id */}
        <Route path="/history" element={<History />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>

      <Footer />

      {/* Global toast notification container — appears bottom-right */}
      <ToastContainer position="bottom-right" theme="light" />
    </div>
  )
}

export default App
