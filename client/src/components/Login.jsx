// ============================================================
// Login.jsx — Modal for user authentication (Login + Register)
// Appears as a modal overlay when user clicks Login or Get Started
// ============================================================

import { useContext, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { AppContext } from '../context/AppContext.jsx'

const Login = () => {
  // Toggle between 'Login' and 'Register' modes
  const [state, setState] = useState('Login')

  // Form field states — controlled components, React manages their values
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // Prevent double-submit — disabled button while request is pending
  const [loading, setLoading] = useState(false)

  // Get functions to update global auth state after successful login/register
  const { setUser, setShowLogin, setToken, backendUrl } = useContext(AppContext)

  // Form submission handler — runs on Register or Login button click
  const onSubmitHandler = async (e) => {
    e.preventDefault()
    // e.preventDefault() stops page reload that form submission normally causes

    // Validate password length ONLY for register (login doesn't need this check server-side)
    if (state === 'Register' && password.length < 6) {
      return toast.error('Password must be at least 6 characters')
    }

    setLoading(true) // Disable button and show spinner
    try {
      if (state === 'Login') {
        // ---- LOGIN API CALL ----
        const { data } = await axios.post(backendUrl + '/api/user/login', { email, password })

        if (data.success) {
          // Save token to localStorage so it persists across page reloads
          localStorage.setItem('token', data.token)

          // Update global state — triggers loadUserData via useEffect in AppContext
          setToken(data.token)
          setUser(data.user)

          // Close the login modal
          setShowLogin(false)

          // Scroll to top smoothly — better UX on mobile
          window.scrollTo({ top: 0, behavior: 'smooth' })

          // Show success toast notification
          toast.success(data.message)
        } else {
          // Server returned success: false — display error message from server
          toast.error(data.message)
        }

      } else {
        // ---- REGISTER API CALL ----
        const { data } = await axios.post(backendUrl + '/api/user/register', { name, email, password })

        if (data.success) {
          // Same flow as login — save token, update state, close modal, show success
          localStorage.setItem('token', data.token)
          setToken(data.token)
          setUser(data.user)
          setShowLogin(false)
          window.scrollTo({ top: 0, behavior: 'smooth' })
          toast.success(data.message)
        } else {
          toast.error(data.message)
        }
      }

    } catch (e) {
      // Network error or JSON parsing error — display to user
      toast.error(e.message)

    } finally {
      // ALWAYS runs after try/catch — whether success or failure
      // Disable loading state and re-enable button
      setLoading(false)
    }
  }

  return (
    // ---- MODAL OVERLAY ----
    // fixed inset-0 stretches to fill entire screen
    // z-50 makes sure modal appears above all other content
    // bg-black/70 is dark semi-transparent background
    // onClick={() => setShowLogin(false)} closes modal when clicking outside it
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={() => setShowLogin(false)}
    >
      {/* ---- MODAL CARD ----
          onClick={(e) => e.stopPropagation() prevents closing when clicking inside the modal
          Only the outer overlay should close on click */}
      <div
        className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-8 w-full max-w-md mx-4 animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >

        {/* ---- HEADER ----
            Displays title and close button */}
        <div className="flex items-center justify-between mb-6">
          <div>
            {/* Title changes based on Login vs Register mode */}
            <h2 className="text-white text-2xl font-bold">
              {state === 'Login' ? 'Welcome back' : 'Create account'}
            </h2>

            {/* Subtitle changes based on mode */}
            <p className="text-gray-500 text-sm mt-1">
              {state === 'Login' ? 'Sign in to your ScamShield account' : 'Start detecting scams for free'}
            </p>
          </div>

          {/* Close button (X) — closes modal */}
          <button
            onClick={() => setShowLogin(false)}
            className="text-gray-500 hover:text-white text-xl transition-colors"
          >
            ✕
          </button>
        </div>

        {/* ---- FORM ----
            onSubmit runs onSubmitHandler when user clicks submit button
            Controlled inputs: value is tied to state */}
        <form onSubmit={onSubmitHandler} className="flex flex-col gap-4">

          {/* ---- NAME FIELD (Register only) ----
              This input only appears when state is 'Register' */}
          {state === 'Register' && (
            <input
              type="text"
              placeholder="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              // onChange updates the name state as user types
              required
              // HTML5 validation — form won't submit if empty
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-blue-500 transition-colors"
            />
          )}

          {/* ---- EMAIL FIELD ----
              Always visible in both Login and Register modes */}
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-blue-500 transition-colors"
          />

          {/* ---- PASSWORD FIELD ----
              minLength={6} enforces minimum 6 characters in HTML
              type="password" hides characters with dots */}
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-blue-500 transition-colors"
          />

          {/* ---- SUBMIT BUTTON ----
              disabled={loading} prevents double-submit and shows user request is in progress
              flex items-center justify-center gap-2 centers spinner and text */}
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-70 disabled:cursor-not-allowed text-white py-3 rounded-xl font-medium transition-colors mt-1 flex items-center justify-center gap-2"
          >
            {loading ? (
              // Show spinner and "Please wait..." while request is pending
              <>
                {/* Spinning circle loader — w-4 h-4 makes it small */}
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Please wait...
              </>
            ) : (
              // Show normal button text when not loading
              state === 'Login' ? 'Sign In' : 'Create Account'
            )}
          </button>
        </form>

        {/* ---- TOGGLE LOGIN/REGISTER ----
            Text link to switch between modes */}
        <p className="text-gray-500 text-sm text-center mt-5">
          {state === 'Login' ? "Don't have an account? " : 'Already have an account? '}
          {/* Clickable link to toggle between modes */}
          <span
            onClick={() => setState(state === 'Login' ? 'Register' : 'Login')}
            className="text-blue-400 hover:text-blue-300 cursor-pointer transition-colors"
          >
            {state === 'Login' ? 'Sign Up' : 'Sign In'}
          </span>
        </p>

      </div>
    </div>
  )
}

export default Login
