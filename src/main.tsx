import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { AcademicCatalogProvider } from './context/AcademicCatalogContext.tsx';
import './index.css';

// 🛡️ Capa 1: Blindaje contra Pantallas Blancas y Fallos de Fragmentos Desactualizados (Stale Chunks)
const RELOAD_KEY = 'sfa_chunk_reload_timestamp';
const RELOAD_COOLDOWN = 10000; // 10 segundos de enfriamiento para prevenir bucles de recarga

function triggerSafeReload() {
  try {
    const lastReload = sessionStorage.getItem(RELOAD_KEY);
    const now = Date.now();
    if (!lastReload || now - parseInt(lastReload, 10) > RELOAD_COOLDOWN) {
      sessionStorage.setItem(RELOAD_KEY, now.toString());
      window.location.reload();
    }
  } catch {
    window.location.reload();
  }
}

// Interceptor global nativo de Vite cuando falla la descarga de un chunk por nueva versión en producción
window.addEventListener('vite:preloadError', (event) => {
  event.preventDefault();
  triggerSafeReload();
});

// Interceptor global de promesas rechazadas por fallos de red al cargar módulos dinámicos
window.addEventListener('unhandledrejection', (event) => {
  const msg = String(event.reason?.message || event.reason || '');
  if (/Failed to fetch dynamically imported module|error loading dynamically imported module|Importing a module script failed/i.test(msg)) {
    event.preventDefault();
    triggerSafeReload();
  }
});

// Registro de Service Worker para persistencia offline y caché de imágenes
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}

// Retira una sola vez las cachés del conjunto anterior; MongoDB es la fuente de datos.
if (localStorage.getItem('demo_dataset_version') !== '2026-11-10') {
  for (const key of Object.keys(localStorage)) {
    if (/^(sfa_|maf_|mpa_)/.test(key)) localStorage.removeItem(key);
  }
  localStorage.setItem('demo_dataset_version', '2026-11-10');
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AcademicCatalogProvider><App /></AcademicCatalogProvider>
  </StrictMode>,
);
