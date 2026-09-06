import { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { isSeeded, seedDemoData } from './services/store'
import { authApi } from './services/auth'
import './index.css'

/** Basename = chemin de base Vite (ex. '/jsb2027-platform/' sur GitHub Pages). */
const basename = import.meta.env.BASE_URL

function Boot({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function init() {
      try {
        if (!(await isSeeded())) await seedDemoData()
        await authApi.ensureDefaultAdmin()
        setReady(true)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Erreur d’initialisation')
      }
    }
    void init()
  }, [])

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-forest-50 px-4">
        <div className="rounded-2xl border border-red-200 bg-white p-6 text-center text-sm text-red-600">
          {error}
        </div>
      </div>
    )
  }
  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-forest-50">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-forest-300 border-t-forest-500" />
      </div>
    )
  }
  return children
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename={basename}>
      <Boot>
        <App />
      </Boot>
    </BrowserRouter>
  </StrictMode>,
)
