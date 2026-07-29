// ============================================================
// Result.jsx - Displays detailed AI analysis of a single scan
// Route: /result/:id where :id is the MongoDB scan _id
// ============================================================

import { useContext, useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'
import { AppContext } from '../context/AppContext.jsx'
import ResultPanel from '../components/ResultPanel.jsx'
import { scanTypeLabels, scanTypes } from '../assets/assets.js'

const Result = () => {
  const { id } = useParams()
  const { token, backendUrl, setShowLogin } = useContext(AppContext)
  const [scan, setScan] = useState(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const navigate = useNavigate()

  // Fetch scan data
  const loadScan = async () => {
    try {
      const { data } = await axios.get(backendUrl + `/api/scan/${id}`, { headers: { token } })
      if (data.success) {
        setScan(data.scan)
      } else {
        toast.error(data.message)
        navigate('/dashboard')
      }
    } catch (e) {
      toast.error(e.message)
    }
    setLoading(false)
  }

  // Auth check and load
  useEffect(() => {
    if (!token) {
      setShowLogin(true)
      navigate('/')
      return
    }
    loadScan()
  }, [token, id])

  // Copy report to clipboard
  const copyReport = async () => {
    if (!scan) return

    const report = `ScamShield Analysis Report
---
Type: ${scanTypeLabels[scan.type]}
Verdict: ${scan.verdict}
Score: ${scan.score}/100
Date: ${new Date(scan.createdAt).toLocaleString()}

Analysis:
${scan.explanation}

Red Flags:
${scan.redFlags.map((f, i) => `${i + 1}. ${f.flag}: ${f.explanation}`).join('\n')}

Safety Suggestions:
${scan.suggestions.map((s, i) => `${i + 1}. ${s}`).join('\n')}`

    try {
      await navigator.clipboard.writeText(report)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      toast.success('Report copied to clipboard')
    } catch {
      toast.error('Could not copy - please copy manually')
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <ResultPanel scan={scan} loading={loading} />

      {/* ========== ACTION BUTTONS ========== */}
      {!loading && scan && (
        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          {/* COPY REPORT */}
          <button
            onClick={copyReport}
            className="flex-1 bg-white/10 hover:bg-white/15 text-white py-3 rounded-xl font-medium text-sm transition-colors"
          >
            {copied ? 'Copied!' : 'Copy Report'}
          </button>

          {/* SCAN AGAIN */}
          <Link
            to={scanTypes.find(t => t.id === scan.type)?.path || '/dashboard'}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-medium text-sm transition-colors text-center"
          >
            Scan Again
          </Link>

          {/* NEW SCAN */}
          <Link
            to="/dashboard"
            className="flex-1 bg-white/10 hover:bg-white/15 text-white py-3 rounded-xl font-medium text-sm transition-colors text-center"
          >
            New Scan
          </Link>

          {/* VIEW HISTORY */}
          <Link
            to="/history"
            className="flex-1 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white py-3 rounded-xl font-medium text-sm transition-colors text-center border border-white/10"
          >
            View History
          </Link>
        </div>
      )}
    </div>
  )
}

export default Result
