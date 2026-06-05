// ============================================================
// auth.js — JWT Authentication Middleware
// Runs before any protected route handler to verify the user is logged in
// If token is valid, attaches userId to req so controllers can use it
// ============================================================

import jwt from 'jsonwebtoken' // Library for creating and verifying JSON Web Tokens

const userAuth = async (req, res, next) => {
  // Frontend sends the JWT token in request headers with every protected API call
  // Format: { headers: { token: 'eyJhbGciOiJIUzI1NiIsInR...' } }
  const { token } = req.headers

  // If no token is provided, reject immediately with 401 Unauthorized
  if (!token) {
    return res.status(401).json({ success: false, message: 'Not Authorized, Login again' })
    // 'return' is important here — stops execution and prevents calling next()
  }

  try {
    // jwt.verify() decodes the token AND checks its signature against our secret
    // If token was tampered with or has expired, it throws an error → caught below
    const tokenDecode = jwt.verify(token, process.env.JWT_SECRET)

    if (tokenDecode.id) {
      // Attach userId to the request object so any controller after this middleware
      // can access req.userId without needing the token again
      req.userId = tokenDecode.id
    } else {
      // Token is valid but doesn't contain an id — shouldn't happen but handle gracefully
      return res.status(401).json({ success: false, message: 'Not Authorized, Login again' })
    }

    // Token is valid — pass control to the next function (the actual route handler)
    next()

  } catch (e) {
    // jwt.verify throws JsonWebTokenError if tampered, TokenExpiredError if expired
    console.error('userAuth error:', e.message)
    res.status(401).json({ success: false, message: 'Invalid or expired token, Login again' })
    // Note: no 'return' needed here since catch is the last block
  }
}

export default userAuth
