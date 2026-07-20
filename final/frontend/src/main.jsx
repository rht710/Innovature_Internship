import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import axios from 'axios'
import './index.css'
import App from './App.jsx'

// Use environment-configured backend API URL in deploys, with a local fallback for development.
const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
axios.defaults.baseURL = apiBaseUrl;

axios.interceptors.request.use((config) => {
  if (config.url && config.url.startsWith('http://localhost:8000')) {
    config.url = config.url.replace('http://localhost:8000', apiBaseUrl);
  }
  return config;
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
