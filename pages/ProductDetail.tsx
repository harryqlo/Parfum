import React, { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { ArrowLeftIcon } from '../components/Icons';
import { AdjustmentType } from '../types';
import { formatCurrency } from '../utils/helpers';

const ProductDetail: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const { products, purchases, sales, adjustments } = useData();

  const product = useMemo(() => products.find(p => p.id === productId), [products, productId]);

  const movements = useMemo(() => {
    if (!product) return [];

    const productPurchases = purchases
      .filter(p => p.productId === product.id)
      .map(p => ({
        date: p.date,
        type: 'Compra' as const,
        quantity: p.quantity,
        details: `de ${p.supplier}`,
        id: p.id,
      }));

    const productSales = sales
      .filter(s => s.productId === product.id)
      .map(s => ({
        date: s.date,
        type: 'Venta' as const,
        quantity: -s.quantity,
        details: `Total ${formatCurrency(s.total)}`,
        id: s.id,
      }));

    const productAdjustments = adjustments
      .filter(a => a.productId === product.id)
      .map(a => {
        if(a.type === AdjustmentType.TESTER_CONVERSION){
          return {
            date: a.date,
            type: 'Ajuste por Tester' as const,
            quantity: -a.quantity, // Reduces sellable stock
            details: `Costo: ${formatCurrency(a.cost)}`,
            id: a.id,
          }
        }
        if(a.type === AdjustmentType.TESTER_CONSUMED) {
            return {
                date: a.date,
                type: 'Ajuste por Consumo' as const,
                quantity: 0, // Does not affect sellable stock
                details: 'Tester finalizado',
                id: a.id,
            }
        }
        return null;
      }).filter((a): a is NonNullable<typeof a> => a !== null);


    return [...productPurchases, ...productSales, ...productAdjustments];
  }, [product, purchases, sales, adjustments]);

  const movementsWithRunningStock = useMemo(() => {
    if (!product) return [];
    
    const sortedMovements = [...movements].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    let runningStock = product.stock;
    
    return sortedMovements.map(movement => {
        const stockAfter = runningStock;
        runningStock -= movement.quantity;
        return {
          ...movement,
          stockAfter,
        };
    });
  }, [movements, product]);

  if (!product) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-bold">Producto no encontrado</h2>
        <Link to="/inventory" className="text-accent hover:underline mt-4 inline-block">Volver al Inventario</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link to="/inventory" className="flex items-center bg-primary p-2 rounded-lg border border-border shadow-sm hover:bg-secondary transition-colors">
          <ArrowLeftIcon className="h-5 w-5 text-text-secondary" />
        </Link>
        <div>
            <p className="text-lg font-semibold text-accent">{product.brand}</p>
            <h1 className="text-2xl font-bold -mt-1">{product.name}</h1>
            <p className="text-text-secondary font-mono text-sm">SKU: {product.id}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-primary p-5 rounded-xl shadow-md border border-border">
            <p className="text-sm font-medium text-text-secondary">Stock Vendible</p>
            <p className="text-3xl font-bold text-text-primary">{product.stock}</p>
        </div>
         <div className="bg-primary p-5 rounded-xl shadow-md border border-border">
            <p className="text-sm font-medium text-text-secondary">Stock Testers</p>
            <p className="text-3xl font-bold text-text-primary">{product.testerStock}</p>
        </div>
        <div className="bg-primary p-5 rounded-xl shadow-md border border-border">
            <p className="text-sm font-medium text-text-secondary">Precio Costo</p>
            <p className="text-3xl font-bold text-text-primary">{formatCurrency(product.costPrice)}</p>
        </div>
        <div className="bg-primary p-5 rounded-xl shadow-md border border-border">
            <p className="text-sm font-medium text-text-secondary">Precio Venta</p>
            <p className="text-3xl font-bold text-text-primary">{formatCurrency(product.salePrice)}</p>
        </div>
        <div className="bg-primary p-5 rounded-xl shadow-md border border-border">
            <p className="text-sm font-medium text-text-secondary">Valor Stock Vendible</p>
            <p className="text-3xl font-bold text-text-primary">{formatCurrency(product.stock * product.costPrice)}</p>
        </div>
      </div>

      <div className="bg-primary rounded-xl shadow-md overflow-hidden border border-border">
        <h2 className="text-xl font-bold p-4 border-b">Historial de Movimientos</h2>
        <div className="overflow-x-auto">
          {movementsWithRunningStock.length === 0 ? (
            <p className="text-center py-10 text-text-secondary">No hay movimientos registrados para este producto.</p>
          ) : (
            <table className="w-full">
              <thead className="bg-secondary">
                <tr>
                  <th className="p-4 font-semibold text-left">Fecha</th>
                  <th className="p-4 font-semibold text-left">Tipo</th>
                  <th className="p-4 font-semibold text-left">Cantidad</th>
                  <th className="p-4 font-semibold text-left">Stock Vendible Resultante</th>
                  <th className="p-4 font-semibold text-left">Detalles</th>
                </tr>
              </thead>
              <tbody>
                {movementsWithRunningStock.map((movement) => (
                  <tr key={movement.id} className="border-b border-border hover:bg-secondary/50">
                    <td className="p-4">{movement.date}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        movement.type === 'Compra' ? 'bg-blue-100 text-blue-800' :
                        movement.type === 'Venta' ? 'bg-pink-100 text-pink-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {movement.type}
                      </span>
                    </td>
                    <td className={`p-4 font-medium ${movement.quantity > 0 ? 'text-success' : movement.quantity < 0 ? 'text-danger' : 'text-text-secondary'}`}>{movement.quantity > 0 ? `+${movement.quantity}`: movement.quantity}</td>
                    <td className="p-4 font-bold">{movement.stockAfter}</td>
                    <td className="p-4 text-sm text-text-secondary">{movement.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;