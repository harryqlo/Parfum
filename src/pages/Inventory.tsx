import React, { useState, useEffect, useMemo } from 'react';
import { useData } from '../context/DataContext';
import Modal from '../components/Modal';
import { Product, Gender } from '../types';
import { EditIcon, DeleteIcon, PackageIcon, ArrowUpIcon, ArrowDownIcon, BeakerIcon, ArchiveIcon } from '../components/Icons';
import { useNotification } from '../context/NotificationContext';
import { Link } from 'react-router-dom';
import { formatCurrency } from '../utils/helpers';

type SortableProductKeys = keyof Product | 'stockValue';
type ActiveTab = 'all' | 'testers';

const Inventory: React.FC = () => {
  const { products, addProduct, updateProduct, deleteProduct, convertToTester, consumeTester } = useData();
  const { showConfirmation, showToast } = useNotification();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: SortableProductKeys; direction: 'ascending' | 'descending' } | null>({ key: 'id', direction: 'ascending' });
  const [brandFilter, setBrandFilter] = useState<string>('');
  const [activeTab, setActiveTab] = useState<ActiveTab>('all');

  const brands = useMemo(() => Array.from(new Set(products.map(p => p.brand).sort())), [products]);

  const filteredProducts = useMemo(() => {
    let items = [...products];
    if (activeTab === 'testers') {
        items = items.filter(p => p.testerStock > 0);
    }
    if (brandFilter) {
      items = items.filter(p => p.brand === brandFilter);
    }
    return items;
  }, [products, brandFilter, activeTab]);

  const sortedProducts = useMemo(() => {
    let sortableItems = [...filteredProducts];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        const aValue = sortConfig.key === 'stockValue' ? a.stock * a.costPrice : a[sortConfig.key as keyof Product];
        const bValue = sortConfig.key === 'stockValue' ? b.stock * b.costPrice : b[sortConfig.key as keyof Product];

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
  }, [filteredProducts, sortConfig]);

  const requestSort = (key: SortableProductKeys) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };
  
  const getSortIcon = (key: SortableProductKeys) => {
    if (!sortConfig || sortConfig.key !== key) {
      return null;
    }
    return sortConfig.direction === 'ascending' ? <ArrowUpIcon className="h-4 w-4 ml-1" /> : <ArrowDownIcon className="h-4 w-4 ml-1" />;
  };

  const [formData, setFormData] = useState({
      id: '',
      name: '',
      brand: '',
      gender: Gender.FEMALE,
      costPrice: 0,
      salePrice: 0
  });

  useEffect(() => {
    if (editingProduct) {
      setFormData({
        id: editingProduct.id,
        name: editingProduct.name,
        brand: editingProduct.brand,
        gender: editingProduct.gender,
        costPrice: editingProduct.costPrice,
        salePrice: editingProduct.salePrice,
      });
    } else {
      setFormData({ id: '', name: '', brand: '', gender: Gender.FEMALE, costPrice: 0, salePrice: 0 });
    }
  }, [editingProduct, isModalOpen]);

  const handleOpenModalForCreate = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };
  
  const handleOpenModalForEdit = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: name === 'costPrice' || name === 'salePrice' ? parseFloat(value) || 0 : value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = editingProduct ? updateProduct(formData) : addProduct(formData);
    
    if (result.success) {
      showToast(result.message, 'success');
      handleCloseModal();
    } else {
      showToast(result.message, 'error');
    }
  };
  
  const handleDelete = (productId: string) => {
    showConfirmation({
        title: 'Eliminar Producto',
        message: '¿Estás seguro de que quieres eliminar este producto? Esta acción no se puede deshacer y podría afectar reportes históricos.',
        onConfirm: () => {
            const result = deleteProduct(productId);
            showToast(result.message, 'success');
        },
        confirmText: 'Sí, eliminar'
    });
  };
  
  const handleConvertToTester = (productId: string, productName: string) => {
    showConfirmation({
        title: 'Convertir a Tester',
        message: `¿Estás seguro de que quieres convertir 1 unidad de "${productName}" a tester? Esto reducirá el stock vendible y su costo se registrará como un egreso.`,
        onConfirm: () => {
            const result = convertToTester(productId);
            if (result.success) {
                showToast(result.message, 'success');
            } else {
                showToast(result.message, 'error');
            }
        },
        confirmText: 'Sí, convertir'
    });
  };

  const handleConsumeTester = (productId: string, productName: string) => {
    showConfirmation({
        title: 'Consumir Tester',
        message: `¿Estás seguro de que quieres marcar el tester de "${productName}" como consumido? Esto lo eliminará de la exhibición y te permitirá crear uno nuevo.`,
        onConfirm: () => {
            const result = consumeTester(productId);
            if (result.success) {
                showToast(result.message, 'success');
            }
        },
        confirmText: 'Sí, consumir'
    });
  }

  const SortableHeader: React.FC<{ sortKey: SortableProductKeys; children: React.ReactNode }> = ({ sortKey, children }) => (
    <th className="p-4 font-semibold cursor-pointer text-left" onClick={() => requestSort(sortKey)}>
      <div className="flex items-center">{children} {getSortIcon(sortKey)}</div>
    </th>
  );
  
  const TabButton: React.FC<{tabId: ActiveTab; children: React.ReactNode;}> = ({ tabId, children }) => (
    <button onClick={() => setActiveTab(tabId)} className={`px-4 py-2 text-sm font-medium rounded-md ${activeTab === tabId ? 'bg-accent text-white' : 'text-text-secondary hover:bg-secondary'}`}>
        {children}
    </button>
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Inventario</h1>
        <div className="flex items-center space-x-4">
            <div>
                <label htmlFor="brandFilter" className="sr-only">Filtrar por marca</label>
                <select id="brandFilter" name="brandFilter" value={brandFilter} onChange={e => setBrandFilter(e.target.value)} className="block w-full pl-3 pr-10 py-2 text-base rounded-md bg-secondary border-border focus:outline-none focus:ring-2 focus:ring-accent">
                    <option value="">Todas las Marcas</option>
                    {brands.map(brand => <option key={brand} value={brand}>{brand}</option>)}
                </select>
            </div>
            <button onClick={handleOpenModalForCreate} className="bg-accent hover:bg-accent-hover text-white font-bold py-2 px-4 rounded-lg transition-colors shadow-md">
            Agregar Producto
            </button>
        </div>
      </div>

      <div className="mb-4 flex space-x-2 border-b border-border">
          <TabButton tabId="all">Todos los Productos</TabButton>
          <TabButton tabId="testers">Testers en Exhibición ({products.filter(p => p.testerStock > 0).length})</TabButton>
      </div>

      <div className="bg-primary rounded-xl shadow-md overflow-hidden border border-border">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <PackageIcon className="mx-auto h-16 w-16 text-gray-300" />
            <h3 className="mt-4 text-lg font-semibold text-text-primary">No se encontraron productos</h3>
            <p className="mt-1 text-sm text-text-secondary">{activeTab === 'testers' ? 'No hay testers activos actualmente.' : 'Intenta ajustar los filtros o agrega un producto.'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-secondary">
                <tr>
                  <SortableHeader sortKey="id">SKU</SortableHeader>
                  <SortableHeader sortKey="name">Producto</SortableHeader>
                  <SortableHeader sortKey="brand">Marca</SortableHeader>
                  <SortableHeader sortKey="gender">Género</SortableHeader>
                  <SortableHeader sortKey="stock">Stock</SortableHeader>
                  <SortableHeader sortKey="testerStock">Testers</SortableHeader>
                  <SortableHeader sortKey="costPrice">Precio Costo</SortableHeader>
                  <SortableHeader sortKey="salePrice">Precio Venta</SortableHeader>
                  <SortableHeader sortKey="stockValue">Valor Stock</SortableHeader>
                  <th className="p-4 font-semibold text-left">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {sortedProducts.map(product => (
                  <tr key={product.id} className="border-b border-border hover:bg-secondary/50 transition-colors">
                    <td className="p-4 font-mono text-sm text-left">{product.id}</td>
                    <td className="p-4 text-left">
                      <Link to={`/inventory/${product.id}`} className="text-accent hover:underline font-medium">
                        {product.name}
                      </Link>
                    </td>
                    <td className="p-4 text-left">{product.brand}</td>
                    <td className="p-4 text-left">{product.gender}</td>
                    <td className="p-4 font-medium text-left">{product.stock}</td>
                    <td className="p-4 font-medium text-left">{product.testerStock}</td>
                    <td className="p-4 text-left">{formatCurrency(product.costPrice)}</td>
                    <td className="p-4 text-left">{formatCurrency(product.salePrice)}</td>
                    <td className="p-4 font-medium text-left">{formatCurrency(product.stock * product.costPrice)}</td>
                    <td className="p-4 text-left">
                      <div className="flex items-center space-x-2">
                        {activeTab === 'testers' ? (
                           <button onClick={() => handleConsumeTester(product.id, product.name)} title="Marcar como Consumido" className="text-yellow-600 hover:text-yellow-800 p-1"><ArchiveIcon className="w-5 h-5"/></button>
                        ) : (
                           <button onClick={() => handleConvertToTester(product.id, product.name)} title="Convertir a Tester" className="text-blue-600 hover:text-blue-800 p-1 disabled:opacity-50 disabled:cursor-not-allowed" disabled={product.stock < 1 || product.testerStock > 0}><BeakerIcon className="w-5 h-5"/></button>
                        )}
                        <button onClick={() => handleOpenModalForEdit(product)} title="Editar" className="text-accent hover:text-accent-hover p-1"><EditIcon className="w-5 h-5"/></button>
                        <button onClick={() => handleDelete(product.id)} title="Eliminar" className="text-danger hover:opacity-75 p-1"><DeleteIcon className="w-5 h-5"/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingProduct ? "Editar Producto" : "Agregar Nuevo Producto"}>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
            {editingProduct ? (
                <div>
                    <label className="block text-sm font-medium text-text-secondary">SKU</label>
                    <p className="mt-1 text-lg font-semibold text-text-primary bg-secondary px-3 py-2 rounded-md">{formData.id}</p>
                </div>
            ) : (
                <div>
                    <label htmlFor="id" className="block text-sm font-medium text-text-secondary">SKU</label>
                    <input type="text" name="id" id="id" value={formData.id} onChange={handleInputChange} className="mt-1 block w-full bg-secondary border-border rounded-md shadow-sm focus:ring-accent focus:border-accent" required autoFocus />
                </div>
            )}
             <div>
              <label htmlFor="brand" className="block text-sm font-medium text-text-secondary">Marca</label>
              <input type="text" name="brand" id="brand" value={formData.brand} onChange={handleInputChange} className="mt-1 block w-full bg-secondary border-border rounded-md shadow-sm focus:ring-accent focus:border-accent" required autoFocus={!!editingProduct} />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="name" className="block text-sm font-medium text-text-secondary">Nombre del Producto</label>
              <input type="text" name="name" id="name" value={formData.name} onChange={handleInputChange} className="mt-1 block w-full bg-secondary border-border rounded-md shadow-sm focus:ring-accent focus:border-accent" required />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="gender" className="block text-sm font-medium text-text-secondary">Género</label>
              <select name="gender" id="gender" value={formData.gender} onChange={handleInputChange} className="mt-1 block w-full bg-secondary border-border rounded-md shadow-sm focus:ring-accent focus:border-accent">
                  {Object.values(Gender).map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="costPrice" className="block text-sm font-medium text-text-secondary">Precio de Costo</label>
              <div className="relative mt-1">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <input type="number" name="costPrice" id="costPrice" min="0" value={formData.costPrice} onChange={handleInputChange} className="block w-full bg-secondary border-border rounded-md shadow-sm focus:ring-accent focus:border-accent pl-7" required />
              </div>
            </div>
            <div>
              <label htmlFor="salePrice" className="block text-sm font-medium text-text-secondary">Precio de Venta</label>
              <div className="relative mt-1">
                   <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <input type="number" name="salePrice" id="salePrice" min="0" value={formData.salePrice} onChange={handleInputChange} className="block w-full bg-secondary border-border rounded-md shadow-sm focus:ring-accent focus:border-accent pl-7" required />
              </div>
            </div>
          </div>
          <div className="flex justify-end pt-6 space-x-2">
            <button type="button" onClick={handleCloseModal} className="bg-secondary hover:bg-border text-text-primary font-bold py-2 px-4 rounded-lg transition-colors">Cancelar</button>
            <button type="submit" className="bg-accent hover:bg-accent-hover text-white font-bold py-2 px-4 rounded-lg transition-colors">{editingProduct ? "Guardar Cambios" : "Guardar Producto"}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Inventory;