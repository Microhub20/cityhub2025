import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

// Title-Element aktualisieren
document.title = "CityHub Admin"

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)