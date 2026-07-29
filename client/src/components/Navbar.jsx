// ============================================================
// Navbar.jsx - Top navigation bar shown on every page
// Displays logo, nav links, and user profile dropdown (if logged in)
// ============================================================

import { useContext, useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { AppContext } from '../context/AppContext.jsx'

const Navbar = () => {
  // Get auth state and functions from global context
  const { user, token, setShowLogin, setInitialAuthMode, logout } = useContext(AppContext)

  // Control dropdown visibility - true = dropdown is open, false = closed
  const [dropdownOpen, setDropdownOpen] = useState(false)

  // Ref to the dropdown div - used to detect clicks outside it
  const dropdownRef = useRef()

  // ---- Close dropdown when clicking outside ----
  // This runs when dropdownOpen changes to true
  useEffect(() => {
    if (!dropdownOpen) return // Don't attach listener if dropdown is closed

    const handler = (e) => {
      // e.target is the element clicked by the user
      // dropdownRef.current.contains() checks if the click was inside the dropdown
      // If click was OUTSIDE, close the dropdown
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }

    // Attach listener to document for all mousedown events (all clicks)
    document.addEventListener('mousedown', handler)

    // Cleanup: remove listener when component unmounts or dropdownOpen changes
    // Important: prevents memory leaks and duplicate listeners
    return () => document.removeEventListener('mousedown', handler)
  }, [dropdownOpen])

  return (
    // sticky top-0 keeps navbar at top while scrolling
    // z-40 ensures navbar stays above other content
    // bg-[#0f0f0f]/90 is dark background with 90% opacity
    // backdrop-blur-sm adds a frosted glass blur effect
    <nav className="flex items-center justify-between px-6 py-4 border-b border-white/10 sticky top-0 z-40 bg-[#0f0f0f]/90 backdrop-blur-sm">

      {/* Logo and brand name - links to home page */}
      <Link to="/" className="flex items-center gap-3">
        {/* SVG shield icon with gradient fill */}
        <svg width="36" height="36" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
          <defs>
            {/* Linear gradient from blue #3b82f6 to darker blue #1d4ed8 */}
            <linearGradient id="ng" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6"/>
              <stop offset="100%" stopColor="#1d4ed8"/>
            </linearGradient>
          </defs>
          {/* Shield shape */}
          <path d="M16 2 L28 7 L28 17 C28 23 22 28 16 30 C10 28 4 23 4 17 L4 7 Z" fill="url(#ng)"/>
          {/* "S" text in center of shield */}
          <text x="16" y="21" fontFamily="Inter, Arial, sans-serif" fontSize="13" fontWeight="700" fill="white" textAnchor="middle">S</text>
        </svg>

        {/* Brand text */}
        <div>
          <span className="text-white font-bold text-xl">ScamShield</span>
          <p className="text-gray-500 text-xs leading-none mt-0.5">AI Scam Detection</p>
        </div>
      </Link>

      {/* ---- RIGHT SIDE: Conditional rendering based on login state ---- */}

      {token ? (
        // USER IS LOGGED IN - show Dashboard, History, and Profile dropdown
        <div className="flex items-center gap-6">

          {/* Dashboard link */}
          <Link to="/dashboard" className="text-gray-400 hover:text-white text-sm transition-colors">
            Dashboard
          </Link>

          {/* History link */}
          <Link to="/history" className="text-gray-400 hover:text-white text-sm transition-colors">
            History
          </Link>

          {/* Profile dropdown button and menu */}
          {/* ref={dropdownRef} connects this div to the useEffect above for outside-click detection */}
          <div className="relative" ref={dropdownRef}>

            {/* Dropdown toggle button - shows user's first initial and name */}
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/15 px-3 py-2 rounded-lg transition-colors"
            >
              {/* Avatar circle with user's first initial */}
              <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                <span className="text-white text-xs font-semibold">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                  {/* charAt(0) gets first letter; .toUpperCase() makes it capital; || 'U' fallback if no name */}
                </span>
              </div>
              {/* User's first name */}
              <span className="text-white text-sm">{user?.name || 'User'}</span>
            </button>

            {/* Dropdown menu - only rendered if dropdownOpen is true */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-44 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-xl">

                {/* Profile link */}
                <Link
                  to="/profile"
                  onClick={() => setDropdownOpen(false)} // Close dropdown after navigation
                  className="block px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-t-xl transition-colors"
                >
                  Profile
                </Link>

                {/* Logout button */}
                <button
                  onClick={() => { logout(); setDropdownOpen(false) }} // Call logout AND close dropdown
                  className="block w-full text-left px-4 py-3 text-sm text-red-400 hover:text-red-300 hover:bg-white/5 rounded-b-xl transition-colors"
                >
                  Logout
                </button>
              </div>
            )}

          </div>
        </div>
      ) : (
        // USER IS NOT LOGGED IN - show Login and Get Started buttons
        <div className="flex items-center gap-3">

          {/* Login link - opens login modal in Login mode */}
          <button
            onClick={() => {
              setInitialAuthMode('Login')
              setShowLogin(true)
            }}
            className="text-gray-400 hover:text-white text-sm transition-colors"
          >
            Login
          </button>

          {/* Get Started button - opens login modal in Register mode */}
          <button
            onClick={() => {
              setInitialAuthMode('Register')
              setShowLogin(true)
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg transition-colors"
          >
            Get Started
          </button>

        </div>
      )}

    </nav>
  )
}

export default Navbar
