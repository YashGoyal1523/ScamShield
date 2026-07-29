// ============================================================
// ScanEmail.jsx - Scan page for emails
// Detects phishing, spoofed senders, malicious links
// Similar to ScanText but sends type 'email' with email-specific analysis
// ============================================================

import { useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext.jsx'
import { exampleContent } from '../assets/assets.js'

const ScanEmail = () => {
  // Get submit function and loading state from global context
  const { submitTextScan, scanLoading } = useContext(AppContext)

  // Textarea for user to paste email body
  const [content, setContent] = useState('')

  // Navigation hook
  const navigate = useNavigate()

  // Form submission handler
  const onSubmitHandler = async (e) => {
    e.preventDefault()
    if (!content.trim()) return

    // Submit with type 'email' - backend analyzes for phishing, spoofing, malicious links
    await submitTextScan('email', content)
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
          {/* Purple icon badge for email */}
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
            <span className="text-purple-400 text-xs font-bold">MAIL</span>
          </div>

          <h1 className="text-2xl font-bold text-white">Analyze Email</h1>
        </div>

        <p className="text-gray-500 text-sm">
          Paste the full email body to detect phishing, spoofing, or malicious content
        </p>
      </div>

      {/* Form */}
      <form onSubmit={onSubmitHandler}>
        <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-1 mb-4">

          {/* Textarea for email content */}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            // Helpful placeholder showing what to include
            placeholder={`Paste the email here, including:\n- From: sender@domain.com\n- Subject: ...\n- Body of the email`}
            rows={12}  // Taller than text messages - emails are longer
            className="w-full bg-transparent px-4 py-3 text-white placeholder-gray-600 text-sm resize-none focus:outline-none"
          />

          {/* Footer with character count and example button */}
          <div className="flex items-center justify-between px-4 pb-3">
            <span className="text-gray-600 text-xs">{content.length} characters</span>

            {/* Try example button - shows a sample phishing email */}
            <button
              type="button"
              onClick={() => setContent(exampleContent.email)}
              className="text-purple-400 hover:text-purple-300 text-xs transition-colors"
            >
              Try an example
            </button>
          </div>
        </div>

        {/* Submit button - purple theme for email */}
        <button
          type="submit"
          disabled={scanLoading || !content.trim()}
          className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800/50 disabled:cursor-not-allowed text-white py-3.5 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
        >
          {scanLoading ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Analyzing...
            </>
          ) : (
            'Analyze Email'
          )}
        </button>
      </form>

      {/* Helpful tip */}
      <div className="mt-6 bg-white/5 rounded-xl p-4">
        <p className="text-gray-500 text-xs leading-relaxed">
          <span className="text-gray-400 font-medium">Tip: </span>
          Include the sender address and subject line for better detection of spoofed senders.
        </p>
      </div>

    </div>
  )
}

export default ScanEmail
