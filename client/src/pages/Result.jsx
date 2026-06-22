// ============================================================
// Result.jsx — Displays detailed AI analysis of a single scan
// Route: /result/:id where :id is the MongoDB scan _id
// Fetches scan from backend and renders verdict, score, red flags, suggestions
// ============================================================

import { useContext, useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'
import { AppContext } from '../context/AppContext.jsx'
import ScamMeter from '../components/ScamMeter.jsx' // Animated gauge component
import ResultPanel from '../components/ResultPanel.jsx' // Reusable scan details component
import { verdictConfig, scanTypeLabels, scanTypes } from '../assets/assets.js'

const Result = () => {
  // ---- URL PARAMETERS ----
  // useParams() extracts :id from /result/:id
  // This is the MongoDB _id of the scan document to fetch
  const { id } = useParams()

  // ---- GLOBAL STATE ----
  const { token, backendUrl, setShowLogin } = useContext(AppContext)

  // ---- LOCAL STATE ----
  const [scan, setScan] = useState(null)               // Fetched scan data from backend
  const [loading, setLoading] = useState(true)         // true while fetching from API
  const [copied, setCopied] = useState(false)          // true temporarily after copying report
  const [expandedFlags, setExpandedFlags] = useState({}) // tracks which red flag cards are expanded
  // Example: { 0: true, 2: true, 1: false } means flags 0 and 2 are open

  const navigate = useNavigate()

  // ---- LOAD SCAN DATA ----
  // Fetches the scan result from backend using the scan ID from URL
  const loadScan = async () => {
    try {
      // Send request to backend with scan ID and auth token
      // Backend will check userId to ensure user owns this scan
      const { data } = await axios.get(backendUrl + `/api/scan/${id}`, { headers: { token } })

      if (data.success) {
        // Scan found and belongs to current user
        setScan(data.scan) // Store entire scan object (verdict, score, redFlags, etc.)
      } else {
        // Scan not found or belongs to different user
        toast.error(data.message)
        navigate('/dashboard') // Redirect to safe location
      }
    } catch (e) {
      // Network error or other exception
      toast.error(e.message)
    }
    setLoading(false) // Always stop loading regardless of success/failure
  }

  // ---- AUTH CHECK AND INITIAL LOAD ----
  // Runs once when component mounts and re-runs if token or id changes
  useEffect(() => {
    // If not logged in, force user to login page
    if (!token) {
      setShowLogin(true)  // Show login modal
      navigate('/')       // Redirect to home
      return
    }

    // User is logged in — fetch the scan
    loadScan()
  }, [token, id])

  // ---- COPY REPORT TO CLIPBOARD ----
  // Builds a formatted text report and copies it to clipboard
  const copyReport = async () => {
    if (!scan) return // Safety check — should not happen

    // Build formatted report string with all scan data
    const report = `ScamShield Analysis Report
---
Type: ${scanTypeLabels[scan.type]}
Verdict: ${scan.verdict}
Score: ${scan.score}/100
Date: ${new Date(scan.createdAt).toLocaleString()}

Analysis:
${scan.explanation}

Red Flags:
${
  // For each red flag, format as "1. Flag Name: Explanation"
  scan.redFlags.map((f, i) => `${i + 1}. ${f.flag}: ${f.explanation}`).join('\n')
}

Safety Suggestions:
${
  // For each suggestion, format as "1. Suggestion text"
  scan.suggestions.map((s, i) => `${i + 1}. ${s}`).join('\n')
}`

    try {
      // Copy to system clipboard — available in modern browsers on HTTPS
      await navigator.clipboard.writeText(report)

      // Flash the button to indicate success
      setCopied(true)
      setTimeout(() => setCopied(false), 2000) // Reset after 2 seconds

      toast.success('Report copied to clipboard')
    } catch {
      // clipboard API can fail on non-HTTPS or unsupported browsers
      toast.error('Could not copy — please copy manually')
    }
  }

  // ---- TOGGLE RED FLAG EXPANSION ----
  // Toggles whether a specific red flag's explanation is visible
  const toggleFlag = (i) => {
    // Use previous state to avoid race conditions
    // { ...prev } copies existing expanded flags
    // [i]: !prev[i] toggles the i-th flag (true→false, false→true, undefined→true)
    setExpandedFlags(prev => ({ ...prev, [i]: !prev[i] }))
  }

  // ---- LOADING STATE ----
  // While fetching from backend, show skeleton loaders
  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Skeleton card 1 — for verdict banner */}
        <div className="bg-[#1a1a1a] rounded-2xl h-60 animate-pulse mb-6" />
        {/* Skeleton card 2 — for explanation */}
        <div className="bg-[#1a1a1a] rounded-2xl h-40 animate-pulse mb-4" />
        {/* Skeleton card 3 — for red flags */}
        <div className="bg-[#1a1a1a] rounded-2xl h-40 animate-pulse" />
      </div>
    )
  }

  // If we get here and scan is null, something went wrong — return empty
  if (!scan) return null

  // Get color and styling for the verdict badge based on verdict type (SCAM/SUSPICIOUS/SAFE)
  // verdictConfig is imported from assets.js and has colors, bg, border, text classes
  const verdict = verdictConfig[scan.verdict]

  return (
    // max-w-3xl constrains width for readability
    // animate-fade-in applies fade-in animation when page loads
    <div className="max-w-3xl mx-auto px-6 py-12 animate-fade-in">

      {/* ========== VERDICT BANNER ========== */}
      {/* Colored banner showing scan type, verdict, date, and animated score gauge */}
      <div className={`rounded-2xl p-6 mb-6 border ${verdict.bg} ${verdict.border}`}>
        {/* flex with justify-between spreads content to left and right */}
        <div className="flex items-center justify-between flex-wrap gap-4">

          {/* LEFT SIDE: Scan type, verdict label, and date */}
          <div>
            {/* Scan type label — "Text Analysis", "Email Analysis", etc. */}
            <p className="text-gray-500 text-xs mb-1 uppercase tracking-wider">
              {scanTypeLabels[scan.type]} Analysis
            </p>

            {/* Verdict badge — "SCAM DETECTED", "SUSPICIOUS", or "SAFE" */}
            {/* Using verdict.text class for the color */}
            <h1 className={`text-3xl font-bold ${verdict.text}`}>
              {verdict.label}
            </h1>

            {/* Date the scan was created — formatted in local timezone */}
            <p className="text-gray-400 text-sm mt-1">
              {new Date(scan.createdAt).toLocaleString()}
            </p>
          </div>

          {/* RIGHT SIDE: Animated scam meter gauge */}
          {/* ScamMeter component gets the score and animates the needle/fill */}
          <ScamMeter score={scan.score} />

        </div>
      </div>

      {/* ========== SCAN DETAILS — Using reusable ResultPanel component ========== */}
      <div className="mb-6">
        <ResultPanel scan={scan} loading={loading} />
      </div>

      {/* ========== SCANNED CONTENT ========== */}
      {/* Shows the original content that was analyzed
          For text/email/job/url: the pasted text
          For screenshot/document: the file names */}
      {scan.content && (
        <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 mb-6">
          <h2 className="text-white font-semibold mb-3 text-sm uppercase tracking-wider">Scanned Content</h2>
          {/* bg-black/30 makes it darker to distinguish from explanatory text
              font-mono uses monospace font for code/text content
              whitespace-pre-wrap preserves line breaks and indentation */}
          <p className="text-gray-400 text-sm leading-relaxed whitespace-pre-wrap font-mono bg-black/30 rounded-xl p-4">
            {scan.content}
          </p>
        </div>
      )}

      {/* ========== ACTION BUTTONS ========== */}
      {/* Four action buttons allowing user to: copy, scan again, new scan, or view history */}
      <div className="flex flex-col sm:flex-row gap-3">

        {/* COPY REPORT — copies formatted text to clipboard */}
        <button
          onClick={copyReport}
          className="flex-1 bg-white/10 hover:bg-white/15 text-white py-3 rounded-xl font-medium text-sm transition-colors"
        >
          {/* Button text changes after copy: "Copy Report" → "Copied!" */}
          {copied ? 'Copied!' : 'Copy Report'}
        </button>

        {/* SCAN AGAIN — navigates back to the same scan type page (e.g., /scan/email) */}
        {/* scanTypes.find() searches the array to get the path for this scan's type */}
        <Link
          to={scanTypes.find(t => t.id === scan.type)?.path || '/dashboard'}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-medium text-sm transition-colors text-center"
        >
          Scan Again
        </Link>

        {/* NEW SCAN — navigates to dashboard to choose a different scan type */}
        <Link
          to="/dashboard"
          className="flex-1 bg-white/10 hover:bg-white/15 text-white py-3 rounded-xl font-medium text-sm transition-colors text-center"
        >
          New Scan
        </Link>

        {/* VIEW HISTORY — navigates to history page to see all past scans */}
        <Link
          to="/history"
          className="flex-1 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white py-3 rounded-xl font-medium text-sm transition-colors text-center border border-white/10"
        >
          View History
        </Link>

      </div>

    </div>
  )
}

export default Result
