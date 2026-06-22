// ============================================================
// Result.jsx — Displays detailed AI analysis of a single scan
// Route: /result/:id where :id is the MongoDB scan _id
// ============================================================

import { useContext, useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'
import { AppContext } from '../context/AppContext.jsx'
import ResultPanel from '../components/ResultPanel.jsx'
import { scanTypeLabels } from '../assets/assets.js'

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
      toast.error('Could not copy — please copy manually')
    }
  }

  return (
    <ResultPanel
      scan={scan}
      loading={loading}
      copied={copied}
      onCopyReport={copyReport}
      isModal={false}
    />
  )
}

export default Result
