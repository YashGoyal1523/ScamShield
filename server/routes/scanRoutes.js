// ============================================================
// scanRoutes.js — Defines all HTTP routes for scan operations
// Mounted at /api/scan in server.js
// ============================================================

import express from 'express'
import multer from 'multer' // Middleware for handling file uploads (multipart/form-data)
import userAuth from '../middlewares/auth.js'
import {
  analyzeText, analyzeEmail, analyzeJob, analyzeUrl,
  analyzeScreenshot, analyzeDocument,
  getScanHistory, getScanById, deleteScan, getDashboardStats
} from '../controllers/scanController.js'

const scanRouter = express.Router()

// ---- Multer Configuration ----
const upload = multer({
  storage: multer.memoryStorage(),
  // memoryStorage() keeps files in RAM as Buffer objects (req.files[].buffer)
  // We chose this instead of disk storage because:
  // 1. We never store images permanently — they're sent to Gemini and discarded
  // 2. No need to manage file paths or cleanup
  // 3. Images are accessed directly from memory, converted to base64, and sent to Gemini

  limits: { fileSize: 5 * 1024 * 1024 },
  // Maximum 5MB per file (5 * 1024 * 1024 bytes)
  // Prevents memory issues from oversized uploads

  fileFilter: (req, file, cb) => {
    // cb is a callback — cb(null, true) accepts the file, cb(new Error()) rejects it
    if (file.mimetype.startsWith('image/')) {
      cb(null, true)  // Accept — mimetype is image/jpeg, image/png, image/webp etc.
    } else {
      cb(new Error('Only image files are allowed')) // Reject — not an image
    }
  }
})

// ---- Multer Error Handler ----
// Multer errors are NOT caught by Express's normal error handler
// They need their own 4-parameter error middleware placed after the upload middleware
const handleMulterError = (err, req, res, next) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    // Multer sets err.code when file exceeds the size limit
    return res.status(400).json({ success: false, message: 'File size exceeds 5MB limit' })
  }
  if (err.message === 'Only image files are allowed') {
    // Our custom error from the fileFilter function above
    return res.status(400).json({ success: false, message: err.message })
  }
  next(err) // Unknown error — pass to Express global error handler
}

// ---- Text-based Scan Routes ----
// All require auth — users must be logged in to run scans
// These send JSON body { content: "..." } to the controller
scanRouter.post('/text', userAuth, analyzeText)
scanRouter.post('/email', userAuth, analyzeEmail)
scanRouter.post('/job', userAuth, analyzeJob)
scanRouter.post('/url', userAuth, analyzeUrl)

// ---- File Upload Scan Routes ----
// Middleware chain: userAuth → upload.array → handleMulterError → controller
// upload.array('files', 5) — field name is 'files', max 5 files per request
// Populates req.files as an array of file objects with .buffer, .mimetype, .originalname
scanRouter.post('/screenshot', userAuth, upload.array('files', 5), handleMulterError, analyzeScreenshot)
scanRouter.post('/document', userAuth, upload.array('files', 5), handleMulterError, analyzeDocument)

// ---- Data Retrieval Routes ----
// IMPORTANT: /stats and /history MUST be defined BEFORE /:id
// If /:id came first, Express would match 'stats' and 'history' as the :id parameter
// and call getScanById instead of the correct handler
scanRouter.get('/stats', userAuth, getDashboardStats)   // GET /api/scan/stats
scanRouter.get('/history', userAuth, getScanHistory)    // GET /api/scan/history?type=&verdict=&page=
scanRouter.get('/:id', userAuth, getScanById)           // GET /api/scan/:id — single scan by MongoDB _id
scanRouter.delete('/:id', userAuth, deleteScan)         // DELETE /api/scan/:id

export default scanRouter
