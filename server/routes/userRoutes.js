// ============================================================
// userRoutes.js - Defines all HTTP routes for user operations
// Mounted at /api/user in server.js
// ============================================================

import express from 'express'
import { registerUser, loginUser, getUserProfile, deleteAccount } from '../controllers/userController.js'
import userAuth from '../middlewares/auth.js' // JWT verification middleware

const userRouter = express.Router()

// Public routes - no authentication required
// Anyone can register or login without a token
userRouter.post('/register', registerUser)   // POST /api/user/register
userRouter.post('/login', loginUser)         // POST /api/user/login

// Protected routes - userAuth middleware runs BEFORE the controller
// userAuth verifies the JWT token; if valid, it calls next() to run the controller
// If token is missing or invalid, userAuth sends 401 and the controller never runs
userRouter.get('/profile', userAuth, getUserProfile)    // GET /api/user/profile
userRouter.delete('/delete', userAuth, deleteAccount)   // DELETE /api/user/delete

export default userRouter
