import { registerLicense } from '@syncfusion/ej2-base';
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles.css';

const license = import.meta.env.VITE_SYNCFUSION_LICENSE;
if (license) registerLicense(license);

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
