import React from "react";
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
document.body.classList.add('no-hover-anim');
createRoot(document.getElementById("root")!).render(<App />);
