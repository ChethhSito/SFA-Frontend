import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { AcademicCatalogProvider } from './context/AcademicCatalogContext.tsx';
import './index.css';

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
