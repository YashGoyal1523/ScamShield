// ============================================================
// Dashboard.jsx — Main dashboard showing scan analytics and stats
// Fetches all data from /api/scan/stats (7 parallel MongoDB queries)
// Displays stat cards, charts, scan shortcuts, and recent scans
// ============================================================

import { useContext, useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts' // Recharts library for data visualization
import { AppContext } from '../context/AppContext.jsx'
import { scanTypes, verdictConfig, scanTypeLabels } from '../assets/assets.js'
import ResultPanel from '../components/ResultPanel.jsx'

const Dashboard = () => {
  // Get auth token and backend URL from global context
  const { token, backendUrl } = useContext(AppContext)

  // State for fetched stats data from backend
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  // State for modal
  const [selectedScanId, setSelectedScanId] = useState(null)
  const [selectedScanDetails, setSelectedScanDetails] = useState(null)
  const [panelLoading, setPanelLoading] = useState(false)

  const navigate = useNavigate()

  // ---- OPEN SCAN IN MODAL ----
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

  // ---- CLOSE MODAL ----
  const handleClosePanel = () => {
    setSelectedScanId(null)
    setSelectedScanDetails(null)
  }

  // ---- LOAD DASHBOARD STATS ----
  // Fetches all analytics data from /api/scan/stats
  // Backend runs 7 MongoDB queries in parallel (Promise.all)
  // Returns: stats (4 counts), typeStats, weeklyActivity, recentScans
  const loadStats = async () => {
    try {
      // GET request to /api/scan/stats with auth token
      const { data } = await axios.get(backendUrl + '/api/scan/stats', { headers: { token } })

      if (data.success) {
        // Store entire response object (has stats, typeStats, weeklyActivity, recentScans)
        setStats(data)
      } else {
        toast.error(data.message)
      }
    } catch (e) {
      toast.error(e.message)
    }
    setLoading(false)
  }

  // ---- INITIAL LOAD ----
  // Check auth on mount, then fetch stats
  useEffect(() => {
    // If no token, redirect to home (user not logged in)
    if (!token) {
      navigate('/')
      return
    }

    // User is logged in, fetch stats
    loadStats()
  }, [token])

  // ---- PREPARE CHART DATA ----
  // Transform backend data into formats that Recharts expects

  // Verdict pie chart data: Count of SCAM/SUSPICIOUS/SAFE
  // Only include verdicts with count > 0 (no empty slices)
  const verdictPieData = stats
    ? [
        { name: 'Scam', value: stats.stats.scams, color: '#ef4444' },
        { name: 'Suspicious', value: stats.stats.suspicious, color: '#f97316' },
        { name: 'Safe', value: stats.stats.safe, color: '#22c55e' }
      ].filter(d => d.value > 0)  // Remove zero-count verdicts
    : []

  // Weekly activity bar chart: Last 7 days scan count
  // d._id is "2026-06-05" format, we slice(5) to get "06-05" (MM-DD)
  const weeklyData = stats?.weeklyActivity.map(d => ({
    date: d._id.slice(5),  // "2026-06-05" → "06-05"
    scans: d.count
  })) || []

  // Scan type breakdown bar chart
  // Maps type abbreviations (d._id) to human labels (scanTypeLabels)
  const typeData = stats?.typeStats.map(d => ({
    name: scanTypeLabels[d._id] || d._id,  // e.g., "email" → "Email"
    count: d.count
  })) || []

  // ---- LOADING STATE ----
  // Show skeleton loaders while fetching stats
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* 4 skeleton cards for stat cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-[#1a1a1a] rounded-xl h-28 animate-pulse" />
          ))}
        </div>
        {/* 2 skeleton cards for charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#1a1a1a] rounded-xl h-64 animate-pulse" />
          <div className="bg-[#1a1a1a] rounded-xl h-64 animate-pulse" />
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">

      {/* ========== PAGE HEADER ========== */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Your scan overview and analytics</p>
      </div>

      {/* ========== SCAN SHORTCUT BUTTONS ========== */}
      {/* Quick access to start a new scan of each type */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-medium text-sm">Run a New Scan</h3>
        </div>

        {/* 6 buttons for each scan type */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {scanTypes.map((type) => (
            // Link to the specific scan page (e.g., /scan/email)
            <Link
              key={type.id}
              to={type.path}
              className="bg-[#1a1a1a] border border-white/10 hover:border-white/20 rounded-xl p-4 text-center transition-all hover:bg-[#222] group"
            >
              {/* Colored icon badge */}
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold mx-auto mb-2"
                style={{ backgroundColor: type.color + '20', color: type.color }}
              >
                {type.icon}  {/* e.g., "MSG", "EMAIL", "URL" */}
              </div>

              {/* Scan type label */}
              <p className="text-gray-400 text-xs group-hover:text-white transition-colors">
                {type.label}  {/* e.g., "Text / Message", "Email" */}
              </p>
            </Link>
          ))}
        </div>
      </div>

      {/* ========== STAT CARDS ========== */}
      {/* 4 cards showing key metrics: Total, Scams, Suspicious, Safe */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">

        {/* Total scans card */}
        <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-5">
          <p className="text-gray-500 text-xs mb-2">Total Scans</p>
          <p className="text-3xl font-bold text-white">{stats?.stats.total || 0}</p>
        </div>

        {/* Scams found card — red theme */}
        <div className="bg-[#1a1a1a] border border-red-500/20 rounded-xl p-5">
          <p className="text-gray-500 text-xs mb-2">Scams Found</p>
          <p className="text-3xl font-bold text-red-500">{stats?.stats.scams || 0}</p>
        </div>

        {/* Suspicious card — orange theme */}
        <div className="bg-[#1a1a1a] border border-orange-500/20 rounded-xl p-5">
          <p className="text-gray-500 text-xs mb-2">Suspicious</p>
          <p className="text-3xl font-bold text-orange-500">{stats?.stats.suspicious || 0}</p>
        </div>

        {/* Safe card — green theme */}
        <div className="bg-[#1a1a1a] border border-green-500/20 rounded-xl p-5">
          <p className="text-gray-500 text-xs mb-2">Safe</p>
          <p className="text-3xl font-bold text-green-500">{stats?.stats.safe || 0}</p>
        </div>

      </div>

      {/* ========== CHARTS ========== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">

        {/* ---- WEEKLY ACTIVITY CHART ----
            Bar chart showing scans per day for the last 7 days */}
        <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-5">
          <h3 className="text-white font-medium mb-4 text-sm">Weekly Activity</h3>

          {weeklyData.length > 0 ? (
            // Bar chart — ResponsiveContainer makes it responsive to window size
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={weeklyData}>
                {/* X-axis shows dates (MM-DD format) */}
                <XAxis dataKey="date" stroke="#555" tick={{ fill: '#888', fontSize: 11 }} />
                {/* Y-axis shows scan count — allowDecimals={false} shows whole numbers only */}
                <YAxis stroke="#555" tick={{ fill: '#888', fontSize: 11 }} allowDecimals={false} />
                {/* Tooltip shows on hover */}
                <Tooltip
                  contentStyle={{ background: '#222', border: '1px solid #333', borderRadius: 8 }}
                  labelStyle={{ color: '#fff' }}
                  itemStyle={{ color: '#3b82f6' }}
                />
                {/* Blue bars with rounded tops */}
                <Bar dataKey="scans" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            // Empty state if no scans this week
            <div className="h-48 flex items-center justify-center">
              <p className="text-gray-500 text-sm">No scans this week</p>
            </div>
          )}
        </div>

        {/* ---- VERDICT BREAKDOWN CHART ----
            Donut pie chart showing distribution of SCAM/SUSPICIOUS/SAFE */}
        <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-5">
          <h3 className="text-white font-medium mb-4 text-sm">Verdict Breakdown</h3>

          {verdictPieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={verdictPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}      // Creates donut hole
                  outerRadius={80}       // Outer radius of donut
                  dataKey="value"        // Use 'value' field for slice size
                  paddingAngle={3}       // Small gap between slices
                >
                  {/* Color each slice according to verdict type */}
                  {verdictPieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                {/* Legend showing what each color means */}
                <Legend
                  formatter={(value) => <span style={{ color: '#aaa', fontSize: 12 }}>{value}</span>}
                />
                {/* Tooltip on hover */}
                <Tooltip
                  contentStyle={{ background: '#222', border: '1px solid #333', borderRadius: 8 }}
                  labelStyle={{ color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            // Empty state if no scans yet
            <div className="h-48 flex items-center justify-center">
              <p className="text-gray-500 text-sm">No scans yet</p>
            </div>
          )}
        </div>

      </div>

      {/* ========== SCANS BY TYPE CHART ========== */}
      {/* Horizontal bar chart showing how many scans of each type */}
      {typeData.length > 0 && (
        <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-5 mb-8">
          <h3 className="text-white font-medium mb-4 text-sm">Scans by Type</h3>
          <ResponsiveContainer width="100%" height={180}>
            {/* layout="vertical" makes bars go left-to-right instead of bottom-to-top */}
            <BarChart data={typeData} layout="vertical">
              {/* X-axis (bottom) shows scan count */}
              <XAxis type="number" stroke="#555" tick={{ fill: '#888', fontSize: 11 }} allowDecimals={false} />
              {/* Y-axis (left) shows scan type names */}
              <YAxis dataKey="name" type="category" stroke="#555" tick={{ fill: '#888', fontSize: 11 }} width={100} />
              <Tooltip
                contentStyle={{ background: '#222', border: '1px solid #333', borderRadius: 8 }}
                labelStyle={{ color: '#fff' }}
                itemStyle={{ color: '#3b82f6' }}
              />
              {/* Blue bars with rounded right side */}
              <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* ========== RECENT SCANS ========== */}
      {/* List of user's 5 most recent scans with results */}
      {stats?.recentScans?.length > 0 && (
        <div className="mt-8">

          {/* Header with "View all" link to history page */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-medium text-sm">Recent Scans</h3>
            <Link to="/history" className="text-blue-400 hover:text-blue-300 text-xs transition-colors">
              View all
            </Link>
          </div>

          {/* Table-like layout of recent scans */}
          <div className="bg-[#1a1a1a] border border-white/10 rounded-xl overflow-hidden">
            {stats.recentScans.map((scan, i) => (
              // Button to open modal
              <button
                key={scan._id}
                onClick={() => handleOpenScan(scan._id)}
                className={`w-full flex items-center justify-between px-5 py-4 hover:bg-white/5 transition-colors text-left bg-transparent border-none cursor-pointer ${i < stats.recentScans.length - 1 ? 'border-b border-white/5' : ''}`}
              >

                {/* Left side: Type badge + Content preview */}
                <div className="flex items-center gap-3">
                  {/* Type badge (e.g., "email", "url") */}
                  <span className="text-xs bg-white/10 text-gray-400 px-2 py-1 rounded-md capitalize">
                    {scan.type}
                  </span>

                  {/* Content preview — shows first 50 chars, truncated with ... */}
                  <span className="text-gray-400 text-sm truncate max-w-60">
                    {scan.content?.slice(0, 50) || 'Image scan'}
                    {scan.content?.length > 50 ? '...' : ''}
                  </span>
                </div>

                {/* Right side: Verdict + Score */}
                <div className="flex items-center gap-3">
                  {/* Verdict badge with color from verdictConfig (green/orange/red) */}
                  <span className={`text-xs font-medium px-2 py-1 rounded-md ${verdictConfig[scan.verdict]?.bg} ${verdictConfig[scan.verdict]?.text}`}>
                    {scan.verdict}  {/* "SCAM", "SUSPICIOUS", or "SAFE" */}
                  </span>

                  {/* Score out of 100 */}
                  <span className="text-gray-500 text-xs">{scan.score}/100</span>
                </div>

              </button>
            ))}
          </div>

        </div>
      )}

      {/* ========== MODAL FOR RECENT SCANS ========== */}
      {selectedScanId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in"
          onClick={handleClosePanel}
        >
          <div
            className="bg-[#1a1a1a] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button at top */}
            <div className="sticky top-0 flex justify-end p-4 bg-[#1a1a1a]/95 border-b border-white/10">
              <button
                onClick={handleClosePanel}
                className="text-gray-500 hover:text-white text-2xl transition-colors"
              >
                ✕
              </button>
            </div>

            {/* ResultPanel with isModal={true} */}
            <ResultPanel
              scan={selectedScanDetails}
              loading={panelLoading}
              isModal={true}
              onClose={handleClosePanel}
            />
          </div>
        </div>
      )}

    </div>
  )
}

export default Dashboard
