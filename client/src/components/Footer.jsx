// ============================================================
// Footer.jsx — Bottom footer section shown on every page
// Displays branding, tagline, and credits
// ============================================================

import { Link } from 'react-router-dom'

const Footer = () => {
  return (
    // border-t adds a top border to separate footer from main content
    // mt-20 gives large margin on top
    <footer className="border-t border-gray-200 mt-20 px-6 py-8">

      {/* max-w-6xl max-width container for alignment with other page content
          flex with md:flex-row makes it horizontal on desktop, vertical on mobile
          items-center vertically centers items, justify-between spaces them apart */}
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">

        {/* ---- LOGO AND BRAND NAME ---- */}
        {/* Link to home page when clicked */}
        <Link to="/" className="flex items-center gap-2">
          {/* Square logo with gradient background */}
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
            {/* "S" initial inside the square */}
            <span className="text-white text-xs font-bold">S</span>
          </div>

          {/* Brand name */}
          <span className="text-gray-900 font-semibold">ScamShield</span>
        </Link>

        {/* ---- TAGLINE ---- */}
        {/* Short description of the app */}
        <p className="text-gray-600 text-sm">
          AI-powered scam and fraud detection. Stay safe online.
        </p>

        {/* ---- CREDITS ---- */}
        {/* Attribution to the AI model used */}
        <p className="text-gray-500 text-xs">
          Powered by Gemini AI
        </p>

      </div>
    </footer>
  )
}

export default Footer
