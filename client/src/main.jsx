// Application entry point - mounts React app into the DOM
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom' // enables client-side routing
import AppContextProvider from './context/AppContext.jsx' // global state provider

// Wrap app with BrowserRouter (routing) and AppContextProvider (global state)
// Order matters - AppContext uses useNavigate which requires BrowserRouter to be above it
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AppContextProvider>
        <App />
      </AppContextProvider>
    </BrowserRouter>
  </StrictMode>
)
