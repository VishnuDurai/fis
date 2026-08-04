import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone } from 'lucide-react';

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      // Prevent default browser install banner
      e.preventDefault();
      setDeferredPrompt(e);
      // Check if user hasn't dismissed recently
      const dismissed = localStorage.getItem('srec_pwa_install_dismissed');
      if (!dismissed) {
        setShowPrompt(true);
      }
    };

    const handleAppInstalled = () => {
      setShowPrompt(false);
      setDeferredPrompt(null);
      console.log('SREC FIS PWA was successfully installed.');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      console.log('User accepted the PWA install prompt');
    } else {
      console.log('User dismissed the PWA install prompt');
    }
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('srec_pwa_install_dismissed', 'true');
  };

  if (!showPrompt) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      zIndex: 9999,
      backgroundColor: '#15583b',
      color: '#ffffff',
      padding: '14px 18px',
      borderRadius: '12px',
      boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
      display: 'flex',
      alignItems: 'center',
      gap: '14px',
      maxWidth: '380px',
      animation: 'fadeIn 0.3s ease-out'
    }}>
      <div style={{
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        padding: '10px',
        borderRadius: '10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Smartphone size={24} color="#ffffff" />
      </div>

      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: '600', fontSize: '14px', marginBottom: '2px' }}>
          Install SREC FIS App
        </div>
        <div style={{ fontSize: '12px', opacity: 0.88, lineHeight: '1.3' }}>
          Install for offline access and quicker portal launch on your device.
        </div>
      </div>

      <button
        onClick={handleInstallClick}
        style={{
          backgroundColor: '#ffffff',
          color: '#15583b',
          border: 'none',
          padding: '7px 14px',
          borderRadius: '6px',
          fontWeight: '600',
          fontSize: '13px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          whiteSpace: 'nowrap',
          transition: 'all 0.2s ease'
        }}
        onMouseOver={(e) => e.target.style.backgroundColor = '#f0fdf4'}
        onMouseOut={(e) => e.target.style.backgroundColor = '#ffffff'}
      >
        <Download size={14} /> Install
      </button>

      <button
        onClick={handleDismiss}
        title="Dismiss"
        style={{
          background: 'none',
          border: 'none',
          color: '#ffffff',
          opacity: 0.7,
          cursor: 'pointer',
          padding: '4px',
          display: 'flex',
          alignItems: 'center'
        }}
        onMouseOver={(e) => e.target.style.opacity = '1'}
        onMouseOut={(e) => e.target.style.opacity = '0.7'}
      >
        <X size={16} />
      </button>
    </div>
  );
}
