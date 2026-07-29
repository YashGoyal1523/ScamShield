// ============================================================
// userModel.js - Defines the MongoDB schema and model for users
// Each document in the 'users' collection follows this structure
// ============================================================

import mongoose from 'mongoose'

// Schema defines the shape and rules of a user document
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true  // Cannot create a user without a name
  },
  email: {
    type: String,
    required: true,
    unique: true    // MongoDB creates a unique index - prevents two users with same email
  },
  password: {
    type: String,
    required: true  // Stored as a bcrypt hash - NEVER stored as plain text
  },
  createdAt: {
    type: Date,
    default: Date.now // Automatically set to current timestamp when user is created
  }
})

// mongoose.models.user checks if model is already registered (important for hot reload in dev)
// If it is, reuse it. If not, create a new one.
// 'user' is the model name - Mongoose automatically pluralizes it to 'users' collection
const userModel = mongoose.models.user || mongoose.model('user', userSchema)

export default userModel
