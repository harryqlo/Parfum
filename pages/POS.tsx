import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { useNotification } from '../context/NotificationContext';
import { PackageIcon, DeleteIcon, CheckCircleIcon, PlusCircleIcon } from '../components/Icons';
import QuickAddCustomerModal from '../components/QuickAddCustomerModal';
import { Customer } from '../types';
import { formatCurrency } from '../utils/helpers';

interface CartItem {
  productId: string;
  quantity: number;
  name: string;
  brand: string;
  unitPrice: number;
  stock: number;
}

const POS: React.FC = () => {
  const { products, customers, addMultipleSales } = useData();
  const { showConfirmation, showToast } = useNotification();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [isQuickAddModalOpen, setIsQuickAddModalOpen] = useState(false);

  const filteredProducts = useMemo(() => {
    if (!searchTerm) return products;
    return products.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [products, searchTerm]);
  
  const cartProductIds = useMemo(() => new Set(cart.map(item => item.productId)), [cart]);

  const addToCart = (product: typeof products[0]) => {
    if (product.stock === 0) {
        showToast(`'${product.name}' no tiene stock.`, 'error');
        return;
    }
    
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.productId === product.id);
      if (existingItem) {
        if (existingItem.quantity < product.stock) {
          return prevCart.map(item => 
            item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item
          );
        } else {
          showToast(`Stock máximo para '${product.name}' alcanzado.`, 'info');
        }
        return prevCart;
      }
      return [...prevCart, { productId: product.id, quantity: 1, name: product.name, brand: product.brand, unitPrice: product.salePrice, stock: product.stock }];
    });
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    setCart(prevCart => prevCart.map(item => {
      if (item.productId === productId) {
        if (newQuantity > 0 && newQuantity <= item.stock) {
          return { ...item, quantity: newQuantity };
        }
        if(newQuantity > item.stock) {
            showToast(`Stock máximo para '${item.name}' es ${item.stock}.`, 'info');
            return { ...item, quantity: item.stock };
        }
      }
      return item;
    }).filter(item => item.quantity > 0));
  };
  
  const removeFromCart = (productId: string) => {
    setCart(prevCart => prevCart.filter(item => item.productId !== productId));
  };

  const clearCart = () => {
    if (cart.length === 0) return;
    showConfirmation({
        title: "Vaciar Carrito",
        message: "¿Estás seguro de que quieres eliminar todos los productos del carrito?",
        onConfirm: () => setCart([]),
        confirmText: "Sí, vaciar"
    });
  };

  const cartTotal = useMemo(() => {
    return cart.reduce((total, item) => total + (item.unitPrice * item.quantity), 0);
  }, [cart]);
  
  const handleFinalizeSale = () => {
      if(cart.length === 0) return;
      
      const salesData = cart.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          date: new Date().toISOString().split('T')[0]
      }));

      const result = addMultipleSales(salesData, selectedCustomerId || undefined);
      
      if(result.success) {
          showToast(result.message, 'success');
          setCart([]);
          setSelectedCustomerId('');
      } else {
          showToast(result.message, 'error');
      }
  };
  
  const handleCustomerAdded = (newCustomer: Customer) => {
    setSelectedCustomerId(newCustomer.id);
  };

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-100px)]">
        {/* Product List */}
        <div className="lg:col-span-2 bg-primary rounded-xl shadow-md border border-border flex flex-col">
          <div className="p-4 border-b">
            <input 
              type="text"
              placeholder="Buscar por nombre, SKU o marca..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-secondary p-2 rounded-md border-border focus:ring-2 focus:ring-accent focus:outline-none"
            />
          </div>
          <div className="flex-1 overflow-y-auto p-4">
              {filteredProducts.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {filteredProducts.map(product => {
                      const isInCart = cartProductIds.has(product.id);
                      return (
                          <button 
                              key={product.id}
                              onClick={() => addToCart(product)}
                              disabled={product.stock === 0}
                              className={`relative bg-white border rounded-lg p-3 text-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${isInCart ? 'border-success shadow-lg scale-105' : 'border-border hover:scale-105 hover:shadow-lg'}`}
                          >
                              {isInCart && <CheckCircleIcon className="absolute top-1 right-1 h-5 w-5 text-success" />}
                              <p className="text-xs text-text-secondary truncate">{product.brand}</p>
                              <p className="font-semibold text-sm text-text-primary truncate -mt-1">{product.name}</p>
                              <p className="text-xs text-text-secondary">SKU: {product.id}</p>
                              <p className="text-lg font-bold text-accent my-1">{formatCurrency(product.salePrice)}</p>
                              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${product.stock > 3 ? 'bg-green-100 text-green-800' : product.stock > 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                                  Stock: {product.stock}
                              </span>
                          </button>
                      )
                  })}
                  </div>
              ) : (
                  <div className="text-center py-20 flex flex-col items-center">
                      <PackageIcon className="h-16 w-16 text-gray-300" />
                      <h3 className="mt-4 text-lg font-semibold text-text-primary">No se encontraron productos</h3>
                      <p className="mt-1 text-sm text-text-secondary">Intenta con otro término de búsqueda.</p>
                  </div>
              )}
          </div>
        </div>
        
        {/* Cart */}
        <div className="lg:col-span-1 bg-primary rounded-xl shadow-md border border-border flex flex-col">
          <h2 className="text-xl font-bold p-4 border-b">Carrito de Compras</h2>
          <div className="flex-1 overflow-y-auto p-4">
              {cart.length > 0 ? (
                  <ul className="space-y-3">
                      {cart.map(item => (
                          <li key={item.productId} className="flex items-center space-x-3 bg-secondary p-2 rounded-lg">
                            <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold truncate">{item.name}</p>
                                  <p className="text-xs text-text-secondary truncate">{item.brand}</p>
                                  <p className="text-xs text-text-secondary">{formatCurrency(item.unitPrice)}</p>
                            </div>
                            <input 
                                  type="number"
                                  value={item.quantity}
                                  onChange={(e) => updateQuantity(item.productId, parseInt(e.target.value, 10) || 1)}
                                  min="1"
                                  max={item.stock}
                                  className="w-16 text-center bg-white border border-border rounded-md"
                            />
                            <p className="w-20 text-right font-semibold">{formatCurrency(item.quantity * item.unitPrice)}</p>
                            <button onClick={() => removeFromCart(item.productId)} className="text-danger hover:opacity-75 p-1">
                                <DeleteIcon className="w-5 h-5"/>
                            </button>
                          </li>
                      ))}
                  </ul>
              ) : (
                  <div className="text-center text-text-secondary pt-16">
                      <p>El carrito está vacío.</p>
                      <p className="text-sm">Agrega productos desde la lista.</p>
                  </div>
              )}
          </div>
          <div className="p-4 border-t space-y-3">
              <div className="mb-2">
                  <label htmlFor="customer" className="block text-sm font-medium text-text-secondary mb-1">Asociar Venta a Cliente</label>
                  <div className="flex items-center space-x-2">
                    <select 
                        id="customer"
                        value={selectedCustomerId}
                        onChange={(e) => setSelectedCustomerId(e.target.value)}
                        className="flex-grow bg-secondary p-2 rounded-md border-border focus:ring-2 focus:ring-accent focus:outline-none"
                    >
                        <option value="">Cliente General</option>
                        {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <button
                        type="button"
                        onClick={() => setIsQuickAddModalOpen(true)}
                        className="flex-shrink-0 bg-secondary hover:bg-border text-accent rounded-md p-2 transition-colors"
                        title="Agregar Cliente Rápido"
                    >
                        <PlusCircleIcon className="w-5 h-5"/>
                    </button>
                  </div>
              </div>
              <div className="flex justify-between items-center text-xl font-bold">
                  <span>TOTAL:</span>
                  <span>{formatCurrency(cartTotal)}</span>
              </div>
              <button
                  onClick={handleFinalizeSale}
                  disabled={cart.length === 0}
                  className="w-full bg-success hover:opacity-90 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed text-lg"
              >
                  Finalizar Venta
              </button>
              <button 
                  onClick={clearCart}
                  disabled={cart.length === 0}
                  className="w-full bg-danger hover:opacity-90 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                  Vaciar Carrito
              </button>
          </div>
        </div>
      </div>
      <QuickAddCustomerModal 
        isOpen={isQuickAddModalOpen}
        onClose={() => setIsQuickAddModalOpen(false)}
        onCustomerAdded={handleCustomerAdded}
      />
    </>
  );
};

export default POS;