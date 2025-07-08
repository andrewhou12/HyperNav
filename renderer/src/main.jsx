import './index.css'; 
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import CortexLauncher from './CortexLauncher.tsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <CortexLauncher/>
  </StrictMode>,
)
