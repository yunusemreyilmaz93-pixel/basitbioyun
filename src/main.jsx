import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { I18nProvider } from './i18n/I18nProvider.jsx'
import { DATA_SOURCE } from './schema.js'
import { hydrateFromSupabase } from './dataLayer.js'

async function boot() {
  if (DATA_SOURCE.mode === 'supabase') {
    try {
      await hydrateFromSupabase()
      console.info('[basitbioyun] data hydrated from Supabase')
    } catch (err) {
      console.warn('[basitbioyun] Supabase hydrate failed — using mock fallback', err)
    }
  }

  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <I18nProvider>
        <App />
      </I18nProvider>
    </StrictMode>,
  )
}

boot()
