import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { MotionConfig } from 'motion/react';
import App from './App';
import { ModeProvider } from './lib/mode';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ModeProvider>
        <MotionConfig reducedMotion="user">
          <App />
        </MotionConfig>
      </ModeProvider>
    </BrowserRouter>
  </StrictMode>,
);
