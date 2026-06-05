// ============================================================
// ScanUrl.jsx — Scan page for URLs
// Uses both Gemini AI and VirusTotal for dual-source analysis
// Backend submits URL to VirusTotal, waits 3 seconds, fetches results, then passes to Gemini
// ============================================================

import { useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext.jsx'

const ScanUrl = () => {
  // Get submit function and loading state from global context
  const { submitTextScan, scanLoading } = useContext(AppContext)

  // Input field for URL — single line input instead of textarea
  const [url, setUrl] = useState('')

  // Navigation hook
  const navigate = useNavigate()

  // Form submission handler
  const onSubmitHandler = async (e) => {
    e.preventDefault()
    if (!url.trim()) return

    // Submit with type 'url' — backend does VirusTotal + Gemini analysis
    await submitTextScan('url', url)
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">

      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-500 hover:text-white text-sm mb-6 transition-colors"
      >
        ← Back
      </button>

      {/* Page header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          {/* Yellow icon badge for URL */}
          <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center">
            <span className="text-yellow-400 text-xs font-bold">URL</span>
          </div>

          <h1 className="text-2xl font-bold text-white">Analyze URL / Link</h1>
        </div>

        <p className="text-gray-500 text-sm">
          Paste any suspicious link to check if it's malicious or a phishing site
        </p>
      </div>

      {/* ---- INFO BOX ----
          Explains that URL scans use dual analysis (Gemini + VirusTotal)
          Yellow warning style since URL scanning is the most thorough */}
      <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-4 mb-6 flex items-start gap-3">
        {/* Warning icon circle */}
        <div className="w-5 h-5 rounded-full bg-yellow-500/20 flex items-center justify-center shrink-0 mt-0.5">
          <span className="text-yellow-400 text-xs">!</span>
        </div>

        {/* Info text */}
        <div>
          <p className="text-yellow-400 text-xs font-medium mb-1">Dual AI Analysis</p>
          <p className="text-gray-500 text-xs">
            URL scans use both Gemini AI and VirusTotal (90+ security engines) for maximum accuracy.
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={onSubmitHandler}>

        {/* ---- URL INPUT ----
            Text input instead of textarea since URLs are single-line
            Has a clear (✕) button that appears when input has content */}
        <div className="bg-[#1a1a1a] border border-white/10 rounded-xl flex items-center gap-3 px-4 mb-4 focus-within:border-yellow-500/50 transition-colors">
          {/* Input field */}
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://suspicious-link.com/path"
            className="flex-1 bg-transparent py-4 text-white placeholder-gray-600 text-sm focus:outline-none"
          />

          {/* Clear button — only shows when there's text in the input */}
          {url && (
            <button
              type="button"
              onClick={() => setUrl('')}
              // Clears the input field
              className="text-gray-600 hover:text-gray-400 text-sm transition-colors"
            >
              ✕
            </button>
          )}
        </div>

        {/* Try example button — separate element, not in the input box */}
        <button
          type="button"
          onClick={() => setUrl('http://sbi-secure-login.xyz/verify')}
          // Shows a sample phishing URL
          className="text-yellow-400 hover:text-yellow-300 text-xs mb-4 transition-colors block"
        >
          Try an example
        </button>

        {/* Submit button — yellow theme for URL */}
        <button
          type="submit"
          disabled={scanLoading || !url.trim()}
          className="w-full bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-800/50 disabled:cursor-not-allowed text-white py-3.5 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
        >
          {scanLoading ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Scanning URL...
            </>
          ) : (
            'Check URL'
          )}
        </button>
      </form>

      {/* Important note about scan time and safety */}
      <div className="mt-6 bg-white/5 rounded-xl p-4">
        <p className="text-gray-500 text-xs leading-relaxed">
          <span className="text-gray-400 font-medium">Note: </span>
          URL scans may take 5-10 seconds due to VirusTotal analysis. Do not visit the URL before scanning.
        </p>
      </div>

    </div>
  )
}

export default ScanUrl
