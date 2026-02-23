import React from 'react'

const HomePageLoader = () => {
  return (
    <div className="grid min-h-screen w-full place-items-center overflow-x-scroll rounded-lg p-6 lg:overflow-visible">
      <svg
        className="w-16 h-16 animate-spin"
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Background track */}
        <circle
          cx="32"
          cy="32"
          r="28"
          stroke="#e5e7eb"
          strokeWidth="6"
        />
        {/* Spinning arc — uses strokeDasharray to create the "gap" effect */}
        <circle
          cx="32"
          cy="32"
          r="28"
          stroke="#111827"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray="44 132"
          strokeDashoffset="0"
        />
      </svg>
    </div>
  )
}

export default HomePageLoader