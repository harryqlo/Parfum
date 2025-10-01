import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { AdjustmentType } from '../types';
import { formatCurrency } from '../utils/helpers';
import DataTable from '../components/DataTable';

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
          <DataTable
            columns={[
              { key: 'date', header: 'Fecha', accessor: 'date' },
              {
                key: 'product',
                header: 'Producto',
                render: (sale: any) => products.find(p => p.id === sale.productId)?.name || sale.productId,
                className: 'min-w-[200px]'
              },
              { key: 'quantity', header: 'Cantidad', accessor: 'quantity', variant: 'badge' },
              {
                key: 'total',
                header: 'Total',
                render: (sale: any) => formatCurrency(sale.total),
                className: 'font-semibold'
              }
            ]}
            rows={generatedReport.data}
            rowKey={(sale: any) => sale.id}
            emptyState={<p className="text-text-secondary">No hay ventas en el período seleccionado.</p>}
          />
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
          <DataTable
            columns={[
              {
                key: 'sku',
                header: 'SKU',
                render: (product: any) => <span className="font-mono text-sm">{product.id}</span>,
                className: 'whitespace-nowrap'
              },
              { key: 'name', header: 'Producto', accessor: 'name', className: 'min-w-[200px]' },
              { key: 'stock', header: 'Stock Vendible', accessor: 'stock', variant: 'badge' },
              { key: 'testerStock', header: 'Testers', accessor: 'testerStock', variant: 'badge' },
              {
                key: 'stockValue',
                header: 'Valor (Costo)',
                render: (product: any) => formatCurrency(product.stock * product.costPrice),
                className: 'font-semibold'
              }
            ]}
            rows={generatedReport.data}
            rowKey={(product: any) => product.id}
            emptyState={<p className="text-text-secondary">No hay inventario para mostrar.</p>}
          />
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
          <DataTable
            columns={[
              { key: 'date', header: 'Fecha', accessor: 'date' },
              { key: 'productName', header: 'Producto', accessor: 'productName', className: 'min-w-[200px]' },
              { key: 'revenue', header: 'Ingreso', render: (sale: any) => formatCurrency(sale.total) },
              { key: 'cost', header: 'Costo', render: (sale: any) => formatCurrency(sale.cost) },
              {
                key: 'profit',
                header: 'Ganancia Bruta',
                render: (sale: any) => <span className="text-success font-semibold">{formatCurrency(sale.profit)}</span>
              }
            ]}
            rows={generatedReport.data}
            rowKey={(sale: any) => sale.id}
            emptyState={<p className="text-text-secondary">No hay datos de rentabilidad para el período seleccionado.</p>}
          />
        </div>
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-primary p-6 rounded-xl shadow-md border border-border">
        <h2 className="text-2xl font-bold mb-4">Controles del Reporte</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-text-secondary">Tipo de Reporte</label>
            <select value={reportType} onChange={e => setReportType(e.target.value as ReportType)} className="mt-1 block w-full bg-secondary border-border rounded-md shadow-sm focus:ring-accent focus:border-accent">
              <option value="sales">Resumen de Ventas</option>
              <option value="inventory">Reporte de Inventario</option>
              <option value="profit">Análisis de Rentabilidad</option>
            </select>
          </div>
          <div className="flex space-x-4 col-span-1 md:col-span-2">
            <div className="flex-1">
              <label className="block text-sm font-medium text-text-secondary">Fecha de Inicio</label>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="mt-1 block w-full bg-secondary border-border rounded-md shadow-sm focus:ring-accent focus:border-accent" disabled={reportType === 'inventory'} />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-text-secondary">Fecha de Fin</label>
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="mt-1 block w-full bg-secondary border-border rounded-md shadow-sm focus:ring-accent focus:border-accent" disabled={reportType === 'inventory'} />
            </div>
          </div>
        </div>
        <div className="mt-4 flex justify-end space-x-2">
          <button onClick={handleGenerateReport} className="bg-accent hover:bg-accent-hover text-white font-bold py-2 px-4 rounded-lg">Generar Reporte</button>
          <button onClick={() => window.print()} disabled={!generatedReport} className="bg-primary hover:bg-secondary border border-border text-text-primary font-bold py-2 px-4 rounded-lg disabled:opacity-50">Imprimir</button>
        </div>
      </div>
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