import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { MotionConfig } from 'motion/react';
import App from './App';
import { ModeProvider } from './lib/mode';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ModeProvider>
      <MotionConfig reducedMotion="user">
        <App />
      </MotionConfig>
    </ModeProvider>
  </StrictMode>,
);
