import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// import './index.css'
import App from './App.jsx'


 //import publishable key from .env to access clerk
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

//if it doesn't exit throw this error so we know to add it to env
if (!PUBLISHABLE_KEY) {
  throw new Error('Missing Publishable Key')
}

//adding clerk provider. adds session and user context to clerk components so they can run appropriately
 import { ClerkProvider } from '@clerk/clerk-react'

createRoot(document.getElementById('root')).render(
  <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
  <StrictMode>
    <App />
  </StrictMode>
  </ClerkProvider>,
)
