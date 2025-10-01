import React from 'react';
import { useData } from '../context/DataContext';
import DashboardCard from '../components/DashboardCard';
import { PackageIcon, DollarSignIcon, BarChartIcon, ShoppingCartIcon, WarningIcon, DocumentTextIcon, ArchiveIcon } from '../components/Icons';
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
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-6 py-12 text-white shadow-2xl">
        <div className="absolute inset-0 opacity-40 mix-blend-soft-light bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.4),_transparent_55%)]" aria-hidden="true" />
        <div className="relative z-10 max-w-3xl space-y-4">
          <span className="inline-flex items-center rounded-full bg-white/15 px-4 py-1 text-xs font-semibold uppercase tracking-widest shadow-sm ring-1 ring-white/40">Panel general</span>
          <h1 className="text-3xl font-bold leading-tight sm:text-4xl">Bienvenido al tablero de gestión de Parfum</h1>
          <p className="text-base text-indigo-100 sm:text-lg">Visualiza el pulso de tu negocio de un vistazo: inventario, ventas y métricas clave en un solo lugar para tomar decisiones estratégicas más rápido.</p>
          <div>
            <Link
              to="/reports"
              className="inline-flex items-center gap-2 rounded-full bg-white/20 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white shadow-lg shadow-indigo-900/30 ring-1 ring-white/40 backdrop-blur transition hover:bg-white/30"
            >
              <DocumentTextIcon className="h-5 w-5" />
              Ver reportes
            </Link>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <DashboardCard
          title="Valor del Stock (Costo)"
          value={formatCurrency(totalStockValue)}
          icon={<PackageIcon className="h-6 w-6 text-white" />}
          color="from-indigo-500 to-indigo-600"
        />
        <DashboardCard
          title="Ingresos Totales"
          value={formatCurrency(totalRevenue)}
          icon={<DollarSignIcon className="h-6 w-6 text-white" />}
          color="from-emerald-500 to-emerald-600"
        />
        <DashboardCard
          title="Ganancia Total"
          value={formatCurrency(totalProfit)}
          icon={<BarChartIcon className="h-6 w-6 text-white" />}
          color="from-amber-500 to-orange-500"
        />
        <DashboardCard
          title="Total de Ventas"
          value={sales.length.toString()}
          icon={<ShoppingCartIcon className="h-6 w-6 text-white" />}
          color="from-rose-500 to-rose-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-3xl bg-white/80 p-6 backdrop-blur shadow-xl ring-1 ring-slate-200/60">
            <h2 className="mb-4 text-2xl font-semibold tracking-tight text-slate-900">Ventas por Producto (Top 10)</h2>
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
        <div className="rounded-3xl bg-slate-900/80 p-6 backdrop-blur shadow-xl ring-1 ring-slate-800/60">
          <h2 className="mb-4 text-2xl font-semibold tracking-tight text-white">Items con Bajo Stock</h2>
          {lowStockItems.length > 0 ? (
            <ul className="max-h-[380px] space-y-3 overflow-y-auto pr-1">
              {lowStockItems.map(item => (
                <li key={item.id} className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 p-3 transition hover:bg-white/10">
                  <div>
                    <p className="font-medium text-white">{item.name}</p>
                    <p className="text-sm text-slate-300">SKU: {item.id}</p>
                  </div>
                  <span className="flex items-center rounded-full bg-amber-400/20 px-3 py-1 text-sm font-semibold text-amber-200">
                    <WarningIcon className="mr-1 h-4 w-4"/>
                    {item.stock} unidades
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-10 text-center text-slate-300">No hay productos con bajo stock.</p>
          )}
          <Link
            to="/inventory"
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-amber-300 via-orange-400 to-rose-400 px-5 py-3 text-sm font-semibold uppercase tracking-wide text-slate-900 shadow-md shadow-amber-500/30 transition hover:shadow-lg"
          >
            <ArchiveIcon className="h-5 w-5" />
            Ir a Inventario
          </Link>
        </div>
      </div>

      <div className="rounded-3xl bg-white/80 p-6 backdrop-blur shadow-xl ring-1 ring-slate-200/60">
          <h2 className="mb-4 text-2xl font-semibold tracking-tight text-slate-900">Ventas a lo largo del Tiempo</h2>
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