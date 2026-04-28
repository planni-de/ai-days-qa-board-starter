'use client'

import { useEffect, useState } from 'react'

type Theme = 'light' | 'dark'

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme | null>(null)

  useEffect(() => {
    const current = (document.documentElement.getAttribute('data-theme') as Theme) || 'light'
    setTheme(current)
  }, [])

  function toggle() {
    const next: Theme = theme === 'dark' ? 'light' : 'dark'
    document.documentElement.setAttribute('data-theme', next)
    try {
      localStorage.setItem('qa-theme', next)
    } catch {}
    setTheme(next)
  }

  const label = theme === 'dark' ? 'Helles Design aktivieren' : 'Dunkles Design aktivieren'
  return (
    <button
      type="button"
      className="theme-toggle"
      aria-label={label}
      title={label}
      onClick={toggle}
    >
      {theme === 'dark' ? '☀︎' : '☾'}
    </button>
  )
}
