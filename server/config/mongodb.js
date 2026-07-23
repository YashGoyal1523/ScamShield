// ============================================================
// mongodb.js — Handles connection to MongoDB using Mongoose
// Called once at server startup before the server starts listening
// ============================================================

import mongoose from 'mongoose' // Mongoose is an ODM (Object Document Mapper) for MongoDB

const connectDB = async () => {
  // Register an event listener — fires when connection is successfully established
  // This is separate from the await below — it just logs a confirmation message
  mongoose.connection.on('connected', () => {
    console.log('Database Connected')
  })

  // Connect to MongoDB using the URI from .env

  await mongoose.connect(process.env.MONGODB_URI)
}

export default connectDB // Export so server.js can call it on startup
