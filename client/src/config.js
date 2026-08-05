// Centralized API and Backend Base URL Configuration
const getApiBaseUrl = () => {
  let url = '';

  if (typeof window !== 'undefined' && window.__API_BASE_URL__) {
    url = window.__API_BASE_URL__;
  } else if (typeof window !== 'undefined' && localStorage.getItem('srec_api_url')) {
    url = localStorage.getItem('srec_api_url');
  } else if (import.meta.env.VITE_API_BASE_URL) {
    url = import.meta.env.VITE_API_BASE_URL;
  } else if (import.meta.env.VITE_API_URL) {
    url = import.meta.env.VITE_API_URL;
  } else if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    url = 'http://localhost:5001';
  } else if (typeof window !== 'undefined') {
    url = window.location.origin;
  }

  url = (url || '').trim().replace(/\/+$/, '');

  // Prevent mixed content errors on HTTPS deployments (e.g. Render)
  if (typeof window !== 'undefined' && window.location.protocol === 'https:' && url.startsWith('http://') && !url.includes('localhost') && !url.includes('127.0.0.1')) {
    url = url.replace('http://', 'https://');
  }

  return url;
};

export const API_BASE_URL = getApiBaseUrl();
