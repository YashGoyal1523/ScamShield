// ============================================================
// Profile.jsx — User account profile and settings page
// Shows user info, scan stats, and account management options
// Delete account permanently removes user and all scans from DB
// ============================================================

import { useContext, useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'
import { AppContext } from '../context/AppContext.jsx'

const Profile = () => {
  // Get auth data and logout function from global context
  const { token, backendUrl, user, logout } = useContext(AppContext)

  // ---- PAGE STATE ----
  const [stats, setStats] = useState(null)                // User's scan statistics
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false) // Toggle delete confirmation dialog
  const [deleteLoading, setDeleteLoading] = useState(false)  // true while deleting account

  const navigate = useNavigate()

  // ---- DELETE ACCOUNT ----
  // Permanently removes user and all their scans from the database
  const handleDeleteAccount = async () => {
    setDeleteLoading(true)
    try {
      const { data } = await axios.delete(
        backendUrl + '/api/user/delete',
        { headers: { token } }
      )

      if (data.success) {
        toast.success(data.message)
        logout()  // Clear auth state and redirect to home
      } else {
        toast.error(data.message)
      }
    } catch (e) {
      toast.error(e.message)
    } finally {
      setDeleteLoading(false)
    }
  }

  // ---- LOAD USER STATS ----
  // Fetches user's scan statistics for profile display
  const loadStats = async () => {
    try {
      const { data } = await axios.get(
        backendUrl + '/api/scan/stats',
        { headers: { token } }
      )

      if (data.success) {
        setStats(data.stats)  // Extract just the stats object
      }
    } catch (e) {
      toast.error(e.message)
    }
  }

  // ---- INITIAL LOAD ----
  // Check auth and fetch stats on mount
  useEffect(() => {
    // If not logged in, redirect to home
    if (!token) {
      navigate('/')
      return
    }

    loadStats()
  }, [token])

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">

      {/* ========== PAGE HEADER ========== */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Profile</h1>
        <p className="text-gray-500 text-sm mt-1">Your account details and scan stats</p>
      </div>

      {/* ========== USER CARD ========== */}
      {/* Displays user avatar, name, email, and member date */}
      <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-5">

          {/* User avatar — gradient square with first initial */}
          <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-blue-500 to-blue-700 flex items-center justify-center">
            <span className="text-white text-2xl font-bold">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
              {/* Get first letter of name, fallback to 'U' */}
            </span>
          </div>

          {/* User info — name, email, join date */}
          <div>
            {/* Full name */}
            <h2 className="text-white text-xl font-semibold">{user?.name || 'User'}</h2>

            {/* Email address */}
            <p className="text-gray-500 text-sm">{user?.email || ''}</p>

            {/* Member since date — formatted as "June 2026" */}
            <p className="text-gray-600 text-xs mt-1">
              Member since {
                user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                  : '—'
              }
            </p>
          </div>

        </div>
      </div>

      {/* ========== SCAN STATISTICS ========== */}
      {/* 4 cards showing user's scan metrics */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">

          {/* Total scans card */}
          <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-white">{stats.total}</p>
            <p className="text-gray-500 text-xs mt-1">Total Scans</p>
          </div>

          {/* Scams found card — red theme */}
          <div className="bg-[#1a1a1a] border border-red-500/20 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-red-500">{stats.scams}</p>
            <p className="text-gray-500 text-xs mt-1">Scams Caught</p>
          </div>

          {/* Suspicious card — orange theme */}
          <div className="bg-[#1a1a1a] border border-orange-500/20 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-orange-500">{stats.suspicious}</p>
            <p className="text-gray-500 text-xs mt-1">Suspicious</p>
          </div>

          {/* Safe card — green theme */}
          <div className="bg-[#1a1a1a] border border-green-500/20 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-green-500">{stats.safe}</p>
            <p className="text-gray-500 text-xs mt-1">Safe</p>
          </div>

        </div>
      )}

      {/* ========== NAVIGATION LINKS ========== */}
      {/* Quick links to other key pages */}
      <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl overflow-hidden mb-6">

        {/* Scan History link */}
        <Link
          to="/history"
          className="flex items-center justify-between px-5 py-4 hover:bg-white/5 border-b border-white/5 transition-colors"
        >
          <span className="text-gray-300 text-sm">Scan History</span>
          <span className="text-gray-600 text-sm">→</span>
        </Link>

        {/* Dashboard link */}
        <Link
          to="/dashboard"
          className="flex items-center justify-between px-5 py-4 hover:bg-white/5 transition-colors"
        >
          <span className="text-gray-300 text-sm">Dashboard</span>
          <span className="text-gray-600 text-sm">→</span>
        </Link>

      </div>

      {/* ========== SIGN OUT BUTTON ========== */}
      {/* Red button to log out user */}
      <button
        onClick={logout}
        className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 py-3 rounded-xl font-medium text-sm transition-colors mb-3"
      >
        Sign Out
      </button>

      {/* ========== DELETE ACCOUNT ========== */}
      {/* Delete button with confirmation dialog */}

      {!showDeleteConfirm ? (
        // Delete button — initially shown
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="w-full text-gray-600 hover:text-red-400 text-sm transition-colors py-2"
        >
          Delete Account
        </button>
      ) : (
        // Confirmation dialog — appears after clicking Delete Account
        <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-5 animate-fade-in">

          {/* Warning heading */}
          <p className="text-white text-sm font-medium mb-1">Are you sure?</p>

          {/* Warning message */}
          <p className="text-gray-500 text-xs mb-4">
            This will permanently delete your account and all scan history. This cannot be undone.
          </p>

          {/* Action buttons */}
          <div className="flex gap-3">

            {/* Cancel button — hides confirmation dialog */}
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="flex-1 bg-white/5 hover:bg-white/10 text-gray-400 py-2.5 rounded-lg text-sm transition-colors"
            >
              Cancel
            </button>

            {/* Confirm delete button — actually deletes account */}
            <button
              onClick={handleDeleteAccount}
              disabled={deleteLoading}
              className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-70 disabled:cursor-not-allowed text-white py-2.5 rounded-lg text-sm font-medium transition-colors"
            >
              {deleteLoading ? 'Deleting...' : 'Yes, Delete'}
              {/* Button text changes while request is in progress */}
            </button>

          </div>

        </div>
      )}

    </div>
  )
}

export default Profile
