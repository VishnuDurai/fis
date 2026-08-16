import React, { useState, useEffect } from 'react';
import { Download, X, Share } from 'lucide-react';
import { showInfo } from '../context/AlertContext.jsx';

export default function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [showIosModal, setShowIosModal] = useState(false);

  useEffect(() => {
    // Check if already installed (standalone mode)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    if (isStandalone) {
      setShowBanner(false);
      return;
    }

    // Check if iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIphoneOrIpad = /iphone|ipad|ipod/.test(userAgent);
    if (isIphoneOrIpad) {
      setIsIos(true);
      // Show iOS banner if not dismissed before
      const dismissed = localStorage.getItem('srec_pwa_dismissed');
      if (!dismissed) {
        setShowBanner(true);
      }
      return;
    }

    // Listen for Chrome / Android beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      const dismissed = localStorage.getItem('srec_pwa_dismissed');
      if (!dismissed) {
        setShowBanner(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIos) {
      setShowIosModal(true);
      return;
    }

    if (!deferredPrompt) {
      // Fallback instruction
      showInfo("To install SREC FIS App:\n\n1. Open browser menu (⋮)\n2. Tap 'Install app' or 'Add to Home Screen'");
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem('srec_pwa_dismissed', 'true');
  };

  if (!showBanner) return null;

  return (
    <>
      <div style={{
        position: 'fixed',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9999,
        width: '92%',
        maxWidth: '460px',
        background: '#0f331f',
        color: '#ffffff',
        padding: '14px 18px',
        borderRadius: '16px',
        boxShadow: '0 12px 35px rgba(0, 0, 0, 0.35)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        border: '1.5px solid #1e7049',
        animation: 'slideUp 0.3s ease-out'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img src="/logo.png" alt="SREC FIS" style={{ width: '38px', height: '38px', borderRadius: '8px', background: '#fff', padding: '2px', objectFit: 'contain' }} />
          <div>
            <div style={{ fontWeight: 800, fontSize: '0.92rem', color: '#ffffff' }}>Install SREC FIS Mobile App</div>
            <div style={{ fontSize: '0.78rem', color: '#a7f3d0' }}>
              {isIos ? 'Tap for iPhone installation steps' : 'Fast, offline access from your home screen'}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={handleInstallClick}
            className="btn btn-primary"
            style={{
              padding: '8px 14px',
              fontSize: '0.82rem',
              fontWeight: 800,
              background: '#10b981',
              color: '#064e3b',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Download size={15} /> Install
          </button>
          <button
            onClick={handleDismiss}
            style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* iOS Installation Helper Modal */}
      {showIosModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#ffffff', color: '#0f172a', borderRadius: '20px', padding: '28px', maxWidth: '380px', width: '100%', textAlign: 'center', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
            <img src="/logo.png" alt="SREC Logo" style={{ height: '54px', marginBottom: '12px', objectFit: 'contain' }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '8px' }}>Install on iPhone / iPad</h3>
            <p style={{ fontSize: '0.88rem', color: '#475569', marginBottom: '20px' }}>
              Follow these simple steps in Safari to add SREC FIS to your Home Screen:
            </p>

            <div style={{ textAlign: 'left', background: '#f8fafc', padding: '16px', borderRadius: '12px', marginBottom: '20px', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ background: '#10b981', color: '#fff', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem' }}>1</span>
                <span>Tap the <strong>Share</strong> button <Share size={16} style={{ display: 'inline', verticalAlign: 'middle', color: '#0284c7' }} /> at the bottom of Safari.</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ background: '#10b981', color: '#fff', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem' }}>2</span>
                <span>Scroll down and tap <strong>"Add to Home Screen"</strong> (➕).</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ background: '#10b981', color: '#fff', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem' }}>3</span>
                <span>Tap <strong>Add</strong> in the top right corner.</span>
              </div>
            </div>

            <button
              onClick={() => setShowIosModal(false)}
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px', borderRadius: '10px', fontWeight: 800 }}
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </>
  );
}
