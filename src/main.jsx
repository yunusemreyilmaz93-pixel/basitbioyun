import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { I18nProvider } from './i18n/I18nProvider.jsx'
import { DATA_SOURCE } from './schema.js'
import { hydrateFromSupabase, getDataStatus } from './dataLayer.js'
import { isSupabaseConfigured } from './lib/supabase.js'

function showBoot(msg, sub = 'Supabase warehouse yükleniyor…') {
  const el = document.getElementById('root')
  if (!el) return
  el.innerHTML = `
    <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;
      background:#09090b;color:#a1a1aa;font-family:Inter,system-ui,sans-serif;padding:24px;text-align:center">
      <div>
        <div style="font-size:13px;letter-spacing:.16em;text-transform:uppercase;color:#71717a;margin-bottom:12px">BasitBiOyun</div>
        <div style="font-size:18px;color:#fafafa;font-weight:600;margin-bottom:8px">${msg}</div>
        <div style="font-size:13px;color:#71717a">${sub}</div>
      </div>
    </div>
  `
}

function withTimeout(promise, ms, label) {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error(`${label} timeout after ${ms}ms`)), ms)
    }),
  ])
}

function mountApp() {
  const el = document.getElementById('root')
  if (!el) return
  // Clear boot splash so React mounts cleanly
  el.innerHTML = ''
  createRoot(el).render(
    <StrictMode>
      <I18nProvider>
        <App />
      </I18nProvider>
    </StrictMode>,
  )
}

async function boot() {
  const wantLive =
    isSupabaseConfigured &&
    (DATA_SOURCE.mode === 'supabase' || import.meta.env.VITE_DATA_MODE === 'supabase')

  if (wantLive) {
    showBoot('Gerçek veriler bağlanıyor', 'Oyuncular ve kulüpler yükleniyor…')
    try {
      // Hard cap: never block the UI more than 25s
      await withTimeout(hydrateFromSupabase(), 25000, 'hydrate')
      const s = getDataStatus()
      console.info('[basitbioyun] hydrated', s.counts)
    } catch (err) {
      console.warn('[basitbioyun] Supabase hydrate failed — mock fallback', err)
      showBoot('Bağlantı yavaş / hata', 'Mock veri ile açılıyor…')
      await new Promise((r) => setTimeout(r, 400))
    }
  }

  try {
    mountApp()
  } catch (err) {
    console.error('[basitbioyun] render failed', err)
    showBoot('Arayüz açılamadı', String(err?.message || err))
  }
}

boot().catch((err) => {
  console.error('[basitbioyun] boot crashed', err)
  showBoot('Başlatma hatası', String(err?.message || err))
  // Last resort: try mock UI
  try {
    mountApp()
  } catch {
    /* ignore */
  }
})
