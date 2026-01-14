import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { LiffProvider } from './context/LiffContext'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <LiffProvider>
      <App />
    </LiffProvider>
  </StrictMode>,
)
