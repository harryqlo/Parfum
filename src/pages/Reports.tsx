import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { AdjustmentType } from '../types';
import { formatCurrency } from '../utils/helpers';
import PageHero from '../components/PageHero';

type ReportType = 'sales' | 'inventory' | 'profit';

const Reports: React.FC = () => {
  const { products, sales, purchases, adjustments } = useData();

  const today = new Date().toISOString().split('T')[0];
  const thirtyDaysAgo = new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0];

  const [reportType, setReportType] = useState<ReportType>('sales');
  const [startDate, setStartDate] = useState(thirtyDaysAgo);
  const [endDate, setEndDate] = useState(today);
  const [generatedReport, setGeneratedReport] = useState<any>(null);

  const handleGenerateReport = () => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999); // Include the whole end day

    if (reportType === 'sales') {
      const filteredSales = sales.filter(s => {
        const saleDate = new Date(s.date);
        return saleDate >= start && saleDate <= end;
      });
      const totalRevenue = filteredSales.reduce((sum, s) => sum + s.total, 0);
      const totalItemsSold = filteredSales.reduce((sum, s) => sum + s.quantity, 0);
      setGeneratedReport({ type: 'sales', data: filteredSales, summary: { totalRevenue, totalItemsSold } });
    }
    
    if (reportType === 'inventory') {
        const stockValue = products.reduce((sum, p) => sum + p.stock * p.costPrice, 0);
        const totalUnits = products.reduce((sum, p) => sum + p.stock, 0);
        const totalTesters = products.reduce((sum, p) => sum + p.testerStock, 0);
        setGeneratedReport({ type: 'inventory', data: products, summary: { stockValue, totalUnits, totalTesters } });
    }
    
    if (reportType === 'profit') {
        const filteredSales = sales.filter(s => {
            const saleDate = new Date(s.date);
            return saleDate >= start && saleDate <= end;
        });
        
        const filteredAdjustments = adjustments.filter(a => {
            const adjDate = new Date(a.date);
            return adjDate >= start && adjDate <= end && a.type === AdjustmentType.TESTER_CONVERSION;
        });

        let totalRevenue = 0;
        let totalCostOfGoods = 0;

        const profitData = filteredSales.map(sale => {
            const product = products.find(p => p.id === sale.productId);
            const cost = product ? product.costPrice * sale.quantity : 0;
            const revenue = sale.total;
            const profit = revenue - cost;
            totalRevenue += revenue;
            totalCostOfGoods += cost;
            return { ...sale, productName: product?.name || 'N/A', cost, profit };
        });

        const totalTesterCost = filteredAdjustments.reduce((sum, a) => sum + a.cost, 0);
        const grossProfit = totalRevenue - totalCostOfGoods;
        const netProfit = grossProfit - totalTesterCost;
        const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

        setGeneratedReport({ type: 'profit', data: profitData, summary: { totalRevenue, totalCostOfGoods, totalTesterCost, netProfit, profitMargin } });
    }
  };

  const renderReport = () => {
    if (!generatedReport) return <p className="text-center text-text-secondary">Seleccione los parámetros y genere un reporte.</p>;

    if (generatedReport.type === 'sales') {
      return (
        <div>
          <h3 className="text-xl font-bold mb-4">Reporte de Ventas</h3>
          <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-secondary rounded-lg">
            <div><span className="font-semibold">Ingresos Totales:</span> {formatCurrency(generatedReport.summary.totalRevenue)}</div>
            <div><span className="font-semibold">Productos Vendidos:</span> {generatedReport.summary.totalItemsSold}</div>
          </div>
          <table className="w-full text-left">
            <thead><tr><th className="p-2 bg-secondary">Fecha</th><th className="p-2 bg-secondary">Producto</th><th className="p-2 bg-secondary">Cantidad</th><th className="p-2 bg-secondary">Total</th></tr></thead>
            <tbody>
              {generatedReport.data.map((s: any) => (
                <tr key={s.id} className="border-b"><td className="p-2">{s.date}</td><td className="p-2">{products.find(p=>p.id === s.productId)?.name}</td><td className="p-2">{s.quantity}</td><td className="p-2">{formatCurrency(s.total)}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
    
    if (generatedReport.type === 'inventory') {
      return (
        <div>
          <h3 className="text-xl font-bold mb-4">Reporte de Inventario</h3>
          <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-secondary rounded-lg">
            <div><span className="font-semibold">Valor Total (Costo):</span> {formatCurrency(generatedReport.summary.stockValue)}</div>
            <div><span className="font-semibold">Unidades Vendibles:</span> {generatedReport.summary.totalUnits}</div>
            <div><span className="font-semibold">Unidades Tester:</span> {generatedReport.summary.totalTesters}</div>
          </div>
          <table className="w-full text-left">
            <thead><tr><th className="p-2 bg-secondary">SKU</th><th className="p-2 bg-secondary">Producto</th><th className="p-2 bg-secondary">Stock Vendible</th><th className="p-2 bg-secondary">Testers</th><th className="p-2 bg-secondary">Valor (Costo)</th></tr></thead>
            <tbody>
              {generatedReport.data.map((p: any) => (
                <tr key={p.id} className="border-b"><td className="p-2">{p.id}</td><td className="p-2">{p.name}</td><td className="p-2">{p.stock}</td><td className="p-2">{p.testerStock}</td><td className="p-2">{formatCurrency(p.stock * p.costPrice)}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    if (generatedReport.type === 'profit') {
      return (
        <div>
          <h3 className="text-xl font-bold mb-4">Análisis de Rentabilidad</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6 p-4 bg-secondary rounded-lg">
            <div><span className="font-semibold">Ingresos Totales:</span> {formatCurrency(generatedReport.summary.totalRevenue)}</div>
            <div><span className="font-semibold">Costo Mercancía:</span> {formatCurrency(generatedReport.summary.totalCostOfGoods)}</div>
            <div><span className="font-semibold">Costo Muestras (Testers):</span> {formatCurrency(generatedReport.summary.totalTesterCost)}</div>
            <div className="col-span-2 md:col-span-3 grid grid-cols-2 gap-4 mt-2 pt-2 border-t">
              <div className="font-bold text-lg">Ganancia Neta: <span className="text-success">{formatCurrency(generatedReport.summary.netProfit)}</span></div>
              <div className="font-bold text-lg">Margen Neto: <span className="text-success">{generatedReport.summary.profitMargin.toFixed(2)}%</span></div>
            </div>
          </div>
          <h4 className="text-lg font-semibold mb-2">Detalle de Ventas del Período</h4>
          <table className="w-full text-left">
            <thead><tr><th className="p-2 bg-secondary">Fecha</th><th className="p-2 bg-secondary">Producto</th><th className="p-2 bg-secondary">Ingreso</th><th className="p-2 bg-secondary">Costo</th><th className="p-2 bg-secondary">Ganancia Bruta</th></tr></thead>
            <tbody>
              {generatedReport.data.map((s: any) => (
                <tr key={s.id} className="border-b"><td className="p-2">{s.date}</td><td className="p-2">{s.productName}</td><td className="p-2">{formatCurrency(s.total)}</td><td className="p-2">{formatCurrency(s.cost)}</td><td className="p-2">{formatCurrency(s.profit)}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
  };

  return (
    <div className="space-y-6">
      <PageHero
        title="Controles del Reporte"
        actions={
          <div className="flex w-full flex-col gap-4">
            <div className="grid w-full gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="sm:col-span-2 lg:col-span-1">
                <label htmlFor="report-type" className="block text-xs font-semibold uppercase tracking-wide text-slate-700">
                  Tipo de Reporte
                </label>
                <select
                  id="report-type"
                  value={reportType}
                  onChange={e => setReportType(e.target.value as ReportType)}
                  className="mt-1 block w-full rounded-lg border border-border bg-white/80 px-3 py-2 text-sm shadow-sm backdrop-blur focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  <option value="sales">Resumen de Ventas</option>
                  <option value="inventory">Reporte de Inventario</option>
                  <option value="profit">Análisis de Rentabilidad</option>
                </select>
              </div>
              <div className="sm:col-span-1 lg:col-span-1">
                <label htmlFor="report-start-date" className="block text-xs font-semibold uppercase tracking-wide text-slate-700">
                  Fecha de Inicio
                </label>
                <input
                  id="report-start-date"
                  type="date"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-border bg-white/80 px-3 py-2 text-sm shadow-sm backdrop-blur focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={reportType === 'inventory'}
                />
              </div>
              <div className="sm:col-span-1 lg:col-span-1">
                <label htmlFor="report-end-date" className="block text-xs font-semibold uppercase tracking-wide text-slate-700">
                  Fecha de Fin
                </label>
                <input
                  id="report-end-date"
                  type="date"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-border bg-white/80 px-3 py-2 text-sm shadow-sm backdrop-blur focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={reportType === 'inventory'}
                />
              </div>
            </div>
            <div className="flex flex-wrap justify-end gap-2">
              <button
                onClick={handleGenerateReport}
                className="inline-flex items-center justify-center rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white shadow-md transition-colors hover:bg-accent-hover"
              >
                Generar Reporte
              </button>
              <button
                onClick={() => window.print()}
                disabled={!generatedReport}
                className="inline-flex items-center justify-center rounded-lg border border-border bg-white/70 px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm backdrop-blur transition-colors hover:bg-white/80 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Imprimir
              </button>
            </div>
          </div>
        }
      />
      <div className="bg-primary p-6 rounded-xl shadow-md border border-border min-h-[300px]">
        <div id="print-area">
            {generatedReport && <div className="mb-4 text-center"><h2 className="text-2xl font-bold">Reporte de {reportType === 'sales' ? 'Ventas' : reportType === 'inventory' ? 'Inventario' : 'Rentabilidad'}</h2><p>Periodo: {startDate} a {endDate}</p></div>}
            {renderReport()}
        </div>
      </div>
    </div>
  );
};

export default Reports;