// ============================================================
// ScanText.jsx - Scan page for text messages (SMS, WhatsApp)
// User pastes text → backend analyzes with Gemini → shows result
// ============================================================

import { useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext.jsx'
import { exampleContent } from '../assets/assets.js'

const ScanText = () => {
  // Get the submit function and loading state from global context
  const { submitTextScan, scanLoading } = useContext(AppContext)

  // Textarea controlled component - React manages the text value
  const [content, setContent] = useState('')

  // useNavigate hook to programmatically navigate (e.g., back button)
  const navigate = useNavigate()

  // Form submission handler
  const onSubmitHandler = async (e) => {
    e.preventDefault()
    // Trim and check that user actually entered something
    if (!content.trim()) return

    // Call the global submit function with scan type 'text'
    // 'text' tells the backend to analyze this as a text message
    // submitTextScan handles the API call and navigation to result page
    await submitTextScan('text', content)
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">

      {/* ---- BACK BUTTON ---- */}
      {/* navigate(-1) goes back one page in browser history */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-500 hover:text-white text-sm mb-6 transition-colors"
      >
        ← Back
      </button>

      {/* ---- PAGE HEADER ---- */}
      <div className="mb-8">

        {/* Icon + title row */}
        <div className="flex items-center gap-3 mb-3">
          {/* Colored badge with "MSG" icon */}
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
            <span className="text-blue-400 text-xs font-bold">MSG</span>
          </div>

          {/* Page title */}
          <h1 className="text-2xl font-bold text-white">Analyze Text / Message</h1>
        </div>

        {/* Subtitle explaining what to paste */}
        <p className="text-gray-500 text-sm">
          Paste any suspicious WhatsApp message, SMS, or text to check if it's a scam
        </p>
      </div>

      {/* ---- FORM ---- */}
      <form onSubmit={onSubmitHandler}>

        {/* ---- TEXT AREA WITH FOOTER ---- */}
        {/* Border container with the textarea inside */}
        <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-1 mb-4">

          {/* ---- TEXTAREA ---- */}
          {/* Controlled input - value and onChange tie to React state */}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            // Update state as user types
            placeholder="Paste the suspicious message here..."
            rows={10}  // Default height of textarea (can be resized by user)
            className="w-full bg-transparent px-4 py-3 text-white placeholder-gray-600 text-sm resize-none focus:outline-none"
          />

          {/* ---- FOOTER WITH CHARACTER COUNT AND EXAMPLE BUTTON ---- */}
          <div className="flex items-center justify-between px-4 pb-3">

            {/* Character count display */}
            <span className="text-gray-600 text-xs">
              {content.length} characters
            </span>

            {/* "Try an example" button - pre-fills textarea with a sample scam message */}
            <button
              type="button"
              // onClick doesn't trigger form submission (type="button" prevents that)
              // Sets textarea to a pre-written scam sample from assets
              onClick={() => setContent(exampleContent.text)}
              className="text-blue-400 hover:text-blue-300 text-xs transition-colors"
            >
              Try an example
            </button>

          </div>
        </div>

        {/* ---- SUBMIT BUTTON ---- */}
        {/* disabled if: scanLoading is true OR textarea is empty */}
        <button
          type="submit"
          disabled={scanLoading || !content.trim()}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800/50 disabled:cursor-not-allowed text-white py-3.5 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
        >
          {scanLoading ? (
            // While request is in progress: show spinner and "Analyzing..."
            <>
              {/* Spinning circle loader */}
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Analyzing...
            </>
          ) : (
            // Normal state: show "Analyze Message" button text
            'Analyze Message'
          )}
        </button>
      </form>

      {/* ---- HELPFUL TIP ---- */}
      {/* Information box below the form giving usage advice */}
      <div className="mt-6 bg-white/5 rounded-xl p-4">
        <p className="text-gray-500 text-xs leading-relaxed">
          <span className="text-gray-400 font-medium">Tip: </span>
          Include the full message as received - the more context, the more accurate the analysis.
        </p>
      </div>

    </div>
  )
}

export default ScanText
