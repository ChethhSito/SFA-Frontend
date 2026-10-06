import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { AcademicCatalogProvider } from './context/AcademicCatalogContext.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AcademicCatalogProvider><App /></AcademicCatalogProvider>
  </StrictMode>,
);
