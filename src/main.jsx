import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { I18nProvider } from './i18n/I18nProvider.jsx'
import { DATA_SOURCE } from './schema.js'
import { hydrateFromSupabase, getDataStatus } from './dataLayer.js'
import { isSupabaseConfigured } from './lib/supabase.js'

function showBoot(msg) {
  const el = document.getElementById('root')
  if (!el) return
  el.innerHTML = `
    <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;
      background:#09090b;color:#a1a1aa;font-family:Inter,system-ui,sans-serif;padding:24px;text-align:center">
      <div>
        <div style="font-size:13px;letter-spacing:.16em;text-transform:uppercase;color:#71717a;margin-bottom:12px">BasitBiOyun</div>
        <div style="font-size:18px;color:#fafafa;font-weight:600;margin-bottom:8px">${msg}</div>
        <div style="font-size:13px;color:#52525b">Supabase warehouse yükleniyor…</div>
      </div>
    </div>
  `
}

async function boot() {
  const wantLive =
    isSupabaseConfigured &&
    (DATA_SOURCE.mode === 'supabase' || import.meta.env.VITE_DATA_MODE === 'supabase')

  if (wantLive) {
    showBoot('Gerçek veriler bağlanıyor')
    try {
      await hydrateFromSupabase()
      const s = getDataStatus()
      console.info('[basitbioyun] hydrated', s.counts)
    } catch (err) {
      console.warn('[basitbioyun] Supabase hydrate failed — mock fallback', err)
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
