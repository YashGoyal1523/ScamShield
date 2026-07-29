// ============================================================
// ScamMeter.jsx - Animated SVG gauge showing scam score 0-100
// Semicircle with colored fill + rotating needle
// Used on Result page to show the AI's confidence score
// ============================================================

import { useEffect, useState } from 'react'

const ScamMeter = ({ score }) => {
  // ---- ANIMATION STATE ----
  // animated starts at 0 and transitions to the actual score after 300ms
  // This creates the sweep animation when the result page loads
  // Without this delay, the animation would happen too fast to see
  const [animated, setAnimated] = useState(0)

  useEffect(() => {
    // Small delay before starting animation so the page renders first
    // setTimeout with 300ms gives CSS transitions time to trigger
    const timeout = setTimeout(() => setAnimated(score), 300)

    // Cleanup: clear timeout if component unmounts before delay finishes
    // This prevents the state update from running on a unmounted component
    return () => clearTimeout(timeout)
  }, [score]) // Re-run when score prop changes

  // ---- SVG COORDINATE MATH ----
  // SVG viewBox is 220x140, but we use a 110x110 centered grid for the meter

  const cx = 110  // center X coordinate
  const cy = 110  // center Y coordinate
  const r = 85    // radius of the semicircle

  // ---- ARC LENGTH CALCULATION ----
  // Semicircle arc = π × radius
  // This is the total length in "units" of the semicircle path
  // We use this to calculate how much of the arc to "fill"
  const totalArc = Math.PI * r

  // ---- SCORE ARC CALCULATION ----
  // Score 0 → arc length 0 (nothing filled)
  // Score 50 → arc length totalArc/2 (half filled)
  // Score 100 → arc length totalArc (completely filled)
  const scoreArc = (animated / 100) * totalArc

  // ---- STROKE DASH OFFSET ----
  // SVG has strokeDasharray (line pattern length) and strokeDashoffset (offset in pattern)
  // strokeDasharray = totalArc means pattern repeats every full arc
  // strokeDashoffset = how much to hide from the start
  // Example: if totalArc = 267 and scoreArc = 133
  //   dashOffset = 267 - 133 = 134
  //   This hides 134 units, so only 133 units of the arc are visible
  const dashOffset = totalArc - scoreArc

  // ---- COLOR SELECTION ----
  // Changes based on score ranges matching the verdict severity
  const getColor = (s) => {
    if (s <= 30) return '#22c55e' // green for SAFE (0-30)
    if (s <= 60) return '#f97316' // orange for SUSPICIOUS (31-60)
    return '#ef4444'              // red for SCAM (61-100)
  }

  const color = getColor(animated)

  // ---- NEEDLE ROTATION ----
  // Needle starts pointing left at score 0 (-90 degrees)
  // Needle ends pointing right at score 100 (+90 degrees)
  // Total rotation is 180 degrees across the score range
  // Formula: (animated / 100) * 180 - 90
  // Example: score 50 → (50/100)*180 - 90 = 90 - 90 = 0 (pointing up/center)
  const needleAngle = (animated / 100) * 180 - 90

  return (
    <div className="flex flex-col items-center">

      {/* ---- SVG GAUGE ---- */}
      {/* viewBox="0 0 220 140" defines the coordinate system inside the SVG
          width="220" height="140" is the actual rendered size */}
      <svg width="220" height="140" viewBox="0 0 220 140">

        {/* ---- GRAY BACKGROUND ARC ----
            This is the full semicircle outline that's always visible
            It provides the background track for the colored fill
            SVG path 'd' attribute defines the shape:
            M = MoveTo (cx - r, cy) = left side of semicircle
            A = Arc command with parameters: rx ry x-axis-rotation large-arc-flag sweep-flag x y
            The arc goes from left (cx-r, cy) to right (cx+r, cy) */}
        <path
          d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          fill="none"
          stroke="#2a2a2a"
          strokeWidth="14"
          strokeLinecap="round"
        />

        {/* ---- COLORED SCORE ARC ----
            This arc appears ON TOP of the gray background arc
            It fills based on the score (animated value)
            strokeDasharray and strokeDashoffset create the "partial fill" effect */}
        <path
          d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          fill="none"
          stroke={color}
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={totalArc}
          strokeDashoffset={dashOffset}
          style={{
            transition: 'stroke-dashoffset 1.2s ease-out, stroke 0.5s ease'
          }}
        />

        {/* ---- ZONE LABELS ----
            Text labels at the three danger zones of the meter */}

        {/* SAFE zone on the left (green) */}
        <text x="14" y="128" fontSize="9" fill="#22c55e" fontFamily="Inter">
          SAFE
        </text>

        {/* SUSPICIOUS zone at the top (orange) */}
        <text x="110" y="20" fontSize="9" fill="#f97316" fontFamily="Inter" textAnchor="middle">
          SUSP.
        </text>

        {/* SCAM zone on the right (red) */}
        <text x="206" y="128" fontSize="9" fill="#ef4444" fontFamily="Inter" textAnchor="end">
          SCAM
        </text>

        {/* ---- NEEDLE (ROTATING INDICATOR) ----
            Thin white line that rotates to point at the current score */}
        <line
          x1={cx}
          y1={cy}
          x2={cx}
          y2={cy - r + 10}
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          style={{
            transformOrigin: `${cx}px ${cy}px`,
            transform: `rotate(${needleAngle}deg)`,
            transition: 'transform 1.2s ease-out'
          }}
        />

        {/* ---- CENTER DOT ----
            Visual element where the needle pivots
            Outer white circle + inner dark circle for layered effect */}
        <circle cx={cx} cy={cy} r="5" fill="white" />
        <circle cx={cx} cy={cy} r="2.5" fill="#0f0f0f" />

      </svg>

      {/* ---- NUMERIC SCORE DISPLAY ----
          Shows the score as a large number below the gauge */}
      <div className="text-center -mt-2">
        <span className="text-6xl font-bold" style={{ color }}>
          {score}
        </span>
        <span className="text-gray-500 text-xl">/100</span>
      </div>

      {/* ---- LABEL ---- */}
      <p className="text-gray-500 text-sm mt-1">Scam Score</p>

    </div>
  )
}

export default ScamMeter
