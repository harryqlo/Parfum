import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';

interface ConfirmationConfig {
  title: string;
  message: string;
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
}

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface NotificationContextType {
  showConfirmation: (config: ConfirmationConfig) => void;
  hideConfirmation: () => void;
  isConfirmationOpen: boolean;
  confirmationConfig: ConfirmationConfig | null;
  toasts: Toast[];
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  hideToast: (id: number) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [confirmationConfig, setConfirmationConfig] = useState<ConfirmationConfig | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showConfirmation = (config: ConfirmationConfig) => {
    setConfirmationConfig(config);
    setIsConfirmationOpen(true);
  };

  const hideConfirmation = () => {
    setIsConfirmationOpen(false);
    setTimeout(() => setConfirmationConfig(null), 300);
  };

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
  }, []);

  const hideToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const value = { showConfirmation, hideConfirmation, isConfirmationOpen, confirmationConfig, toasts, showToast, hideToast };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};