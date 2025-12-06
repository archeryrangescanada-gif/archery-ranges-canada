// components/AdSpace.tsx
'use client'
import { useEffect, useState } from 'react'

interface AdSpaceProps {
  placement: string // 'homepage_header', 'sidebar_top', etc.
}

export default function AdSpace({ placement }: AdSpaceProps) {
  const [ads, setAds] = useState([])
  
  useEffect(() => {
    // Fetch ads for this placement
    // Track impression
    // Rotate if needed
  }, [placement])

  if (!ads.length) return null

  return (
    <div className="ad-space">
      {/* Render ad */}
    </div>
  )
}