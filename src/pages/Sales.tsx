import React, { useState, useEffect, useMemo } from 'react';
import { useData } from '../context/DataContext';
import Modal from '../components/Modal';
import { Sale } from '../types';
import { EditIcon, DeleteIcon, DollarSignIcon, ArrowUpIcon, ArrowDownIcon } from '../components/Icons';
import { useNotification } from '../context/NotificationContext';
import { formatCurrency } from '../utils/helpers';
import DataTable from '../components/DataTable';

type SortableSaleKeys = keyof Sale | 'productName' | 'customerName';

const Sales: React.FC = () => {
  const { sales, products, customers, addSale, updateSale, deleteSale } = useData();
  const { showConfirmation, showToast } = useNotification();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: SortableSaleKeys; direction: 'ascending' | 'descending' } | null>({ key: 'date', direction: 'descending' });

  const extendedSales = useMemo(() => sales.map(sale => {
    const product = products.find(p => p.id === sale.productId);
    const customer = customers.find(c => c.id === sale.customerId);
    return {
      ...sale,
      productName: product ? product.name : 'N/A',
      customerName: customer ? customer.name : 'Cliente General',
    };
  }), [sales, products, customers]);

  const sortedSales = useMemo(() => {
    let sortableItems = [...extendedSales];
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
  }, [extendedSales, sortConfig]);

  const requestSort = (key: SortableSaleKeys) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key: SortableSaleKeys) => {
    if (!sortConfig || sortConfig.key !== key) {
      return null;
    }
    return sortConfig.direction === 'ascending' ? <ArrowUpIcon className="h-4 w-4 ml-1" /> : <ArrowDownIcon className="h-4 w-4 ml-1" />;
  };

  const getInitialFormData = () => ({
    productId: products.length > 0 ? products[0].id : '',
    date: new Date().toISOString().split('T')[0],
    quantity: 1,
    unitPrice: products.length > 0 ? products[0].salePrice : 0,
    customerId: ''
  });

  const [formData, setFormData] = useState(getInitialFormData());

  useEffect(() => {
    if (isModalOpen) {
      if (editingSale) {
        setFormData({
          productId: editingSale.productId,
          date: editingSale.date,
          quantity: editingSale.quantity,
          unitPrice: editingSale.unitPrice,
          customerId: editingSale.customerId || '',
        });
      } else {
        setFormData(getInitialFormData());
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingSale, isModalOpen, products]);


  const handleOpenModalForCreate = () => {
    setEditingSale(null);
    setIsModalOpen(true);
  };
  
  const handleOpenModalForEdit = (sale: Sale) => {
    setEditingSale(sale);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingSale(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'quantity' || name === 'unitPrice' ? parseFloat(value) || 0 : value }));
  };

  const handleProductSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const productId = e.target.value;
      const product = products.find(p => p.id === productId);
      setFormData(prev => ({
          ...prev,
          productId,
          unitPrice: product ? product.salePrice : 0
      }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const saleData = { ...formData, customerId: formData.customerId || undefined };
    const result = editingSale ? updateSale(saleData, editingSale) : addSale(saleData);

    if (result.success) {
      showToast(result.message, 'success');
      handleCloseModal();
    } else {
      showToast(result.message, 'error');
    }
  };
  
  const handleDelete = (saleId: string) => {
    showConfirmation({
        title: 'Eliminar Venta',
        message: '¿Estás seguro de que quieres eliminar esta venta? El stock del producto se restaurará.',
        onConfirm: () => {
            const result = deleteSale(saleId);
            showToast(result.message, 'success');
        },
        confirmText: 'Sí, eliminar'
    });
  };
  
  const SortableHeader: React.FC<{ sortKey: SortableSaleKeys; children: React.ReactNode }> = ({ sortKey, children }) => (
    <button
      type="button"
      onClick={() => requestSort(sortKey)}
      className="flex items-center gap-1 font-semibold text-text-primary hover:text-accent focus:outline-none"
    >
      {children}
      {getSortIcon(sortKey)}
    </button>
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Historial de Ventas</h1>
        <button onClick={handleOpenModalForCreate} className="bg-accent hover:bg-accent-hover text-white font-bold py-2 px-4 rounded-lg transition-colors shadow-md" disabled={products.length === 0}>
          Registrar Venta Manual
        </button>
      </div>

      <div className="bg-primary rounded-xl shadow-md overflow-hidden border border-border">
        <DataTable
          columns={[
            {
              key: 'date',
              header: <SortableHeader sortKey="date">Fecha</SortableHeader>,
              accessor: 'date',
            },
            {
              key: 'productName',
              header: <SortableHeader sortKey="productName">Producto</SortableHeader>,
              accessor: 'productName',
              className: 'min-w-[180px]',
            },
            {
              key: 'customerName',
              header: <SortableHeader sortKey="customerName">Cliente</SortableHeader>,
              accessor: 'customerName',
              className: 'min-w-[160px]',
            },
            {
              key: 'quantity',
              header: <SortableHeader sortKey="quantity">Cantidad</SortableHeader>,
              accessor: 'quantity',
              variant: 'badge',
            },
            {
              key: 'unitPrice',
              header: <SortableHeader sortKey="unitPrice">Precio Unitario</SortableHeader>,
              render: sale => formatCurrency(sale.unitPrice),
            },
            {
              key: 'total',
              header: <SortableHeader sortKey="total">Total</SortableHeader>,
              render: sale => formatCurrency(sale.total),
              className: 'font-semibold',
            },
          ]}
          rows={sortedSales}
          rowKey={sale => sale.id}
          emptyState={
            <>
              <DollarSignIcon className="mx-auto h-16 w-16 text-gray-300" />
              <h3 className="text-lg font-semibold text-text-primary">No hay ventas registradas</h3>
              <p className="text-sm text-text-secondary">
                Usa la "Venta Rápida" o registra una venta manual para empezar.
              </p>
            </>
          }
          actions={{
            render: sale => (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleOpenModalForEdit(sale)}
                  className="text-accent hover:text-accent-hover p-1"
                >
                  <EditIcon className="w-5 h-5" />
                </button>
                <button onClick={() => handleDelete(sale.id)} className="text-danger hover:opacity-75 p-1">
                  <DeleteIcon className="w-5 h-5" />
                </button>
              </div>
            ),
            className: 'min-w-[120px]',
          }}
        />
      </div>
      
      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingSale ? "Editar Venta" : "Registrar Nueva Venta Manual"}>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
            <div className="md:col-span-2">
              <label htmlFor="productId" className="block text-sm font-medium text-text-secondary">Producto</label>
              <select name="productId" id="productId" value={formData.productId} onChange={handleProductSelect} className="mt-1 block w-full bg-secondary border-border rounded-md shadow-sm focus:ring-accent focus:border-accent" required autoFocus>
                {products.map(p => <option key={p.id} value={p.id}>{p.name} (Stock: {p.stock})</option>)}
              </select>
            </div>
             <div className="md:col-span-2">
              <label htmlFor="customerId" className="block text-sm font-medium text-text-secondary">Cliente (Opcional)</label>
              <select name="customerId" id="customerId" value={formData.customerId} onChange={handleInputChange} className="mt-1 block w-full bg-secondary border-border rounded-md shadow-sm focus:ring-accent focus:border-accent">
                <option value="">Cliente General</option>
                {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
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
            <div className="md:col-span-2">
              <label htmlFor="unitPrice" className="block text-sm font-medium text-text-secondary">Precio Unitario</label>
              <div className="relative mt-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input type="number" name="unitPrice" id="unitPrice" min="0" value={formData.unitPrice} onChange={handleInputChange} className="block w-full bg-secondary border-border rounded-md shadow-sm focus:ring-accent focus:border-accent pl-7" required />
              </div>
            </div>
          </div>
          <div className="flex justify-end pt-6 space-x-2">
            <button type="button" onClick={handleCloseModal} className="bg-secondary hover:bg-border text-text-primary font-bold py-2 px-4 rounded-lg transition-colors">Cancelar</button>
            <button type="submit" className="bg-accent hover:bg-accent-hover text-white font-bold py-2 px-4 rounded-lg transition-colors">{editingSale ? "Guardar Cambios" : "Guardar Venta"}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Sales;