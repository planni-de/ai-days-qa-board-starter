import './globals.css'
import type { Metadata } from 'next'
import { ThemeToggle } from './components/ThemeToggle'
import { BrandMark } from './components/BrandMark'

export const metadata: Metadata = {
  title: 'planni Q&A',
  description: 'Live Q&A board — by planni',
}

const themeBootstrap = `
(function () {
  try {
    var stored = localStorage.getItem('qa-theme');
    var theme = stored || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', theme);
  } catch (e) {}
})();
`

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrap }} />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </head>
      <body>
        <div className="orbs" aria-hidden="true">
          <div className="orb orb-1" />
          <div className="orb orb-2" />
        </div>
        <BrandMark />
        <ThemeToggle />
        <main className="container">{children}</main>
        <footer className="site-footer">
          Mit Grüßen vom{' '}
          <a href="https://planni.de" target="_blank" rel="noopener noreferrer">
            planni-Team
          </a>
          .
        </footer>
      </body>
    </html>
  )
}
