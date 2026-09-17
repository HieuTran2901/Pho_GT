import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import './utils/deviceIdUtils'
import { AuthProvider } from './context/AuthContext'
import { OnboardingTourProvider } from './context/OnboardingTourContext'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <OnboardingTourProvider>
        <App />
      </OnboardingTourProvider>
    </AuthProvider>
  </React.StrictMode>,
)
