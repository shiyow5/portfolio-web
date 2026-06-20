import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { ModeProvider } from './lib/mode';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ModeProvider>
        <App />
      </ModeProvider>
    </BrowserRouter>
  </StrictMode>,
);
