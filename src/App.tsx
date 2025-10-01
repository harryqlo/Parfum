import React, { useState } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Purchases from './pages/Purchases';
import Sales from './pages/Sales';
import Reports from './pages/Reports';
import POS from './pages/POS';
import CashFlow from './pages/CashFlow';
import ConfirmationModal from './components/ConfirmationModal';
import ToastContainer from './components/ToastContainer';
import ProductDetail from './pages/ProductDetail';
import Customers from './pages/Customers';
import CustomerDetail from './pages/CustomerDetail';

const App: React.FC = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  return (
    <HashRouter>
      <div className="flex h-screen bg-background">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header onMenuClick={() => setSidebarOpen(true)} />
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background p-4 sm:p-6">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/inventory/:productId" element={<ProductDetail />} />
              <Route path="/purchases" element={<Purchases />} />
              <Route path="/pos" element={<POS />} />
              <Route path="/sales" element={<Sales />} />
              <Route path="/customers" element={<Customers />} />
              <Route path="/customers/:customerId" element={<CustomerDetail />} />
              <Route path="/cashflow" element={<CashFlow />} />
              <Route path="/reports" element={<Reports />} />
            </Routes>
          </main>
        </div>
      </div>
      <ConfirmationModal />
      <ToastContainer />
    </HashRouter>
  );
};

export default App;