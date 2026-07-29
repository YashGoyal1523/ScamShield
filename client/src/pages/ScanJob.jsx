// ============================================================
// ScanJob.jsx - Scan page for job postings
// Detects fake recruitment scams, upfront fee demands, unrealistic promises
// Similar to ScanText but sends type 'job' with job-specific analysis
// ============================================================

import { useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext.jsx'
import { exampleContent } from '../assets/assets.js'

const ScanJob = () => {
  // Get submit function and loading state from global context
  const { submitTextScan, scanLoading } = useContext(AppContext)

  // Textarea for user to paste job posting
  const [content, setContent] = useState('')

  // Navigation hook
  const navigate = useNavigate()

  // Form submission handler
  const onSubmitHandler = async (e) => {
    e.preventDefault()
    if (!content.trim()) return

    // Submit with type 'job' - backend analyzes for fake recruitment patterns
    await submitTextScan('job', content)
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
          {/* Orange icon badge for job */}
          <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
            <span className="text-orange-400 text-xs font-bold">JOB</span>
          </div>

          <h1 className="text-2xl font-bold text-white">Analyze Job Post</h1>
        </div>

        <p className="text-gray-500 text-sm">
          Paste any job description or offer to detect fake recruitment scams
        </p>
      </div>

      {/* Form */}
      <form onSubmit={onSubmitHandler}>
        <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-1 mb-4">

          {/* Textarea for job posting */}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Paste the job posting here - include salary, requirements, company name, and contact details..."
            rows={12}
            className="w-full bg-transparent px-4 py-3 text-white placeholder-gray-600 text-sm resize-none focus:outline-none"
          />

          {/* Footer with character count and example button */}
          <div className="flex items-center justify-between px-4 pb-3">
            <span className="text-gray-600 text-xs">{content.length} characters</span>

            {/* Try example button - shows a sample fake job scam */}
            <button
              type="button"
              onClick={() => setContent(exampleContent.job)}
              className="text-orange-400 hover:text-orange-300 text-xs transition-colors"
            >
              Try an example
            </button>
          </div>
        </div>

        {/* Submit button - orange theme for job */}
        <button
          type="submit"
          disabled={scanLoading || !content.trim()}
          className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-orange-800/50 disabled:cursor-not-allowed text-white py-3.5 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
        >
          {scanLoading ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Analyzing...
            </>
          ) : (
            'Analyze Job Post'
          )}
        </button>
      </form>

      {/* Common red flags info */}
      <div className="mt-6 bg-white/5 rounded-xl p-4">
        <p className="text-gray-500 text-xs leading-relaxed">
          <span className="text-gray-400 font-medium">Common red flags: </span>
          Upfront registration fees, unrealistic salary, no interview required, vague job role, personal UPI payment requests.
        </p>
      </div>

    </div>
  )
}

export default ScanJob
