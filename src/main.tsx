import { StrictMode } from 'react';
import { Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import 'animate.css';
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Suspense fallback={''}>
    <App />
    </Suspense>
  </StrictMode>
);
