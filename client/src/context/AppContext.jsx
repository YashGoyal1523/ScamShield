// ============================================================
// AppContext.jsx - Global state management for the entire app
// Stores authentication, user data, and provides scan submission functions
// Wrapped around entire app in main.jsx
// ============================================================

import { createContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'

// Create the context object that components will useContext() to access
export const AppContext = createContext()

export default function AppContextProvider({ children }) {
  // ---- AUTHENTICATION STATE ----
  const [user, setUser] = useState(null)
  // Contains logged-in user's data: { name, email, createdAt }
  // null when logged out

  const [showLogin, setShowLogin] = useState(false)
  // Controls whether Login modal is visible
  // Set to true when user clicks Login button without token

  const [token, setToken] = useState(localStorage.getItem('token'))
  // JWT token from /api/user/login or /api/user/register
  // Retrieved from localStorage on page load (so user stays logged in across sessions)
  // Sent in headers for all authenticated API calls

  const [scanLoading, setScanLoading] = useState(false)
  // true while a scan API call is in progress
  // Used to disable buttons and show spinner during scan submission

  const [initialAuthMode, setInitialAuthMode] = useState('Login')
  // Tells Login modal whether to start in 'Login' or 'Register' mode
  // Set by Navbar: Login button sets to 'Login', Get Started sets to 'Register'

  // Backend URL from environment variable (client/.env has VITE_BACKEND_URL)
  const backendUrl = import.meta.env.VITE_BACKEND_URL

  // useNavigate hook for programmatic navigation after API calls
  const navigate = useNavigate()

  // ========== LOAD USER DATA ==========
  // Fetches user profile from backend to restore user state after page reload
  // Called automatically whenever token changes
  // If token is expired/invalid, clears auth state silently
  const loadUserData = async () => {
    try {
      // GET /api/user/profile - backend verifies JWT and returns user data
      const { data } = await axios.get(
        backendUrl + '/api/user/profile',
        { headers: { token } }
      )

      if (data.success) {
        // Token is valid - store user data in state
        setUser(data.user)
      } else {
        // Backend returned success: false (shouldn't happen for profile endpoint)
        // Clear auth state as a precaution
        localStorage.removeItem('token')
        setToken('')
        setUser(null)
      }
    } catch (e) {
      // Network error or token verification failed
      // Backend returns 401 if token is expired/invalid
      // silently clear auth state - no need to spam user with error message
      localStorage.removeItem('token')
      setToken('')
      setUser(null)
    }
  }

  // ========== LOGOUT ==========
  // Clears all auth state and redirects to home page
  const logout = () => {
    // Remove token from localStorage so it doesn't auto-restore on page reload
    localStorage.removeItem('token')

    // Clear global auth state
    setToken('')
    setUser(null)

    // Navigate to home page
    navigate('/')

    // Show success message
    toast.success('Logged out successfully')
  }

  // ========== SUBMIT TEXT SCAN ==========
  // Submits text-based scan (text, email, job, url) to backend
  // Backend analyzes content and returns verdict + red flags + suggestions
  // On success, navigates to /result/:id to show the analysis
  const submitTextScan = async (type, content) => {
    // Check if user is logged in
    if (!token) {
      // Not logged in - show login modal instead of trying API call
      setShowLogin(true)
      return
    }

    // Set loading state to disable button and show spinner
    setScanLoading(true)

    try {
      // POST to /api/scan/{text|email|job|url}
      // Backend receives type in the route path, content in request body
      const { data } = await axios.post(
        backendUrl + `/api/scan/${type}`,
        { content },
        { headers: { token } }  // Send JWT token for authentication
      )

      if (data.success) {
        // Server returns { success: true, scan: { _id, verdict, score, ... } }
        // Navigate to result page using the scan's MongoDB _id
        navigate(`/result/${data.scan._id}`)
      } else {
        // Server returned success: false - display error message
        toast.error(data.message)
      }
    } catch (e) {
      // Network error or JSON parsing error
      toast.error(e.message)
    } finally {
      // ALWAYS clear loading state - whether success or failure
      // finally ensures this runs even if an exception is thrown
      setScanLoading(false)
    }
  }

  // ========== SUBMIT FILE SCAN ==========
  // Submits file-based scan (screenshot, document) with one or more images
  // Each file is sent via multipart/form-data
  // Backend converts to base64 and sends to Gemini Vision
  // On success, navigates to /result/:id
  const submitFileScan = async (type, files) => {
    // Check if user is logged in
    if (!token) {
      setShowLogin(true)
      return
    }

    setScanLoading(true)

    try {
      // Create FormData object for multipart/form-data request
      const formData = new FormData()

      // Handle both single file and array of files
      // User can select multiple images for screenshot/document scans
      const fileArray = Array.isArray(files) ? files : [files]

      // Add each file to FormData under the 'files' field name
      // FormData.append('files', file) allows multiple files with same key
      fileArray.forEach(file => formData.append('files', file))

      // Also send file names as a comma-separated string
      // Backend stores these in the scan record so user can see what was analyzed
      // (useful for image scans where we don't store the actual image binary)
      formData.append('fileNames', fileArray.map(f => f.name).join(', '))

      // POST to /api/scan/{screenshot|document}
      const { data } = await axios.post(
        backendUrl + `/api/scan/${type}`,
        formData,
        { headers: { token } }
        // IMPORTANT: Do NOT manually set 'Content-Type': 'multipart/form-data'
        // When FormData is passed to axios, axios automatically:
        // 1. Sets Content-Type to 'multipart/form-data'
        // 2. Generates and includes the correct boundary string
        // If we set it manually, we break the boundary calculation and request fails
      )

      if (data.success) {
        // Navigate to result page with the scan's MongoDB _id
        navigate(`/result/${data.scan._id}`)
      } else {
        toast.error(data.message)
      }
    } catch (e) {
      toast.error(e.message)
    } finally {
      setScanLoading(false)
    }
  }

  // ========== RESTORE SESSION ON TOKEN CHANGE ==========
  // Runs whenever token state changes (login, logout, page reload)
  // Fetches user profile to restore full user data from token
  useEffect(() => {
    // Only load user data if token exists
    // If token was cleared (logout), skip the API call
    if (token) {
      loadUserData()
    }
  }, [token])
  // Dependency: [token] - re-run whenever token changes

  // ========== CONTEXT VALUE ==========
  // Object containing all state and functions that will be shared with the entire app
  const value = {
    // User state
    user, setUser,

    // Login modal state
    showLogin, setShowLogin,

    // Initial auth mode (Login or Register)
    initialAuthMode, setInitialAuthMode,

    // Authentication token
    token, setToken,

    // Scan submission loading state
    scanLoading,

    // Backend URL for API calls
    backendUrl,

    // Functions for components to call
    loadUserData,   // Fetch user profile from token
    logout,         // Clear auth and redirect
    submitTextScan, // Submit text/email/job/url scans
    submitFileScan  // Submit screenshot/document scans
  }

  // Provide context value to all child components
  // Any component can use: const { token, user, logout, ... } = useContext(AppContext)
  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  )
}
