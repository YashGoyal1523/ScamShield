// ============================================================
// Home.jsx - Landing page for all users (authenticated + unauthenticated)
// Shows hero section, 6 scan types, how it works, platform stats, and CTAs
// If user clicks buttons without token, shows login modal
// ============================================================

import { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext.jsx'
import { scanTypes, howItWorks, platformStats } from '../assets/assets.js'

const Home = () => {
  // Get auth state and modal control from global context
  const { token, setShowLogin } = useContext(AppContext)
  const navigate = useNavigate()

  // ---- GET STARTED BUTTON ----
  // If logged in: navigate to dashboard
  // If not logged in: show login modal
  const handleGetStarted = () => {
    if (token) {
      navigate('/dashboard')
    } else {
      setShowLogin(true)
    }
  }

  // ---- SCAN TYPE CARD CLICK ----
  // If logged in: navigate to the specific scan page (e.g., /scan/email)
  // If not logged in: show login modal first
  const handleScanClick = (path) => {
    if (token) {
      navigate(path)
    } else {
      setShowLogin(true)
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-6">

      {/* ========== HERO SECTION ========== */}
      <section className="text-center pt-24 pb-16">

        {/* Badge showing AI/VirusTotal powered */}
        <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs px-3 py-1.5 rounded-full mb-6">
          {/* Pulsing dot animation */}
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span>
          Powered by Gemini AI + VirusTotal
        </div>

        {/* Main headline */}
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
          Detect Scams
          <br />
          {/* Gradient text on "Instantly" */}
          <span className="bg-linear-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
            Instantly
          </span>
        </h1>

        {/* Subheading explaining what the app does */}
        <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
          ScamShield uses AI to analyze messages, emails, job posts, links, screenshots, and documents - and tells you exactly what's suspicious.
        </p>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">

          {/* Primary button: Start Scanning Free */}
          <button
            onClick={handleGetStarted}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-xl font-medium text-base transition-colors w-full sm:w-auto"
          >
            Start Scanning Free
          </button>

          {/* Secondary button: How it works - scrolls to the "How it works" section below */}
          <button
            onClick={() => document.getElementById('how-it-works').scrollIntoView({ behavior: 'smooth' })}
            className="bg-white/5 hover:bg-white/10 text-white px-8 py-3.5 rounded-xl font-medium text-base transition-colors border border-white/10 w-full sm:w-auto"
          >
            How it works
          </button>

        </div>
      </section>

      {/* ========== PLATFORM STATS BAR ========== */}
      {/* Shows: 6 scan types, analysis time, AI powered, free to use */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-20">
        {platformStats.map((stat, i) => (
          <div key={i} className="bg-[#1a1a1a] border border-white/10 rounded-xl p-5 text-center">
            {/* Stat value (e.g., "6", "< 5s", "Gemini", "100%") */}
            <p className="text-2xl font-bold text-white mb-1">{stat.value}</p>
            {/* Stat label (e.g., "Scan Types", "Analysis Time") */}
            <p className="text-gray-500 text-sm">{stat.label}</p>
          </div>
        ))}
      </section>

      {/* ========== 6 SCAN TYPES ========== */}
      {/* Displays all 6 scan types as clickable cards */}
      <section className="mb-20">

        {/* Section header */}
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-white mb-3">6 Types of Scam Detection</h2>
          <p className="text-gray-500">Every format covered - text, image, or link</p>
        </div>

        {/* Grid of scan type cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {scanTypes.map((type) => (
            <div
              key={type.id}
              onClick={() => handleScanClick(type.path)}
              className="bg-[#1a1a1a] border border-white/10 rounded-xl p-6 cursor-pointer hover:bg-[#222] hover:border-white/20 transition-all group"
            >
              {/* Colored icon badge - color from assets.js */}
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold mb-4"
                style={{
                  // type.color is a hex code like "#3b82f6"
                  // Adding 20 to hex makes it semi-transparent (e.g., #3b82f6 → #3b82f620)
                  backgroundColor: type.color + '20',
                  color: type.color
                }}
              >
                {type.icon}  {/* e.g., "MSG", "EMAIL", "JOB" */}
              </div>

              {/* Scan type label */}
              <h3 className="text-white font-semibold mb-2 group-hover:text-blue-400 transition-colors">
                {type.label}  {/* e.g., "Text / Message", "Email", "Job Post" */}
              </h3>

              {/* Description of what this scan does */}
              <p className="text-gray-500 text-sm leading-relaxed">{type.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ========== HOW IT WORKS ========== */}
      {/* Step-by-step explanation of the scanning process */}
      <section id="how-it-works" className="mb-20">

        {/* Section header */}
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-white mb-3">How It Works</h2>
          <p className="text-gray-500">Get a full scam analysis in under 5 seconds</p>
        </div>

        {/* Three steps laid out horizontally */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {howItWorks.map((step, i) => (
            <div key={i} className="flex flex-col items-start">

              {/* Step number in a circle */}
              <div className="w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-500/20 flex items-center justify-center mb-4">
                <span className="text-blue-400 font-bold text-sm">{step.step}</span>
                {/* e.g., "01", "02", "03" */}
              </div>

              {/* Step title */}
              <h3 className="text-white font-semibold text-lg mb-2">{step.title}</h3>

              {/* Step description */}
              <p className="text-gray-500 text-sm leading-relaxed">{step.description}</p>

              {/* Placeholder for connecting line (visual separator on desktop) */}
              {i < howItWorks.length - 1 && (
                <div className="hidden md:block absolute" />
              )}

            </div>
          ))}
        </div>
      </section>

      {/* ========== FINAL CTA SECTION ========== */}
      {/* Eye-catching banner encouraging user to get started */}
      <section className="bg-linear-to-r from-blue-600/10 to-blue-800/10 border border-blue-500/20 rounded-2xl p-12 text-center mb-20">

        {/* Headline */}
        <h2 className="text-3xl font-bold text-white mb-4">
          Start protecting yourself today
        </h2>

        {/* Subtext with value proposition */}
        <p className="text-gray-400 mb-8 max-w-lg mx-auto">
          Free, instant AI analysis. No downloads. No credit card.
        </p>

        {/* Primary CTA button */}
        <button
          onClick={handleGetStarted}
          className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-xl font-medium text-base transition-colors"
        >
          Analyze Your First Scan
        </button>

      </section>

    </div>
  )
}

export default Home
