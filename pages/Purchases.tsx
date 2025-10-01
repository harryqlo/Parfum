import React, { useState, useEffect, useMemo } from 'react';
import { useData } from '../context/DataContext';
import Modal from '../components/Modal';
import { Purchase, DocumentType } from '../types';
import { EditIcon, DeleteIcon, ShoppingCartIcon, ArrowUpIcon, ArrowDownIcon } from '../components/Icons';
import { useNotification } from '../context/NotificationContext';
import { formatCurrency } from '../utils/helpers';

type SortablePurchaseKeys = keyof Purchase | 'productName' | 'total';

const Purchases: React.FC = () => {
  const { purchases, products, addPurchase, updatePurchase, deletePurchase } = useData();
  const { showConfirmation, showToast } = useNotification();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPurchase, setEditingPurchase] = useState<Purchase | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: SortablePurchaseKeys; direction: 'ascending' | 'descending' } | null>({ key: 'date', direction: 'descending' });

  const extendedPurchases = useMemo(() => purchases.map(purchase => {
    const product = products.find(p => p.id === purchase.productId);
    return {
      ...purchase,
      productName: product ? product.name : 'N/A',
      total: purchase.quantity * purchase.unitCost
    };
  }), [purchases, products]);

  const sortedPurchases = useMemo(() => {
    let sortableItems = [...extendedPurchases];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        const aValue = a[sortConfig.key as keyof typeof a];
        const bValue = b[sortConfig.key as keyof typeof b];
        
        if (aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [extendedPurchases, sortConfig]);

  const requestSort = (key: SortablePurchaseKeys) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key: SortablePurchaseKeys) => {
    if (!sortConfig || sortConfig.key !== key) {
      return null;
    }
    return sortConfig.direction === 'ascending' ? <ArrowUpIcon className="h-4 w-4 ml-1" /> : <ArrowDownIcon className="h-4 w-4 ml-1" />;
  };

  const getInitialFormData = () => ({
    productId: products.length > 0 ? products[0].id : '',
    date: new Date().toISOString().split('T')[0],
    quantity: 1,
    unitCost: products.length > 0 ? products[0].costPrice : 0,
    supplier: '',
    documentType: DocumentType.BOLETA,
    documentNumber: ''
  });

  const [formData, setFormData] = useState(getInitialFormData());

  useEffect(() => {
    if (isModalOpen) {
      if (editingPurchase) {
        setFormData({
          productId: editingPurchase.productId,
          date: editingPurchase.date,
          quantity: editingPurchase.quantity,
          unitCost: editingPurchase.unitCost,
          supplier: editingPurchase.supplier,
          documentType: editingPurchase.documentType,
          documentNumber: editingPurchase.documentNumber
        });
      } else {
        setFormData(getInitialFormData());
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingPurchase, isModalOpen, products]);

  const handleOpenModalForCreate = () => {
    setEditingPurchase(null);
    setIsModalOpen(true);
  };

  const handleOpenModalForEdit = (purchase: Purchase) => {
    setEditingPurchase(purchase);
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPurchase(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'quantity' || name === 'unitCost' ? parseFloat(value) || 0 : value }));
  };
  
  const handleProductSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const productId = e.target.value;
      const product = products.find(p => p.id === productId);
      setFormData(prev => ({
          ...prev,
          productId,
          unitCost: product ? product.costPrice : 0
      }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = editingPurchase ? updatePurchase(formData, editingPurchase) : addPurchase(formData);
    if(result.success) {
        showToast(result.message, 'success');
        handleCloseModal();
    } else {
        showToast(result.message, 'error');
    }
  };

  const handleDelete = (purchaseId: string) => {
    showConfirmation({
        title: 'Eliminar Compra',
        message: '¿Estás seguro de que quieres eliminar esta compra? El stock del producto se ajustará automáticamente.',
        onConfirm: () => {
            const result = deletePurchase(purchaseId);
            showToast(result.message, 'success');
        },
        confirmText: 'Sí, eliminar'
    });
  };

  const SortableHeader: React.FC<{ sortKey: SortablePurchaseKeys; children: React.ReactNode }> = ({ sortKey, children }) => (
    <th className="p-4 font-semibold cursor-pointer text-left" onClick={() => requestSort(sortKey)}>
      <div className="flex items-center">{children} {getSortIcon(sortKey)}</div>
    </th>
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Compras</h1>
        <button onClick={handleOpenModalForCreate} className="bg-accent hover:bg-accent-hover text-white font-bold py-2 px-4 rounded-lg transition-colors shadow-md" disabled={products.length === 0}>
          Registrar Compra
        </button>
      </div>

      <div className="bg-primary rounded-xl shadow-md overflow-hidden border border-border">
        {purchases.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingCartIcon className="mx-auto h-16 w-16 text-gray-300" />
            <h3 className="mt-4 text-lg font-semibold text-text-primary">No hay compras registradas</h3>
            <p className="mt-1 text-sm text-text-secondary">Haz clic en "Registrar Compra" para añadir la primera.</p>
          </div>
        ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary">
              <tr>
                <SortableHeader sortKey="date">Fecha</SortableHeader>
                <SortableHeader sortKey="productName">Producto</SortableHeader>
                <SortableHeader sortKey="quantity">Cantidad</SortableHeader>
                <SortableHeader sortKey="unitCost">Costo Unit.</SortableHeader>
                <SortableHeader sortKey="total">Total</SortableHeader>
                <SortableHeader sortKey="supplier">Proveedor</SortableHeader>
                <SortableHeader sortKey="documentType">Tipo Doc.</SortableHeader>
                <SortableHeader sortKey="documentNumber">Nº Doc.</SortableHeader>
                <th className="p-4 font-semibold text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {sortedPurchases.map(purchase => (
                  <tr key={purchase.id} className="border-b border-border hover:bg-secondary/50 transition-colors">
                    <td className="p-4 text-left">{purchase.date}</td>
                    <td className="p-4 text-left">{purchase.productName}</td>
                    <td className="p-4 text-left">{purchase.quantity}</td>
                    <td className="p-4 text-left">{formatCurrency(purchase.unitCost)}</td>
                    <td className="p-4 font-medium text-left">{formatCurrency(purchase.total)}</td>
                    <td className="p-4 text-left">{purchase.supplier}</td>
                    <td className="p-4 text-xs font-mono text-left">{purchase.documentType}</td>
                    <td className="p-4 text-left">{purchase.documentNumber}</td>
                    <td className="p-4 text-left">
                      <div className="flex items-center space-x-2">
                        <button onClick={() => handleOpenModalForEdit(purchase)} className="text-accent hover:text-accent-hover p-1"><EditIcon className="w-5 h-5"/></button>
                        <button onClick={() => handleDelete(purchase.id)} className="text-danger hover:opacity-75 p-1"><DeleteIcon className="w-5 h-5"/></button>
                      </div>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingPurchase ? "Editar Compra" : "Registrar Nueva Compra"}>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
            <div className="md:col-span-2">
              <label htmlFor="productId" className="block text-sm font-medium text-text-secondary">Producto</label>
              <select name="productId" id="productId" value={formData.productId} onChange={handleProductSelect} className="mt-1 block w-full bg-secondary border-border rounded-md shadow-sm focus:ring-accent focus:border-accent" required autoFocus>
                {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.id})</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-text-secondary">Fecha</label>
              <input type="date" name="date" id="date" value={formData.date} onChange={handleInputChange} className="mt-1 block w-full bg-secondary border-border rounded-md shadow-sm focus:ring-accent focus:border-accent" required />
            </div>
            <div>
              <label htmlFor="quantity" className="block text-sm font-medium text-text-secondary">Cantidad</label>
              <input type="number" name="quantity" id="quantity" min="1" value={formData.quantity} onChange={handleInputChange} className="mt-1 block w-full bg-secondary border-border rounded-md shadow-sm focus:ring-accent focus:border-accent" required />
            </div>
            <div>
              <label htmlFor="unitCost" className="block text-sm font-medium text-text-secondary">Costo Unitario</label>
              <div className="relative mt-1">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <input type="number" name="unitCost" id="unitCost" min="0" value={formData.unitCost} onChange={handleInputChange} className="block w-full bg-secondary border-border rounded-md shadow-sm focus:ring-accent focus:border-accent pl-7" required />
              </div>
            </div>
            <div>
              <label htmlFor="supplier" className="block text-sm font-medium text-text-secondary">Proveedor</label>
              <input type="text" name="supplier" id="supplier" value={formData.supplier} onChange={handleInputChange} className="mt-1 block w-full bg-secondary border-border rounded-md shadow-sm focus:ring-accent focus:border-accent" required />
            </div>
            <div>
              <label htmlFor="documentType" className="block text-sm font-medium text-text-secondary">Tipo Documento</label>
              <select name="documentType" id="documentType" value={formData.documentType} onChange={handleInputChange} className="mt-1 block w-full bg-secondary border-border rounded-md shadow-sm focus:ring-accent focus:border-accent">
                  {Object.values(DocumentType).map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="documentNumber" className="block text-sm font-medium text-text-secondary">Nº Documento</label>
              <input type="text" name="documentNumber" id="documentNumber" value={formData.documentNumber} onChange={handleInputChange} className="mt-1 block w-full bg-secondary border-border rounded-md shadow-sm focus:ring-accent focus:border-accent" />
            </div>
          </div>
          <div className="flex justify-end pt-6 space-x-2">
            <button type="button" onClick={handleCloseModal} className="bg-secondary hover:bg-border text-text-primary font-bold py-2 px-4 rounded-lg transition-colors">Cancelar</button>
            <button type="submit" className="bg-accent hover:bg-accent-hover text-white font-bold py-2 px-4 rounded-lg transition-colors">{editingPurchase ? 'Guardar Cambios' : 'Guardar Compra'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Purchases;