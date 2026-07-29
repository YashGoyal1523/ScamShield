// ============================================================
// scanModel.js - Defines the MongoDB schema for scan results
// Every time a user scans content, a scan document is created
// ============================================================

import mongoose from 'mongoose'

// Main schema for a scan document
const scanSchema = new mongoose.Schema({

  userId: {
    type: mongoose.Schema.Types.ObjectId, // MongoDB ObjectId type - references user document
    ref: 'user',                          // Links to the 'user' model (for populate() if needed)
    required: true                        // Every scan must belong to a user
  },

  type: {
    type: String,
    // Only these 6 values are allowed - Mongoose rejects any other value
    enum: ['text', 'email', 'job', 'url', 'screenshot', 'document'],
    required: true
  },

  content: {
    type: String,
    default: ''
    // For text/email/job/url: stores the actual pasted content
    // For screenshot/document: stores the file names (e.g. "offer_letter.jpg, page2.jpg")
  },

  verdict: {
    type: String,
    enum: ['SCAM', 'SUSPICIOUS', 'SAFE'], // Gemini returns one of these three
    required: true
  },

  score: {
    type: Number,
    required: true
    // 0-30 = SAFE, 31-60 = SUSPICIOUS, 61-100 = SCAM
    // Decided by Gemini based on the content analysis
  },

  explanation: {
    type: String,
    required: true // Gemini's 2-3 sentence written explanation
  },

  redFlags: [{
    flag: String,        // Short title e.g. "Urgency Language"
    explanation: String, // Detailed explanation e.g. "Uses 'act now' to pressure victim"
    _id: false           // Red flags don't need their own MongoDB IDs
  }],
  // Empty array for SAFE verdicts

  suggestions: [String], // Array of safety advice strings from Gemini

  createdAt: {
    type: Date,
    default: Date.now // Auto-set when scan is saved
  }
})

// Compound index on userId + createdAt (descending)
// This dramatically speeds up history and dashboard queries because:
// - Most queries filter by userId AND sort by date
// - Without index, MongoDB would scan ALL documents - with index it's instant
// { userId: 1, createdAt: -1 } means: sort userId ascending, createdAt newest first
scanSchema.index({ userId: 1, createdAt: -1 })

const scanModel = mongoose.models.scan || mongoose.model('scan', scanSchema)
export default scanModel
