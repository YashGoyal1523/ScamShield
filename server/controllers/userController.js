// ============================================================
// userController.js - Handles user account operations
// Register, Login, Get Profile, Delete Account
// ============================================================

import bcrypt from 'bcrypt'         // Library for hashing and comparing passwords securely
import jwt from 'jsonwebtoken'      // Library for creating and verifying JWT tokens
import userModel from '../models/userModel.js'   // MongoDB user model
import scanModel from '../models/scanModel.js'   // MongoDB scan model - needed for deleteAccount

// ----------------------------------------------------------------
// REGISTER - Creates a new user account
// POST /api/user/register
// ----------------------------------------------------------------
const registerUser = async (req, res) => {

  // .trim() removes leading/trailing whitespace - prevents " john " being saved
  // .toLowerCase() ensures emails are case-insensitive - "John@gmail.com" = "john@gmail.com"
  const name = req.body.name?.trim()
  const email = req.body.email?.trim().toLowerCase()
  const password = req.body.password
  // Note: ?. (optional chaining) prevents crash if req.body is undefined

  // Validate all required fields before doing any database work
  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'All fields are required' })
    // 400 = Bad Request - client sent incomplete data
  }

  // Enforce minimum password length before hashing
  if (password.length < 6) {
    return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' })
  }

  try {
    // Check if this email is already registered in the database
    const existingUser = await userModel.findOne({ email })
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'Email already registered' })
      // 409 = Conflict - resource already exists
    }

    // Hash the password using bcrypt before storing
    // genSalt(10) creates a random salt with 10 "rounds" - higher = more secure but slower
    // 10 rounds is the industry standard balance between security and performance
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)
    // hashedPassword looks like: $2b$10$N9qo8uLOickgx2ZMRZo...
    // The original password CANNOT be recovered from this hash

    // Create the user document in MongoDB
    const newUser = new userModel({ name, email, password: hashedPassword })
    await newUser.save() // Actually writes to database

    // Create a JWT token containing the user's MongoDB _id
    // This token is sent to frontend and stored in localStorage
    // expiresIn: '7d' means token becomes invalid after 7 days - user must re-login
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '7d' })

    // Return full user data (name, email, createdAt) so frontend has everything immediately
    // Without this, frontend would need a separate /profile API call to get email and createdAt
    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,  // JWT token for future authenticated requests
      user: { name: newUser.name, email: newUser.email, createdAt: newUser.createdAt }
    })
    // 201 = Created - resource was successfully created

  } catch (e) {
    console.error('registerUser error:', e.message)
    res.status(500).json({ success: false, message: e.message })
    // 500 = Internal Server Error - something unexpected went wrong
  }
}

// ----------------------------------------------------------------
// LOGIN - Authenticates an existing user
// POST /api/user/login
// ----------------------------------------------------------------
const loginUser = async (req, res) => {
  const email = req.body.email?.trim().toLowerCase()
  const password = req.body.password

  // Both fields are required
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required' })
  }

  try {
    // Find user by email in database
    const user = await userModel.findOne({ email })

    if (!user) {
      // Deliberately use same error message for wrong email and wrong password
      // This prevents "email enumeration attacks" - hackers can't figure out if email exists
      return res.status(401).json({ success: false, message: 'Invalid email or password' })
      // 401 = Unauthorized - credentials are invalid
    }

    // Compare entered password with the stored bcrypt hash
    // bcrypt.compare() hashes the entered password with the same salt and compares
    // Returns true if they match, false if they don't
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' })
    }

    // Credentials valid - generate a new JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' })

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: { name: user.name, email: user.email, createdAt: user.createdAt }
    })

  } catch (e) {
    console.error('loginUser error:', e.message)
    res.status(500).json({ success: false, message: e.message })
  }
}

// ----------------------------------------------------------------
// GET PROFILE - Returns logged-in user's profile data
// GET /api/user/profile
// Called on page load to restore user state from token
// ----------------------------------------------------------------
const getUserProfile = async (req, res) => {
  try {
    // req.userId was set by the auth middleware after verifying the JWT
    // .select('-password') excludes the password field from the returned document
    // We NEVER send the hashed password to the frontend
    const user = await userModel.findById(req.userId).select('-password')

    if (!user) {
      // This happens if user was deleted but token is still valid
      return res.status(404).json({ success: false, message: 'User not found' })
      // 404 = Not Found
    }

    res.status(200).json({ success: true, user })

  } catch (e) {
    console.error('getUserProfile error:', e.message)
    res.status(500).json({ success: false, message: e.message })
  }
}

// ----------------------------------------------------------------
// DELETE ACCOUNT - Permanently removes user and all their scans
// DELETE /api/user/delete
// ----------------------------------------------------------------
const deleteAccount = async (req, res) => {
  try {
    // Delete all scans belonging to this user FIRST
    // If we deleted the user first, the scans would become "orphaned" data
    // deleteMany removes ALL matching documents at once
    await scanModel.deleteMany({ userId: req.userId })

    // Then delete the user document itself
    // findByIdAndDelete finds by _id and removes in one operation
    await userModel.findByIdAndDelete(req.userId)

    res.status(200).json({ success: true, message: 'Account deleted successfully' })

  } catch (e) {
    console.error('deleteAccount error:', e.message)
    res.status(500).json({ success: false, message: e.message })
  }
}

export { registerUser, loginUser, getUserProfile, deleteAccount }
