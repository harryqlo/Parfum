import React, { useState } from 'react';
import Modal from './Modal';
import { useData } from '../context/DataContext';
import { useNotification } from '../context/NotificationContext';
import { Customer } from '../types';

interface QuickAddCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCustomerAdded: (customer: Customer) => void;
}

const QuickAddCustomerModal: React.FC<QuickAddCustomerModalProps> = ({ isOpen, onClose, onCustomerAdded }) => {
  const { addCustomer } = useData();
  const { showToast } = useNotification();
  const [formData, setFormData] = useState({ name: '', phone: '' });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
        showToast("El nombre del cliente es obligatorio.", "error");
        return;
    }
    const result = addCustomer({ ...formData, email: '', notes: '' });
    if (result.success && result.newCustomer) {
      showToast(result.message, 'success');
      onCustomerAdded(result.newCustomer);
      onClose();
      setFormData({ name: '', phone: '' });
    } else {
      showToast(result.message, 'error');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Agregar Cliente Rápido">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="quick-name" className="block text-sm font-medium text-text-secondary">Nombre Completo</label>
          <input type="text" name="name" id="quick-name" value={formData.name} onChange={handleInputChange} className="mt-1 block w-full bg-secondary border-border rounded-md shadow-sm focus:ring-accent focus:border-accent" required autoFocus />
        </div>
        <div>
          <label htmlFor="quick-phone" className="block text-sm font-medium text-text-secondary">Teléfono (Opcional)</label>
          <input type="tel" name="phone" id="quick-phone" value={formData.phone} onChange={handleInputChange} className="mt-1 block w-full bg-secondary border-border rounded-md shadow-sm focus:ring-accent focus:border-accent" />
        </div>
        <div className="flex justify-end pt-4 space-x-2">
          <button type="button" onClick={onClose} className="bg-secondary hover:bg-border text-text-primary font-bold py-2 px-4 rounded-lg transition-colors">Cancelar</button>
          <button type="submit" className="bg-accent hover:bg-accent-hover text-white font-bold py-2 px-4 rounded-lg transition-colors">Guardar Cliente</button>
        </div>
      </form>
    </Modal>
  );
};

export default QuickAddCustomerModal;