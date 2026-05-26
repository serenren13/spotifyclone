import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { SpotifyProvider } from './context/SpotifyContext'
import { ThemeProvider } from './context/ThemeContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SpotifyProvider>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </SpotifyProvider>
  </StrictMode>,
)
