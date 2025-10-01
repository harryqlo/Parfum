import React from 'react';
import { useData } from '../context/DataContext';
import DashboardCard from '../components/DashboardCard';
import { PackageIcon, DollarSignIcon, BarChartIcon, ShoppingCartIcon, WarningIcon } from '../components/Icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Link } from 'react-router-dom';
import { formatCurrency } from '../utils/helpers';

const Dashboard: React.FC = () => {
  const { products, sales } = useData();

  const totalStockValue = products.reduce((sum, p) => sum + p.stock * p.costPrice, 0);
  const totalRevenue = sales.reduce((sum, s) => sum + s.total, 0);
  const totalProfit = sales.reduce((sum, sale) => {
      const product = products.find(p => p.id === sale.productId);
      if (product) {
          return sum + (sale.unitPrice - product.costPrice) * sale.quantity;
      }
      return sum;
  }, 0);
  
  const lowStockItems = products.filter(p => p.stock > 0 && p.stock <= 3);
  
  const salesByProduct = sales.reduce((acc, sale) => {
    const product = products.find(p => p.id === sale.productId);
    const productName = product ? product.name : 'Unknown';
    if (!acc[productName]) {
        acc[productName] = { name: productName, Ventas: 0 };
    }
    acc[productName].Ventas += sale.total;
    return acc;
  }, {} as Record<string, {name: string, Ventas: number}>);
  
  const topProductsData = Object.values(salesByProduct).sort((a,b) => b.Ventas - a.Ventas).slice(0, 10);
  
  const salesOverTime = sales.reduce((acc, sale) => {
    const date = new Date(sale.date).toISOString().split('T')[0];
    if(!acc[date]){
      acc[date] = { date, Ventas: 0 };
    }
    acc[date].Ventas += sale.total;
    return acc;
  }, {} as Record<string, {date: string, Ventas: number}>);

  const salesOverTimeData = Object.values(salesOverTime).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());


  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard 
          title="Valor del Stock (Costo)" 
          value={formatCurrency(totalStockValue)} 
          icon={<PackageIcon className="h-6 w-6 text-indigo-600" />}
          color="bg-indigo-100"
        />
        <DashboardCard 
          title="Ingresos Totales" 
          value={formatCurrency(totalRevenue)}
          icon={<DollarSignIcon className="h-6 w-6 text-green-600" />}
          color="bg-green-100"
        />
        <DashboardCard 
          title="Ganancia Total" 
          value={formatCurrency(totalProfit)}
          icon={<BarChartIcon className="h-6 w-6 text-amber-600" />}
          color="bg-amber-100"
        />
        <DashboardCard 
          title="Total de Ventas" 
          value={sales.length.toString()}
          icon={<ShoppingCartIcon className="h-6 w-6 text-pink-600" />}
          color="bg-pink-100"
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-primary p-4 sm:p-6 rounded-xl shadow-md border border-border">
            <h2 className="text-xl font-semibold mb-4 text-text-primary">Ventas por Producto (Top 10)</h2>
            <ResponsiveContainer width="100%" height={400}>
                <BarChart data={topProductsData} margin={{ top: 5, right: 20, left: -10, bottom: 90 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="name" stroke="#6b7280" interval={0} angle={-45} textAnchor="end" tick={{ fontSize: 12 }}/>
                    <YAxis stroke="#6b7280" tickFormatter={(value) => formatCurrency(Number(value))}/>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }}
                      labelStyle={{ color: '#1f2937' }}
                      formatter={(value: number) => [formatCurrency(value), "Ventas"]}
                     />
                    <Legend wrapperStyle={{ color: '#1f2937' }}/>
                    <Bar dataKey="Ventas" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
        <div className="bg-primary p-4 sm:p-6 rounded-xl shadow-md border border-border">
          <h2 className="text-xl font-semibold mb-4 text-text-primary">Items con Bajo Stock</h2>
          {lowStockItems.length > 0 ? (
            <ul className="space-y-3 max-h-[380px] overflow-y-auto">
              {lowStockItems.map(item => (
                <li key={item.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-secondary">
                  <div>
                    <p className="font-medium text-text-primary">{item.name}</p>
                    <p className="text-sm text-text-secondary">SKU: {item.id}</p>
                  </div>
                  <span className="flex items-center text-sm font-bold text-warning bg-yellow-100 px-2 py-1 rounded-full">
                    <WarningIcon className="h-4 w-4 mr-1"/>
                    {item.stock} unidades
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-text-secondary mt-10 text-center">No hay productos con bajo stock.</p>
          )}
          <Link to="/inventory" className="mt-4 block text-center w-full bg-accent hover:bg-accent-hover text-white font-bold py-2 px-4 rounded-lg transition-colors">
            Ir a Inventario
          </Link>
        </div>
      </div>

      <div className="bg-primary p-4 sm:p-6 rounded-xl shadow-md border border-border">
          <h2 className="text-xl font-semibold mb-4 text-text-primary">Ventas a lo largo del Tiempo</h2>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={salesOverTimeData} margin={{ top: 5, right: 20, left: -10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" stroke="#6b7280" tick={{ fontSize: 12 }} />
              <YAxis stroke="#6b7280" tickFormatter={(value) => formatCurrency(Number(value))} />
              <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }}
                  labelStyle={{ color: '#1f2937' }}
                  formatter={(value: number) => [formatCurrency(value), "Ventas"]}
              />
              <Legend />
              <Line type="monotone" dataKey="Ventas" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

    </div>
  );
};

export default Dashboard;