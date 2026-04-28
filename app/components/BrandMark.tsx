'use client'

import { useEffect, useState } from 'react'

export function BrandMark() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    const read = () =>
      ((document.documentElement.getAttribute('data-theme') as 'light' | 'dark') || 'light')
    setTheme(read())
    const obs = new MutationObserver(() => setTheme(read()))
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    return () => obs.disconnect()
  }, [])

  const src = theme === 'dark' ? '/planni-logo-dark.png' : '/planni-logo-light.png'

  return (
    <a
      className="brand-mark"
      href="https://planni.de"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="planni.de"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="planni" />
    </a>
  )
}
