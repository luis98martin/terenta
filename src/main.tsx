import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { LanguageProvider } from './contexts/LanguageContext.tsx'
import './index.css'
import './styles/hero-utilities.css'

document.body.classList.add('no-hover-anim');
createRoot(document.getElementById("root")!).render(
  <LanguageProvider>
    <App />
  </LanguageProvider>
);
