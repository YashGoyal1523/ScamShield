// ============================================================
// ResultPanel.jsx — Reusable scan result display component
// Shows verdict, score, red flags, suggestions, and analysis
// Used in both Result page and History modal
// ============================================================

import { verdictConfig } from '../assets/assets.js'

const ResultPanel = ({ scan, loading = false }) => {
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="bg-white/5 rounded-xl h-20 animate-pulse" />
        <div className="bg-white/5 rounded-xl h-40 animate-pulse" />
      </div>
    )
  }

  if (!scan) {
    return <p className="text-gray-600 text-center py-8">Failed to load scan details</p>
  }

  return (
    <div className="space-y-6">

      {/* Verdict badge + Score */}
      <div className="flex items-center gap-4">
        <span className={`text-lg font-medium px-4 py-2 rounded-lg ${verdictConfig[scan.verdict]?.bg} ${verdictConfig[scan.verdict]?.text}`}>
          {scan.verdict}
        </span>
        <div className="flex-1">
          <p className="text-gray-500 text-sm">Scam Score</p>
          <p className="text-3xl font-bold" style={{color: scan.score > 60 ? '#ef4444' : scan.score > 30 ? '#f97316' : '#22c55e'}}>
            {scan.score}/100
          </p>
        </div>
      </div>

      {/* Explanation */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-4">
        <p className="text-gray-500 text-xs uppercase mb-2">Analysis</p>
        <p className="text-gray-300 text-sm leading-relaxed">
          {scan.explanation}
        </p>
      </div>

      {/* Red flags */}
      {scan.redFlags && scan.redFlags.length > 0 && (
        <div>
          <p className="text-gray-500 text-xs uppercase mb-3">🚩 Red Flags</p>
          <div className="space-y-2">
            {scan.redFlags.map((flag, i) => (
              <div key={i} className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                <p className="text-red-400 text-sm font-medium">{flag.flag}</p>
                <p className="text-gray-400 text-xs mt-1">{flag.explanation}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Suggestions */}
      {scan.suggestions && scan.suggestions.length > 0 && (
        <div>
          <p className="text-gray-500 text-xs uppercase mb-3">💡 Suggestions</p>
          <div className="space-y-2">
            {scan.suggestions.map((suggestion, i) => (
              <div key={i} className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                <p className="text-blue-400 text-sm">{suggestion}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Scan info */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-xs text-gray-500">
        <p>Type: <span className="text-gray-400 capitalize">{scan.type}</span></p>
        <p className="mt-2">Date: <span className="text-gray-400">{new Date(scan.createdAt).toLocaleString()}</span></p>
      </div>

    </div>
  )
}

export default ResultPanel
