import React from 'react';
import { useNotification } from '../context/NotificationContext';
import Toast from './Toast';

const ToastContainer: React.FC = () => {
  const { toasts, hideToast } = useNotification();

  return (
    <div className="fixed top-5 right-5 z-[100] w-full max-w-sm space-y-3">
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => hideToast(toast.id)}
        />
      ))}
    </div>
  );
};

export default ToastContainer;
