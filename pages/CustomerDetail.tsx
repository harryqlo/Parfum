import React, { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { ArrowLeftIcon } from '../components/Icons';
import { formatCurrency } from '../utils/helpers';

const CustomerDetail: React.FC = () => {
    const { customerId } = useParams<{ customerId: string }>();
    const { customers, sales, products } = useData();

    const customer = useMemo(() => customers.find(c => c.id === customerId), [customers, customerId]);

    const customerSales = useMemo(() => {
        if (!customer) return [];
        return sales
            .filter(s => s.customerId === customer.id)
            .map(s => {
                const product = products.find(p => p.id === s.productId);
                return { ...s, productName: product?.name || 'Producto Desconocido' };
            })
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [customer, sales, products]);

    const summary = useMemo(() => {
        const totalSpent = customerSales.reduce((sum, s) => sum + s.total, 0);
        const purchaseCount = customerSales.length;
        return { totalSpent, purchaseCount };
    }, [customerSales]);
    
    if (!customer) {
        return (
            <div className="text-center py-10">
                <h2 className="text-2xl font-bold">Cliente no encontrado</h2>
                <Link to="/customers" className="text-accent hover:underline mt-4 inline-block">Volver a Clientes</Link>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-4">
                <Link to="/customers" className="flex items-center bg-primary p-2 rounded-lg border border-border shadow-sm hover:bg-secondary transition-colors">
                    <ArrowLeftIcon className="h-5 w-5 text-text-secondary" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold">{customer.name}</h1>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1 bg-primary p-5 rounded-xl shadow-md border border-border">
                    <h3 className="font-semibold text-lg mb-4">Información de Contacto</h3>
                    <div className="space-y-2 text-sm">
                        <p><span className="font-medium text-text-secondary">Email:</span> {customer.email || 'No registrado'}</p>
                        <p><span className="font-medium text-text-secondary">Teléfono:</span> {customer.phone || 'No registrado'}</p>
                        {customer.notes && <p className="pt-2 border-t mt-2"><span className="font-medium text-text-secondary">Notas:</span> {customer.notes}</p>}
                    </div>
                </div>
                <div className="md:col-span-2 grid grid-cols-2 gap-6">
                     <div className="bg-primary p-5 rounded-xl shadow-md border border-border">
                        <p className="text-sm font-medium text-text-secondary">Total Gastado</p>
                        <p className="text-3xl font-bold text-accent">{formatCurrency(summary.totalSpent)}</p>
                    </div>
                     <div className="bg-primary p-5 rounded-xl shadow-md border border-border">
                        <p className="text-sm font-medium text-text-secondary">Compras Realizadas</p>
                        <p className="text-3xl font-bold text-accent">{summary.purchaseCount}</p>
                    </div>
                </div>
            </div>

            <div className="bg-primary rounded-xl shadow-md overflow-hidden border border-border">
                <h2 className="text-xl font-bold p-4 border-b">Historial de Compras</h2>
                <div className="overflow-x-auto">
                    {customerSales.length === 0 ? (
                        <p className="text-center py-10 text-text-secondary">Este cliente aún no tiene compras registradas.</p>
                    ) : (
                        <table className="w-full">
                            <thead className="bg-secondary">
                                <tr>
                                    <th className="p-4 font-semibold text-left">Fecha</th>
                                    <th className="p-4 font-semibold text-left">Producto</th>
                                    <th className="p-4 font-semibold text-left">Cantidad</th>
                                    <th className="p-4 font-semibold text-left">Precio Unit.</th>
                                    <th className="p-4 font-semibold text-left">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {customerSales.map(sale => (
                                    <tr key={sale.id} className="border-b border-border hover:bg-secondary/50">
                                        <td className="p-4">{sale.date}</td>
                                        <td className="p-4">{sale.productName}</td>
                                        <td className="p-4">{sale.quantity}</td>
                                        <td className="p-4">{formatCurrency(sale.unitPrice)}</td>
                                        <td className="p-4 font-medium">{formatCurrency(sale.total)}</td>
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

export default CustomerDetail;