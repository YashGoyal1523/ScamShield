// ============================================================
// server.js - Main entry point for the ScamShield backend
// This file sets up Express, connects middleware, mounts routes,
// and starts the server after connecting to MongoDB
// ============================================================

import express from 'express'       // Express is our web framework for handling HTTP requests
import cors from 'cors'             // CORS middleware allows frontend (different origin) to call this API
import 'dotenv/config'              // Automatically loads .env file into process.env on startup
import connectDB from './config/mongodb.js'   // Our MongoDB connection function
import userRouter from './routes/userRoutes.js' // All /api/user routes
import scanRouter from './routes/scanRoutes.js' // All /api/scan routes

const app = express() // Create the Express application instance

const PORT = process.env.PORT || 8000 // Use PORT from .env or fallback to 8000

// ---- Middleware ----
// Middleware runs on EVERY request before it reaches the route handler

app.use(cors())
// cors() allows requests from any origin (our React frontend)
// Without this, browser blocks cross-origin requests for security

app.use(express.json({ limit: '10mb' }))
// Parses incoming JSON request bodies so we can access req.body
// limit: '10mb' because large text content can be pasted in scan forms

// ---- Routes ----
// Mount routers - all requests starting with these paths go to respective routers

app.use('/api/user', userRouter)
// Handles: POST /api/user/register, POST /api/user/login,
//          GET /api/user/profile, DELETE /api/user/delete

app.use('/api/scan', scanRouter)
// Handles: POST /api/scan/text, /email, /job, /url, /screenshot, /document
//          GET /api/scan/stats, /history, /:id
//          DELETE /api/scan/:id

app.get('/', (req, res) => res.send('ScamShield API working'))
// Simple health check - visiting the root URL confirms the server is running

// ---- Global Error Handler ----
// This MUST have 4 parameters (err, req, res, next) for Express to treat it as error handler
// It catches any error passed via next(err) from routes or middleware
app.use((err, req, res, next) => {
  console.error(err.stack) // Log full error stack trace to terminal
  res.status(500).json({ success: false, message: 'Internal server error' })
})

// ---- Start Server ----
// Connect to MongoDB FIRST, then start listening for requests
// If DB connection fails, server won't start (which is the correct behavior)
connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
})
