// ============================================================
// History.jsx — Paginated list of all user's past scans with filters
// Allows filtering by type and verdict, 10 scans per page
// Delete button on each row removes scan immediately
// ============================================================

import { useContext, useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'
import { AppContext } from '../context/AppContext.jsx'
import { verdictConfig, scanTypeLabels } from '../assets/assets.js'
import ResultPanel from '../components/ResultPanel.jsx'

// Filter options
const TYPES = ['all', 'text', 'email', 'job', 'url', 'screenshot', 'document']
const VERDICTS = ['all', 'SCAM', 'SUSPICIOUS', 'SAFE']

const History = () => {
  // Get auth state from global context
  const { token, backendUrl } = useContext(AppContext)

  // ---- PAGE STATE ----
  const [scans, setScans] = useState([])              // List of scans on current page
  const [loading, setLoading] = useState(true)        // true while fetching from API
  const [typeFilter, setTypeFilter] = useState('all') // Filter by scan type
  const [verdictFilter, setVerdictFilter] = useState('all') // Filter by verdict
  const [page, setPage] = useState(1)                 // Current page number
  const [totalPages, setTotalPages] = useState(1)     // Total number of pages
  const [deletingId, setDeletingId] = useState(null)  // ID of scan being deleted (for loading state)
  const [selectedScanId, setSelectedScanId] = useState(null) // ID of scan in side panel
  const [selectedScanDetails, setSelectedScanDetails] = useState(null) // Full scan details for panel
  const [panelLoading, setPanelLoading] = useState(false) // Loading state for panel

  const navigate = useNavigate()

  // ---- LOAD HISTORY ----
  // Fetches scans from backend with filters applied
  const loadHistory = async () => {
    setLoading(true)
    try {
      // Build query string with filters
      const params = new URLSearchParams({ page })
      // Only add filter params if not "all" (saves bandwidth)
      if (typeFilter !== 'all') params.append('type', typeFilter)
      if (verdictFilter !== 'all') params.append('verdict', verdictFilter)

      const { data } = await axios.get(
        backendUrl + `/api/scan/history?${params}`,
        { headers: { token } }
      )

      if (data.success) {
        setScans(data.scans)      // Array of 10 scans (or fewer on last page)
        setTotalPages(data.pages) // Used to render pagination buttons
      } else {
        toast.error(data.message)
      }
    } catch (e) {
      toast.error(e.message)
    }
    setLoading(false)
  }

  // ---- OPEN SCAN IN PANEL ----
  // Fetches full scan details and opens panel
  const handleOpenScan = async (scanId) => {
    setPanelLoading(true)
    try {
      const { data } = await axios.get(
        backendUrl + `/api/scan/${scanId}`,
        { headers: { token } }
      )

      if (data.success) {
        setSelectedScanId(scanId)
        setSelectedScanDetails(data.scan)
      } else {
        toast.error(data.message)
      }
    } catch (e) {
      toast.error(e.message)
    }
    setPanelLoading(false)
  }

  // ---- CLOSE PANEL ----
  const handleClosePanel = () => {
    setSelectedScanId(null)
    setSelectedScanDetails(null)
  }

  // ---- DELETE SCAN ----
  // Removes a single scan from history and updates UI immediately
  const handleDelete = async (e, scanId) => {
    e.preventDefault()
    e.stopPropagation()
    // Prevent link navigation when clicking delete button

    setDeletingId(scanId) // Show loading state on this button
    try {
      const { data } = await axios.delete(
        backendUrl + `/api/scan/${scanId}`,
        { headers: { token } }
      )

      if (data.success) {
        // Remove from UI immediately without reloading page
        setScans(prev => prev.filter(s => s._id !== scanId))
        // Close panel if deleted scan is selected
        if (selectedScanId === scanId) handleClosePanel()
        toast.success('Scan deleted')
      } else {
        toast.error(data.message)
      }
    } catch (e) {
      toast.error(e.message)
    }
    setDeletingId(null) // Clear loading state
  }

  // ---- PREVENT BODY SCROLL WHEN MODAL IS OPEN ----
  useEffect(() => {
    if (selectedScanId) {
      // Disable scroll on body when modal opens
      document.body.style.overflow = 'hidden'
    } else {
      // Re-enable scroll on body when modal closes
      document.body.style.overflow = 'unset'
    }

    // Cleanup when component unmounts
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [selectedScanId])

  // ---- INITIAL LOAD + FILTER CHANGES ----
  // Re-fetch whenever filters or page changes
  useEffect(() => {
    // If not logged in, redirect to home
    if (!token) {
      navigate('/')
      return
    }

    loadHistory()
  }, [token, typeFilter, verdictFilter, page])

  // ---- FILTER CHANGE HANDLER ----
  // When user changes a filter, reset to page 1 and update filter
  const handleFilterChange = (setter) => (value) => {
    setter(value)
    setPage(1)  // Reset to first page when filters change
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">

      {/* ========== PAGE HEADER ========== */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Scan History</h1>
        <p className="text-gray-500 text-sm mt-1">All your previous scans and results</p>
      </div>

      {/* ========== FILTERS ========== */}
      {/* Verdict buttons + Type dropdown */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">

        {/* Verdict filter buttons */}
        <div className="flex gap-2 flex-wrap">
          {VERDICTS.map(v => (
            <button
              key={v}
              onClick={() => handleFilterChange(setVerdictFilter)(v)}
              className={`text-xs px-3 py-1.5 rounded-lg transition-colors capitalize ${
                verdictFilter === v
                  // Active state: white/color based on verdict
                  ? v === 'all' ? 'bg-white/20 text-white' : `${verdictConfig[v]?.bg} ${verdictConfig[v]?.text} ${verdictConfig[v]?.border} border`
                  // Inactive state: gray, hoverable
                  : 'bg-white/5 text-gray-500 hover:text-white hover:bg-white/10'
              }`}
            >
              {v}
            </button>
          ))}
        </div>

        {/* Type filter dropdown */}
        <select
          value={typeFilter}
          onChange={(e) => handleFilterChange(setTypeFilter)(e.target.value)}
          className="bg-white/5 border border-white/10 text-gray-400 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-white/20"
        >
          {TYPES.map(t => (
            <option key={t} value={t} className="bg-[#1a1a1a]">
              {t === 'all' ? 'All types' : scanTypeLabels[t]}
            </option>
          ))}
        </select>

      </div>

      {/* ========== SCANS LIST ========== */}

      {loading ? (
        // Loading skeleton — 5 placeholder rows
        <div className="flex flex-col gap-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-[#1a1a1a] rounded-xl h-16 animate-pulse" />
          ))}
        </div>

      ) : scans.length === 0 ? (
        // Empty state when no scans match filters
        <div className="text-center py-20">
          <p className="text-gray-600 text-lg mb-2">No scans found</p>
          <p className="text-gray-700 text-sm mb-6">Try changing the filters or run a new scan</p>
          <Link
            to="/dashboard"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl text-sm transition-colors"
          >
            Start Scanning
          </Link>
        </div>

      ) : (
        // Scan list — table-like rows
        <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl overflow-hidden">
          {scans.map((scan, i) => (
            // Each scan is a clickable row linking to result page
            <div
              key={scan._id}
              className={`flex items-center justify-between px-5 py-4 transition-colors ${
                i < scans.length - 1 ? 'border-b border-white/5' : ''
              }`}
            >

              {/* Left side: Type badge + Content preview — clickable to open panel */}
              <button
                onClick={() => handleOpenScan(scan._id)}
                className="flex items-center gap-4 min-w-0 flex-1 hover:bg-white/5 -mx-5 px-5 py-1 rounded-lg transition-colors text-left bg-transparent border-none cursor-pointer"
              >
                {/* Scan type badge */}
                <span className="text-xs bg-white/10 text-gray-400 px-2 py-1 rounded-md capitalize shrink-0">
                  {scan.type}
                </span>

                {/* Content preview (first 60 chars) */}
                <p className="text-gray-400 text-sm truncate">
                  {scan.content
                    ? scan.content.slice(0, 60) + (scan.content.length > 60 ? '...' : '')
                    : `${scanTypeLabels[scan.type]} scan`
                  // Show "Email scan" if no content (image scan)
                  }
                </p>
              </button>

              {/* Right side: Verdict + Score + Date + Delete button */}
              <div className="flex items-center gap-3 shrink-0 ml-4">

                {/* Verdict badge with color from verdictConfig */}
                <span className={`text-xs font-medium px-2 py-1 rounded-md ${verdictConfig[scan.verdict]?.bg} ${verdictConfig[scan.verdict]?.text}`}>
                  {scan.verdict}
                </span>

                {/* Score out of 100 */}
                <span className="text-gray-600 text-xs w-12 text-right">{scan.score}/100</span>

                {/* Date — hidden on mobile */}
                <span className="text-gray-700 text-xs hidden sm:block">
                  {new Date(scan.createdAt).toLocaleDateString()}
                </span>

                {/* Delete button */}
                <button
                  onClick={(e) => handleDelete(e, scan._id)}
                  disabled={deletingId === scan._id}
                  className="text-gray-700 hover:text-red-400 disabled:opacity-50 text-xs transition-colors ml-1"
                  title="Delete scan"
                >
                  {deletingId === scan._id ? '...' : '✕'}
                  {/* Shows "..." while deleting, "✕" normally */}
                </button>

              </div>

            </div>
          ))}
        </div>
      )}

      {/* ========== PAGINATION ========== */}
      {/* Show previous/next buttons if more than 1 page */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">

          {/* Previous button — disabled on page 1 */}
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-white text-sm px-4 py-2 rounded-lg transition-colors"
          >
            Previous
          </button>

          {/* Page indicator */}
          <span className="text-gray-500 text-sm px-2">
            Page {page} of {totalPages}
          </span>

          {/* Next button — disabled on last page */}
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-white text-sm px-4 py-2 rounded-lg transition-colors"
          >
            Next
          </button>

        </div>
      )}

      {/* ========== CENTRAL PANEL (Modal) ========== */}
      {selectedScanId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-6"
          onClick={(e) => { if (e.currentTarget === e.target) handleClosePanel() }}
        >
          <div className="relative bg-[#1a1a1a] border border-white/10 rounded-2xl w-full max-w-2xl shadow-2xl">
            {/* Close button - Absolute positioned */}
            <button
              onClick={handleClosePanel}
              className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 border border-white/20 text-gray-400 hover:text-white hover:bg-white/20 transition-colors shadow-sm"
            >
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {/* Content container */}
            <div className="overflow-y-auto max-h-[90vh] rounded-2xl">
              <ResultPanel scan={selectedScanDetails} loading={panelLoading} />
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default History
