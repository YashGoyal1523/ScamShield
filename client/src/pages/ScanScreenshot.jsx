// ============================================================
// ScanScreenshot.jsx - Scan page for screenshot uploads
// Supports drag & drop and multiple image upload
// Images are stored as File objects and preview blob URLs
// On submit, all files are sent to backend for Gemini Vision analysis
// ============================================================

import { useContext, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext.jsx'

const ScanScreenshot = () => {
  // Get submit function and loading state from global context
  const { submitFileScan, scanLoading } = useContext(AppContext)

  // Navigation hook
  const navigate = useNavigate()

  // ---- FILE MANAGEMENT STATE ----
  const [files, setFiles] = useState([])         // Array of File objects selected by user
  const [previews, setPreviews] = useState([])   // Array of blob URLs for image previews
  // Files and previews are kept in sync by index - files[0] shows as previews[0]

  const [dragging, setDragging] = useState(false) // true when user is dragging files over the drop zone

  // Reference to hidden file input - used to trigger file picker when user clicks drop zone
  const inputRef = useRef()

  // ---- HANDLE FILES ----
  // Processes selected files: validates they're images, creates previews, adds to state
  const handleFiles = (selected) => {
    // Filter to only image files (rejecting other file types)
    const valid = Array.from(selected).filter(f => f.type.startsWith('image/'))

    // If no valid images, exit early
    if (valid.length === 0) return

    // Create blob URLs for each image - these are used for <img src="..."> preview
    // URL.createObjectURL creates a local reference that the browser can display
    const newPreviews = valid.map(f => URL.createObjectURL(f))

    // Append new files and previews to existing ones (user can upload in batches)
    setFiles(prev => [...prev, ...valid])
    setPreviews(prev => [...prev, ...newPreviews])
  }

  // ---- REMOVE FILE ----
  // Removes a specific file and its preview by index
  const removeFile = (index) => {
    // IMPORTANT: Revoke the blob URL to free up memory
    // Without this, browser keeps the blob in memory even if not displayed
    URL.revokeObjectURL(previews[index])

    // Remove the file and preview at the given index
    // Array.filter with index keeps all items except the one at index
    setFiles(prev => prev.filter((_, i) => i !== index))
    setPreviews(prev => prev.filter((_, i) => i !== index))
  }

  // ---- DRAG AND DROP ----
  // Fires when user drops files onto the drop zone
  const onDrop = (e) => {
    e.preventDefault()              // Prevent browser from opening the file
    setDragging(false)              // Exit dragging state
    handleFiles(e.dataTransfer.files) // Process the dropped files
  }

  // ---- FORM SUBMISSION ----
  // Sends all selected files to backend for analysis
  const onSubmitHandler = async (e) => {
    e.preventDefault()
    if (files.length === 0) return // Safety check

    // Call the global submit function with type 'screenshot'
    // submitFileScan handles FormData, API call, and navigation
    await submitFileScan('screenshot', files)
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
          {/* Pink icon badge for screenshot */}
          <div className="w-10 h-10 rounded-xl bg-pink-500/20 flex items-center justify-center">
            <span className="text-pink-400 text-xs font-bold">IMG</span>
          </div>

          <h1 className="text-2xl font-bold text-white">Analyze Screenshot</h1>
        </div>

        <p className="text-gray-500 text-sm">
          Upload one or more screenshots of a suspicious chat, payment, or notification
        </p>
      </div>

      {/* Form */}
      <form onSubmit={onSubmitHandler}>

        {/* ---- DROP ZONE ----
            User can drag files here or click to open file picker
            Changes color when dragging is active */}
        <div
          // onDragOver must call preventDefault to allow drop
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          // onDragLeave resets dragging state when cursor leaves the zone
          onDragLeave={() => setDragging(false)}
          // onDrop processes the dropped files
          onDrop={onDrop}
          // onClick opens the hidden file input to let user browse files
          onClick={() => inputRef.current.click()}
          // Conditional styling: pink when dragging, subtle otherwise
          className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-colors mb-4 ${
            dragging ? 'border-pink-500/50 bg-pink-500/5' : 'border-white/10 hover:border-white/20 hover:bg-white/5'
          }`}
        >
          {/* Plus icon */}
          <div className="w-12 h-12 rounded-2xl bg-pink-500/10 flex items-center justify-center mx-auto mb-3">
            <span className="text-pink-400 text-2xl">+</span>
          </div>

          {/* Instructions */}
          <p className="text-white font-medium mb-1">Drop screenshots here</p>
          <p className="text-gray-500 text-sm mb-2">or click to browse - select multiple</p>
          <p className="text-gray-600 text-xs">JPG, PNG, WEBP - max 5MB each - up to 5 images</p>

          {/* Hidden file input - triggered by click or onChange via dropzone */}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"     // Only accept image files
            multiple             // Allow selecting multiple files at once
            onChange={(e) => handleFiles(e.target.files)} // Process selected files
            className="hidden"   // Hidden from view - only used programmatically
          />
        </div>

        {/* ---- IMAGE PREVIEWS ----
            Shows thumbnails of selected images in a grid
            Only rendered if at least one image is selected */}
        {previews.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
            {previews.map((src, i) => (
              // Card for each selected image
              <div key={i} className="relative group rounded-xl overflow-hidden border border-white/10 bg-[#1a1a1a]">

                {/* Preview image */}
                <img
                  src={src}  // Blob URL created by URL.createObjectURL
                  alt={`Screenshot ${i + 1}`}
                  className="w-full h-32 object-cover"  // object-cover crops image to fit thumbnail
                />

                {/* Remove button - red X in top right corner */}
                <button
                  type="button"
                  onClick={() => removeFile(i)}
                  className="absolute top-2 right-2 w-6 h-6 bg-black/70 hover:bg-red-600 text-white rounded-full text-xs transition-colors flex items-center justify-center"
                >
                  ✕
                </button>

                {/* File name shown at bottom of thumbnail */}
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-2 py-1">
                  <p className="text-white text-xs truncate">{files[i]?.name}</p>
                </div>

              </div>
            ))}
          </div>
        )}

        {/* ---- SELECTED COUNT MESSAGE ----
            Shows how many images are selected
            Only shown if at least one image is selected */}
        {previews.length > 0 && (
          <p className="text-gray-500 text-xs mb-4 text-center">
            {previews.length} image{previews.length > 1 ? 's' : ''} selected - Gemini will analyze all together
            {/* Plural "s" only if more than 1 image */}
          </p>
        )}

        {/* ---- SUBMIT BUTTON ----
            Disabled if no files selected or request is in progress
            Button text changes based on count (singular/plural) */}
        <button
          type="submit"
          disabled={scanLoading || files.length === 0}
          className="w-full bg-pink-600 hover:bg-pink-700 disabled:bg-pink-800/50 disabled:cursor-not-allowed text-white py-3.5 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
        >
          {scanLoading ? (
            // While analyzing: show spinner and "Analyzing..."
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Analyzing screenshots...
            </>
          ) : (
            // Normal state: dynamic text based on count
            `Analyze ${files.length > 1 ? `${files.length} Screenshots` : 'Screenshot'}`
          )}
        </button>
      </form>

      {/* Helpful tip */}
      <div className="mt-6 bg-white/5 rounded-xl p-4">
        <p className="text-gray-500 text-xs leading-relaxed">
          <span className="text-gray-400 font-medium">Tip: </span>
          Upload multiple screenshots of the same conversation for more accurate analysis.
        </p>
      </div>

    </div>
  )
}

export default ScanScreenshot
