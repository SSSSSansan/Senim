import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import StaffApp from './StaffApp.tsx'

const isStaff = window.location.pathname.startsWith('/staff');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isStaff ? <StaffApp /> : <App />}
  </StrictMode>,
)
