// ============================================================
// ResultPanel.jsx — Displays scan analysis results
// Used in both Result page and History modal
// isModal={true} → hides buttons, shows close at top
// isModal={false} → shows buttons at bottom
// ============================================================

import { useEffect, useState } from 'react'
import ScamMeter from './ScamMeter.jsx'
import { verdictConfig, scanTypeLabels } from '../assets/assets.js'

const ResultPanel = ({ scan, loading = false }) => {
  const [expandedFlags, setExpandedFlags] = useState({})

  const toggleFlag = (i) => {
    setExpandedFlags(prev => ({ ...prev, [i]: !prev[i] }))
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="bg-[#1a1a1a] rounded-2xl h-60 animate-pulse mb-6" />
        <div className="bg-[#1a1a1a] rounded-2xl h-40 animate-pulse mb-4" />
        <div className="bg-[#1a1a1a] rounded-2xl h-40 animate-pulse" />
      </div>
    )
  }

  if (!scan) return null

  const verdict = verdictConfig[scan.verdict]

  return (
    <div className="p-6">

      {/* ========== VERDICT BANNER ========== */}
      <div className={`rounded-2xl p-6 mb-6 border ${verdict.bg} ${verdict.border}`}>
        <div className="flex items-center justify-between gap-4 flex-wrap sm:flex-nowrap">
          <div>
            <p className="text-gray-500 text-xs mb-1 uppercase tracking-wider">
              {scanTypeLabels[scan.type]} Analysis
            </p>
            <h1 className={`text-3xl font-bold ${verdict.text}`}>
              {verdict.label}
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              {new Date(scan.createdAt).toLocaleString()}
            </p>
          </div>
          <div className="w-full sm:w-auto flex justify-center sm:justify-end">
            <ScamMeter score={scan.score} />
          </div>
        </div>
      </div>

      {/* ========== AI EXPLANATION ========== */}
      <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 mb-4">
        <h2 className="text-white font-semibold mb-3 text-sm uppercase tracking-wider">AI Analysis</h2>
        <p className="text-gray-300 text-sm leading-relaxed">{scan.explanation}</p>
      </div>

      {/* ========== SCANNED CONTENT ========== */}
      {scan.content && (
        <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 mb-4">
          <h2 className="text-white font-semibold mb-3 text-sm uppercase tracking-wider">Scanned Content</h2>
          <p className="text-gray-400 text-sm leading-relaxed whitespace-pre-wrap font-mono bg-black/30 rounded-xl p-4">
            {scan.content}
          </p>
        </div>
      )}

      {/* ========== RED FLAGS ========== */}
      {scan.redFlags?.length > 0 && (
        <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 mb-4">
          <h2 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
            Red Flags
            <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${verdict.bg} ${verdict.text}`}>
              {scan.redFlags.length} found
            </span>
          </h2>
          <div className="flex flex-col gap-3">
            {scan.redFlags.map((flag, i) => (
              <div key={i} className="border border-red-500/20 rounded-xl overflow-hidden">
                <button
                  onClick={() => toggleFlag(i)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-red-500/5 hover:bg-red-500/10 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-5 h-5 rounded-full bg-red-500/20 text-red-400 text-xs flex items-center justify-center shrink-0 font-bold">
                      {i + 1}
                    </span>
                    <span className="text-red-400 text-sm font-medium">{flag.flag}</span>
                  </div>
                  <span className="text-gray-600 text-xs">
                    {expandedFlags[i] ? '▲' : '▼'}
                  </span>
                </button>
                {expandedFlags[i] && (
                  <div className="px-4 py-3 bg-black/20">
                    <p className="text-gray-400 text-sm leading-relaxed">{flag.explanation}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========== SAFETY SUGGESTIONS ========== */}
      {scan.suggestions?.length > 0 && (
        <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 mb-6">
          <h2 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Safety Suggestions</h2>
          <div className="flex flex-col gap-3">
            {scan.suggestions.map((suggestion, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-green-400 text-xs">✓</span>
                </div>
                <p className="text-gray-300 text-sm leading-relaxed">{suggestion}</p>
              </div>
            ))}
          </div>
        </div>
      )}


    </div>
  )
}

export default ResultPanel
