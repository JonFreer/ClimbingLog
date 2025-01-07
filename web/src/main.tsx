import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter, createBrowserRouter, RouterProvider } from 'react-router';
import { Login } from './components/login.tsx';



// createRoot(document.getElementById('root')!).render(
//   <StrictMode>
//     <App />
//   </StrictMode>,
// )

createRoot(document.getElementById('root')!).render(
  <StrictMode>

    <App></App>

  </StrictMode>,
)