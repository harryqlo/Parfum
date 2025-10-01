import React from 'react';
import { useNotification } from '../context/NotificationContext';
import { WarningIcon } from './Icons';

const ConfirmationModal: React.FC = () => {
  const { isConfirmationOpen, confirmationConfig, hideConfirmation } = useNotification();

  if (!isConfirmationOpen || !confirmationConfig) return null;

  const { title, message, onConfirm, confirmText = 'Confirmar', cancelText = 'Cancelar' } = confirmationConfig;

  const handleConfirm = () => {
    onConfirm();
    hideConfirmation();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4 transition-opacity duration-300 animate-fade-in">
      <div className="bg-primary rounded-lg shadow-xl w-full max-w-md border border-border transform transition-transform duration-300 animate-slide-up">
        <div className="p-6">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 h-12 w-12 flex items-center justify-center rounded-full bg-red-100">
                <WarningIcon className="h-6 w-6 text-danger" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
              <p className="mt-2 text-sm text-text-secondary">{message}</p>
            </div>
          </div>
        </div>
        <div className="bg-secondary px-6 py-3 flex justify-end space-x-3 rounded-b-lg">
          <button
            type="button"
            onClick={hideConfirmation}
            className="bg-primary hover:bg-gray-100 border border-border text-text-primary font-bold py-2 px-4 rounded-lg transition-colors"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="bg-danger hover:opacity-80 text-white font-bold py-2 px-4 rounded-lg transition-colors"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
