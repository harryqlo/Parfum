import React, { useEffect } from 'react';
import { CheckCircleIcon, ExclamationCircleIcon, CloseIcon } from './Icons';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
}

const icons = {
  success: <CheckCircleIcon className="w-6 h-6 text-white" />,
  error: <ExclamationCircleIcon className="w-6 h-6 text-white" />,
  info: null,
};

const bgColors = {
  success: 'bg-success',
  error: 'bg-danger',
  info: 'bg-gray-800',
};

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000); // Auto-dismiss after 5 seconds

    return () => {
      clearTimeout(timer);
    };
  }, [onClose]);

  return (
    <div className={`flex items-center text-white p-4 rounded-lg shadow-lg ${bgColors[type]} animate-toast-in`}>
      {icons[type] && <div className="flex-shrink-0">{icons[type]}</div>}
      <div className="ml-3 text-sm font-medium flex-1">{message}</div>
      <button onClick={onClose} className="ml-auto -mx-1.5 -my-1.5 p-1.5 rounded-lg inline-flex h-8 w-8 hover:bg-white/20 transition-colors">
        <CloseIcon className="w-5 h-5" />
      </button>
    </div>
  );
};

export default Toast;
