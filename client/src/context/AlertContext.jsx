import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

const AlertContext = createContext(null);

let alertIdCounter = 0;
let globalAlertDispatcher = null;

/**
 * Global standalone methods callable anywhere (even outside React components)
 */
export const showAlert = (message, type = 'info', title = null) => {
  if (globalAlertDispatcher) {
    globalAlertDispatcher(message, type, title);
  } else {
    console.log(`[Alert - ${type.toUpperCase()}]: ${message}`);
  }
};

export const showSuccess = (message, title = 'Operation Successful') => {
  showAlert(message, 'success', title);
};

export const showError = (message, title = 'Error') => {
  showAlert(message, 'error', title);
};

export const showWarning = (message, title = 'Warning') => {
  showAlert(message, 'warning', title);
};

export const showInfo = (message, title = 'Information') => {
  showAlert(message, 'info', title);
};

// Hook to access the alert system in React components
export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    return {
      showAlert,
      showSuccess,
      showError,
      showWarning,
      showInfo
    };
  }
  return context;
};

export function AlertProvider({ children }) {
  const [alerts, setAlerts] = useState([]);

  const removeAlert = useCallback((id) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const addAlert = useCallback((message, type = 'info', title = null, duration = 4500) => {
    if (!message) return;
    const id = ++alertIdCounter;
    
    // Auto format title if not provided
    const defaultTitle = 
      type === 'success' ? 'Operation Successful' :
      type === 'error' ? 'Action Failed' :
      type === 'warning' ? 'Notice' : 'Information';

    const newAlert = {
      id,
      message: typeof message === 'string' ? message : (message?.message || JSON.stringify(message)),
      type: type || 'info',
      title: title || defaultTitle,
      duration: duration || 4500,
      createdAt: Date.now()
    };

    setAlerts((prev) => [newAlert, ...prev.slice(0, 4)]); // Keep max 5 active alerts

    if (duration > 0) {
      setTimeout(() => {
        removeAlert(id);
      }, duration);
    }
  }, [removeAlert]);

  // Connect global dispatcher and window helpers
  useEffect(() => {
    globalAlertDispatcher = addAlert;
    
    window.showAlert = addAlert;
    window.showSuccess = (msg, title) => addAlert(msg, 'success', title || 'Operation Successful');
    window.showError = (msg, title) => addAlert(msg, 'error', title || 'Action Failed');
    window.showWarning = (msg, title) => addAlert(msg, 'warning', title || 'Notice');
    window.showInfo = (msg, title) => addAlert(msg, 'info', title || 'Information');

    // Also listen to custom 'app-alert' DOM events
    const handleCustomEvent = (e) => {
      if (e.detail) {
        addAlert(e.detail.message, e.detail.type, e.detail.title, e.detail.duration);
      }
    };
    window.addEventListener('app-alert', handleCustomEvent);

    return () => {
      globalAlertDispatcher = null;
      window.removeEventListener('app-alert', handleCustomEvent);
    };
  }, [addAlert]);

  return (
    <AlertContext.Provider value={{
      alerts,
      showAlert: addAlert,
      showSuccess: (msg, title) => addAlert(msg, 'success', title || 'Operation Successful'),
      showError: (msg, title) => addAlert(msg, 'error', title || 'Action Failed'),
      showWarning: (msg, title) => addAlert(msg, 'warning', title || 'Notice'),
      showInfo: (msg, title) => addAlert(msg, 'info', title || 'Information'),
      removeAlert
    }}>
      {children}
      <AlertContainer alerts={alerts} onDismiss={removeAlert} />
    </AlertContext.Provider>
  );
}

function AlertContainer({ alerts, onDismiss }) {
  if (!alerts || alerts.length === 0) return null;

  return (
    <div 
      className="alert-box-container"
      style={{
        position: 'fixed',
        top: '24px',
        right: '24px',
        zIndex: 999999,
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        maxWidth: '440px',
        width: 'calc(100vw - 36px)',
        pointerEvents: 'none'
      }}
    >
      {alerts.map((alert) => (
        <AlertItem key={alert.id} alert={alert} onDismiss={() => onDismiss(alert.id)} />
      ))}
    </div>
  );
}

function AlertItem({ alert, onDismiss }) {
  const [isPaused, setIsPaused] = useState(false);

  const isSuccess = alert.type === 'success';
  const isError = alert.type === 'error' || alert.type === 'danger';
  const isWarning = alert.type === 'warning';
  
  // Theme color palette
  const theme = isSuccess ? {
    bg: '#f0fdf4',
    border: '#86efac',
    strip: '#16a34a',
    iconColor: '#16a34a',
    titleColor: '#14532d',
    textColor: '#166534',
    iconBg: 'rgba(22, 163, 74, 0.12)',
    progress: '#22c55e',
    Icon: CheckCircle2
  } : isError ? {
    bg: '#fef2f2',
    border: '#fca5a5',
    strip: '#dc2626',
    iconColor: '#dc2626',
    titleColor: '#7f1d1d',
    textColor: '#991b1b',
    iconBg: 'rgba(220, 38, 38, 0.12)',
    progress: '#ef4444',
    Icon: AlertCircle
  } : isWarning ? {
    bg: '#fefce8',
    border: '#fde047',
    strip: '#d97706',
    iconColor: '#d97706',
    titleColor: '#78350f',
    textColor: '#92400e',
    iconBg: 'rgba(217, 119, 6, 0.12)',
    progress: '#f59e0b',
    Icon: AlertTriangle
  } : {
    bg: '#f0f9ff',
    border: '#7dd3fc',
    strip: '#0284c7',
    iconColor: '#0284c7',
    titleColor: '#0c4a6e',
    textColor: '#0369a1',
    iconBg: 'rgba(2, 132, 199, 0.12)',
    progress: '#38bdf8',
    Icon: Info
  };

  const IconComponent = theme.Icon;

  return (
    <div
      className="alert-box-item animate-slide-in-right"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      role="alert"
      style={{
        pointerEvents: 'auto',
        background: theme.bg,
        border: `1px solid ${theme.border}`,
        borderLeft: `5px solid ${theme.strip}`,
        borderRadius: '12px',
        padding: '14px 16px',
        boxShadow: '0 12px 32px -4px rgba(0, 0, 0, 0.18), 0 4px 12px rgba(0, 0, 0, 0.08)',
        backdropFilter: 'blur(10px)',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        animation: 'alertSlideIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        transition: 'all 0.2s ease'
      }}
    >
      {/* Icon */}
      <div
        style={{
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          background: theme.iconBg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          marginTop: '1px'
        }}
      >
        <IconComponent size={20} color={theme.iconColor} strokeWidth={2.4} />
      </div>

      {/* Content */}
      <div style={{ flex: 1, paddingRight: '6px' }}>
        <h4
          style={{
            margin: '0 0 3px 0',
            fontSize: '0.92rem',
            fontWeight: 800,
            color: theme.titleColor,
            letterSpacing: '-0.01em',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          {alert.title}
        </h4>
        <p
          style={{
            margin: 0,
            fontSize: '0.85rem',
            lineHeight: '1.4',
            color: theme.textColor,
            fontWeight: 500,
            wordBreak: 'break-word'
          }}
        >
          {alert.message}
        </p>
      </div>

      {/* Close button */}
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Close alert"
        style={{
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          padding: '4px',
          borderRadius: '6px',
          color: theme.titleColor,
          opacity: 0.65,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.15s ease',
          flexShrink: 0
        }}
        onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.background = 'rgba(0,0,0,0.06)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.65'; e.currentTarget.style.background = 'transparent'; }}
      >
        <X size={16} />
      </button>

      {/* Countdown progress bar */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: 'rgba(0,0,0,0.06)'
        }}
      >
        <div
          style={{
            height: '100%',
            background: theme.progress,
            width: '100%',
            animation: `alertProgressBar ${alert.duration}ms linear forwards`,
            animationPlayState: isPaused ? 'paused' : 'running'
          }}
        />
      </div>
    </div>
  );
}
