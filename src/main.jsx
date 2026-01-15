import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { LiffProvider } from './context/LiffContext'
import { CardProvider } from './store/cardStore.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <LiffProvider>
      <CardProvider>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </CardProvider>
    </LiffProvider>
  </StrictMode>,
)
