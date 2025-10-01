import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import DashboardCard from '../components/DashboardCard';
import { DollarSignIcon, TrendingUpIcon, TrendingDownIcon } from '../components/Icons';
import { AdjustmentType } from '../types';
import { formatCurrency } from '../utils/helpers';
import PageHero from '../components/PageHero';

const CashFlow: React.FC = () => {
  const { products, sales, purchases, adjustments } = useData();

  const thirtyDaysAgo = new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0];
  const today = new Date().toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(thirtyDaysAgo);
  const [endDate, setEndDate] = useState(today);

  const processedData = useMemo(() => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const incomeTransactions = sales
      .filter(s => {
        const saleDate = new Date(s.date);
        return saleDate >= start && saleDate <= end;
      })
      .map(s => ({
        date: s.date,
        type: 'Ingreso' as const,
        description: `Venta - ${products.find(p => p.id === s.productId)?.name || s.productId}`,
        amount: s.total
      }));

    const expenseFromPurchases = purchases
      .filter(p => {
        const purchaseDate = new Date(p.date);
        return purchaseDate >= start && purchaseDate <= end;
      })
      .map(p => ({
        date: p.date,
        type: 'Egreso' as const,
        description: `Compra - ${products.find(prod => prod.id === p.productId)?.name || p.productId}`,
        amount: p.unitCost * p.quantity
      }));

    const expenseFromTesters = adjustments
      .filter(a => {
        const adjDate = new Date(a.date);
        return adjDate >= start && adjDate <= end && a.type === AdjustmentType.TESTER_CONVERSION;
      })
      .map(a => ({
        date: a.date,
        type: 'Egreso' as const,
        description: `Inversión Tester - ${products.find(p => p.id === a.productId)?.name || a.productId}`,
        amount: a.cost
      }));
      
    const allTransactions = [...incomeTransactions, ...expenseFromPurchases, ...expenseFromTesters]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    let runningBalance = 0;
    const transactionsWithBalance = allTransactions.map(t => {
      runningBalance += t.type === 'Ingreso' ? t.amount : -t.amount;
      return { ...t, balance: runningBalance };
    });
    
    // Create data points for the chart, grouping by day
    const chartDataMap = new Map<string, number>();
    transactionsWithBalance.forEach(t => {
        chartDataMap.set(t.date, t.balance);
    });

    const chartData = Array.from(chartDataMap, ([date, Saldo]) => ({ date, Saldo }));

    const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = [...expenseFromPurchases, ...expenseFromTesters].reduce((sum, t) => sum + t.amount, 0);
    const netCashFlow = totalIncome - totalExpenses;

    return {
      transactionsWithBalance,
      chartData,
      totalIncome,
      totalExpenses,
      netCashFlow
    };

  }, [sales, purchases, products, adjustments, startDate, endDate]);


  return (
    <div className="space-y-6">
      <PageHero
        title="Flujo de Caja"
        subtitle="Analiza ingresos, egresos y saldo disponible para el período seleccionado."
        actions={
          <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1 min-w-[180px]">
              <label htmlFor="cashflow-start-date" className="block text-xs font-semibold uppercase tracking-wide text-slate-700">
                Fecha de Inicio
              </label>
              <input
                id="cashflow-start-date"
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-border bg-white/80 px-3 py-2 text-sm shadow-sm backdrop-blur focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
            <div className="flex-1 min-w-[180px]">
              <label htmlFor="cashflow-end-date" className="block text-xs font-semibold uppercase tracking-wide text-slate-700">
                Fecha de Fin
              </label>
              <input
                id="cashflow-end-date"
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-border bg-white/80 px-3 py-2 text-sm shadow-sm backdrop-blur focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
          </div>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <DashboardCard
          title="Ingresos Totales"
          value={formatCurrency(processedData.totalIncome)}
          icon={<TrendingUpIcon className="h-6 w-6 text-white" />}
          color="from-emerald-400 via-emerald-300 to-green-200"
        />
        <DashboardCard
          title="Egresos Totales"
          value={formatCurrency(processedData.totalExpenses)}
          icon={<TrendingDownIcon className="h-6 w-6 text-white" />}
          color="from-rose-400 via-rose-300 to-pink-200"
        />
        <DashboardCard
          title="Flujo de Caja Neto"
          value={formatCurrency(processedData.netCashFlow)}
          icon={<DollarSignIcon className="h-6 w-6 text-white" />}
          color="from-indigo-400 via-indigo-300 to-sky-200"
        />
      </div>

      <div className="bg-primary p-4 sm:p-6 rounded-xl shadow-md border border-border">
          <h2 className="text-xl font-semibold mb-4 text-text-primary">Evolución del Saldo de Caja</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={processedData.chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" stroke="#6b7280" tick={{ fontSize: 12 }} />
              <YAxis stroke="#6b7280" tickFormatter={(value) => formatCurrency(Number(value))} />
              <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }}
                  labelStyle={{ color: '#1f2937' }}
                  formatter={(value: number) => [formatCurrency(value), "Saldo"]}
              />
              <Legend />
              <Line type="monotone" dataKey="Saldo" stroke="#6366f1" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      
      <div className="bg-primary rounded-xl shadow-md overflow-hidden border border-border">
        <h2 className="text-xl font-bold p-4 border-b">Detalle de Movimientos</h2>
        <div className="overflow-x-auto max-h-96">
          <table className="w-full">
            <thead className="bg-secondary sticky top-0">
              <tr>
                <th className="p-4 font-semibold text-left">Fecha</th>
                <th className="p-4 font-semibold text-left">Descripción</th>
                <th className="p-4 font-semibold text-left">Tipo</th>
                <th className="p-4 font-semibold text-right">Monto</th>
                <th className="p-4 font-semibold text-right">Saldo</th>
              </tr>
            </thead>
            <tbody>
              {processedData.transactionsWithBalance.length > 0 ? (
                processedData.transactionsWithBalance.map((t, index) => (
                  <tr key={index} className="border-b border-border hover:bg-secondary/50">
                    <td className="p-4">{t.date}</td>
                    <td className="p-4">{t.description}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        t.type === 'Ingreso' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {t.type}
                      </span>
                    </td>
                    <td className={`p-4 text-right font-medium ${
                      t.type === 'Ingreso' ? 'text-success' : 'text-danger'
                    }`}>
                      {t.type === 'Ingreso' ? '+' : '-'}{formatCurrency(t.amount)}
                    </td>
                    <td className="p-4 text-right font-semibold">{formatCurrency(t.balance)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-text-secondary">
                    No hay transacciones en el período seleccionado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CashFlow;