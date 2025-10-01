import React, { createContext, useContext, ReactNode, useMemo, useCallback } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { Product, Purchase, Sale, Adjustment, AdjustmentType, Customer } from '../types';
import { mockProducts, mockPurchases, mockSales, mockAdjustments, mockCustomers } from '../data/mockData';
import { LOCAL_STORAGE_KEYS } from '../utils/constants';

interface DataResult {
    success: boolean;
    message: string;
}

interface DataContextType {
  products: Product[];
  purchases: Purchase[];
  sales: Sale[];
  adjustments: Adjustment[];
  customers: Customer[];
  addProduct: (product: Omit<Product, 'stock' | 'testerStock'>) => DataResult;
  updateProduct: (updatedProduct: Omit<Product, 'stock' | 'testerStock'>) => DataResult;
  deleteProduct: (productId: string) => DataResult;
  addPurchase: (purchase: Omit<Purchase, 'id'>) => DataResult;
  updatePurchase: (updatedPurchase: Omit<Purchase, 'id'>, originalPurchase: Purchase) => DataResult;
  deletePurchase: (purchaseId: string) => DataResult;
  addSale: (sale: Omit<Sale, 'id' | 'total'>) => DataResult;
  addMultipleSales: (salesData: Omit<Sale, 'id' | 'total'>[], customerId?: string) => DataResult;
  updateSale: (updatedSale: Omit<Sale, 'id' | 'total'>, originalSale: Sale) => DataResult;
  deleteSale: (saleId: string) => DataResult;
  convertToTester: (productId: string) => DataResult;
  consumeTester: (productId: string) => DataResult;
  addCustomer: (customer: Omit<Customer, 'id'>) => DataResult & { newCustomer?: Customer };
  updateCustomer: (customer: Customer) => DataResult;
  deleteCustomer: (customerId: string) => DataResult;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useLocalStorage<Product[]>(LOCAL_STORAGE_KEYS.PRODUCTS, mockProducts);
  const [purchases, setPurchases] = useLocalStorage<Purchase[]>(LOCAL_STORAGE_KEYS.PURCHASES, mockPurchases);
  const [sales, setSales] = useLocalStorage<Sale[]>(LOCAL_STORAGE_KEYS.SALES, mockSales);
  const [adjustments, setAdjustments] = useLocalStorage<Adjustment[]>(LOCAL_STORAGE_KEYS.ADJUSTMENTS, mockAdjustments);
  const [customers, setCustomers] = useLocalStorage<Customer[]>(LOCAL_STORAGE_KEYS.CUSTOMERS, mockCustomers);

  const addProduct = useCallback((productData: Omit<Product, 'stock' | 'testerStock'>): DataResult => {
    if (products.some(p => p.id === productData.id)) {
        return { success: false, message: `Error: El SKU '${productData.id}' ya existe.` };
    }
    const newProduct: Product = { ...productData, stock: 0, testerStock: 0 };
    setProducts(prev => [...prev, newProduct]);
    return { success: true, message: 'Producto agregado exitosamente.' };
  }, [products, setProducts]);

  const updateProduct = useCallback((updatedProductData: Omit<Product, 'stock' | 'testerStock'>): DataResult => {
    setProducts(prev => prev.map(p => p.id === updatedProductData.id ? { ...p, ...updatedProductData } : p));
    return { success: true, message: 'Producto actualizado exitosamente.' };
  }, [setProducts]);
  
  const deleteProduct = useCallback((productId: string): DataResult => {
    setProducts(prev => prev.filter(p => p.id !== productId));
    return { success: true, message: 'Producto eliminado exitosamente.' };
  }, [setProducts]);

  const addPurchase = useCallback((purchaseData: Omit<Purchase, 'id'>): DataResult => {
    const newPurchase: Purchase = { ...purchaseData, id: `p${Date.now()}` };
    setPurchases(prev => [...prev, newPurchase]);
    setProducts(prev =>
      prev.map(p =>
        p.id === purchaseData.productId
          ? { ...p, stock: p.stock + purchaseData.quantity }
          : p
      )
    );
    return { success: true, message: 'Compra registrada exitosamente.' };
  }, [setProducts, setPurchases]);

  const updatePurchase = useCallback((updatedPurchaseData: Omit<Purchase, 'id'>, originalPurchase: Purchase): DataResult => {
    const quantityDiff = updatedPurchaseData.quantity - originalPurchase.quantity;
    setPurchases(prev => prev.map(p => p.id === originalPurchase.id ? { id: originalPurchase.id, ...updatedPurchaseData } : p));
    setProducts(prev =>
      prev.map(p =>
        p.id === originalPurchase.productId
          ? { ...p, stock: p.stock + quantityDiff }
          : p
      )
    );
    return { success: true, message: 'Compra actualizada exitosamente.' };
  }, [setProducts, setPurchases]);
  
  const deletePurchase = useCallback((purchaseId: string): DataResult => {
    const purchaseToRemove = purchases.find(p => p.id === purchaseId);
    if (!purchaseToRemove) return { success: false, message: 'No se encontró la compra a eliminar.'};
    setPurchases(prev => prev.filter(p => p.id !== purchaseId));
    setProducts(prev =>
      prev.map(p =>
        p.id === purchaseToRemove.productId
          ? { ...p, stock: p.stock - purchaseToRemove.quantity }
          : p
      )
    );
    return { success: true, message: 'Compra eliminada exitosamente.' };
  }, [purchases, setProducts, setPurchases]);

  const addSale = useCallback((saleData: Omit<Sale, 'id' | 'total'>): DataResult => {
     const product = products.find(p => p.id === saleData.productId);
     if (!product || product.stock < saleData.quantity) {
         return { success: false, message: 'Stock insuficiente para realizar la venta.'};
     }

    const newSale: Sale = {
      ...saleData,
      id: `s${Date.now()}`,
      total: saleData.unitPrice * saleData.quantity
    };
    setSales(prev => [...prev, newSale]);
    setProducts(prev =>
      prev.map(p =>
        p.id === saleData.productId
          ? { ...p, stock: p.stock - saleData.quantity }
          : p
      )
    );
    return { success: true, message: 'Venta registrada con éxito.' };
  }, [products, setProducts, setSales]);

  const addMultipleSales = useCallback((salesData: Omit<Sale, 'id' | 'total'>[], customerId?: string): DataResult => {
    for (const saleItem of salesData) {
        const product = products.find(p => p.id === saleItem.productId);
        if (!product || product.stock < saleItem.quantity) {
            return { success: false, message: `Stock insuficiente para ${product?.name || 'producto desconocido'}. Stock: ${product?.stock || 0}.`};
        }
    }

    const newSales: Sale[] = [];
    const productUpdates: Record<string, number> = {};

    salesData.forEach((saleItem, index) => {
        const sale: Sale = {
            ...saleItem,
            id: `s${Date.now() + index}`,
            total: saleItem.unitPrice * saleItem.quantity,
        };
        if(customerId) {
            sale.customerId = customerId;
        }
        newSales.push(sale);
        productUpdates[saleItem.productId] = (productUpdates[saleItem.productId] || 0) + saleItem.quantity;
    });
    
    setSales(prev => [...prev, ...newSales]);
    setProducts(prev =>
        prev.map(p => 
            productUpdates[p.id] 
                ? { ...p, stock: p.stock - productUpdates[p.id] }
                : p
        )
    );

    return { success: true, message: 'Venta finalizada con éxito.' };
  }, [products, setProducts, setSales]);

  const updateSale = useCallback((updatedSaleData: Omit<Sale, 'id' | 'total'>, originalSale: Sale): DataResult => {
    const product = products.find(p => p.id === originalSale.productId);
    
    if (!product) {
      return { success: false, message: 'Producto no encontrado.'}
    }
    
    const stockReverted = product.stock + originalSale.quantity;
    if (stockReverted < updatedSaleData.quantity) {
      return { success: false, message: `Stock insuficiente. Disponible (después de revertir): ${stockReverted}, requerido: ${updatedSaleData.quantity}` };
    }
    
    const quantityDiff = updatedSaleData.quantity - originalSale.quantity;
    
    const updatedSale: Sale = {
        ...originalSale,
        ...updatedSaleData,
        total: updatedSaleData.unitPrice * updatedSaleData.quantity
    };
    
    setSales(prev => prev.map(s => s.id === originalSale.id ? updatedSale : s));
    setProducts(prev =>
      prev.map(p =>
        p.id === originalSale.productId
          ? { ...p, stock: p.stock - quantityDiff }
          : p
      )
    );
    return { success: true, message: 'Venta actualizada con éxito.' };
  }, [products, setProducts, setSales]);

  const deleteSale = useCallback((saleId: string): DataResult => {
    const saleToRemove = sales.find(s => s.id === saleId);
    if (!saleToRemove) return { success: false, message: 'No se encontró la venta a eliminar.' };
    setSales(prev => prev.filter(s => s.id !== saleId));
    setProducts(prev =>
      prev.map(p =>
        p.id === saleToRemove.productId
          ? { ...p, stock: p.stock + saleToRemove.quantity }
          : p
      )
    );
    return { success: true, message: 'Venta eliminada exitosamente.' };
  }, [sales, setProducts, setSales]);

  const convertToTester = useCallback((productId: string): DataResult => {
    const product = products.find(p => p.id === productId);
    if (!product) {
      return { success: false, message: "Producto no encontrado." };
    }
    if (product.testerStock > 0) {
      return { success: false, message: "Este producto ya tiene un tester activo." };
    }
    if (product.stock < 1) {
      return { success: false, message: "No hay stock vendible para convertir a tester." };
    }

    const newAdjustment: Adjustment = {
      id: `adj_${Date.now()}`,
      productId,
      date: new Date().toISOString().split('T')[0],
      type: AdjustmentType.TESTER_CONVERSION,
      quantity: 1,
      cost: product.costPrice,
    };

    setAdjustments(prev => [...prev, newAdjustment]);
    setProducts(prev => prev.map(p => p.id === productId ? { ...p, stock: p.stock - 1, testerStock: p.testerStock + 1 } : p));
    
    return { success: true, message: `Unidad de '${product.name}' convertida a tester.` };
  }, [products, setProducts, setAdjustments]);

  const consumeTester = useCallback((productId: string): DataResult => {
    const product = products.find(p => p.id === productId);
    if (!product) {
      return { success: false, message: "Producto no encontrado." };
    }
    if (product.testerStock < 1) {
      return { success: false, message: "Este producto no tiene testers activos para consumir." };
    }

    const newAdjustment: Adjustment = {
      id: `adj_${Date.now()}`,
      productId,
      date: new Date().toISOString().split('T')[0],
      type: AdjustmentType.TESTER_CONSUMED,
      quantity: 1,
      cost: 0,
    };

    setAdjustments(prev => [...prev, newAdjustment]);
    setProducts(prev => prev.map(p => p.id === productId ? { ...p, testerStock: p.testerStock - 1 } : p));

    return { success: true, message: `Tester de '${product.name}' marcado como consumido.` };
  }, [products, setProducts, setAdjustments]);

  const addCustomer = useCallback((customerData: Omit<Customer, 'id'>): DataResult & { newCustomer?: Customer } => {
    const newCustomer: Customer = { id: `c_${Date.now()}`, ...customerData };
    setCustomers(prev => [...prev, newCustomer]);
    return { success: true, message: 'Cliente agregado exitosamente.', newCustomer };
  }, [setCustomers]);

  const updateCustomer = useCallback((updatedCustomer: Customer): DataResult => {
    setCustomers(prev => prev.map(c => c.id === updatedCustomer.id ? updatedCustomer : c));
    return { success: true, message: 'Cliente actualizado exitosamente.' };
  }, [setCustomers]);

  const deleteCustomer = useCallback((customerId: string): DataResult => {
    setCustomers(prev => prev.filter(c => c.id !== customerId));
    return { success: true, message: 'Cliente eliminado exitosamente.' };
  }, [setCustomers]);

  const value = useMemo(() => ({
    products, purchases, sales, adjustments, customers,
    addProduct, updateProduct, deleteProduct,
    addPurchase, updatePurchase, deletePurchase,
    addSale, addMultipleSales, updateSale, deleteSale,
    convertToTester, consumeTester,
    addCustomer, updateCustomer, deleteCustomer
  }), [
    products, purchases, sales, adjustments, customers,
    addProduct, updateProduct, deleteProduct,
    addPurchase, updatePurchase, deletePurchase,
    addSale, addMultipleSales, updateSale, deleteSale,
    convertToTester, consumeTester,
    addCustomer, updateCustomer, deleteCustomer
  ]);

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};