import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ChatbotProvider } from './context/ChatbotContext.jsx';
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ChatbotProvider>
      <App />
    </ChatbotProvider>
  </StrictMode>,
)