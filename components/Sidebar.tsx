import React from 'react';
import { NavLink } from 'react-router-dom';
import { HomeIcon, PackageIcon, ShoppingCartIcon, DollarSignIcon, BarChartIcon, CloseIcon, DocumentTextIcon, LightningBoltIcon, TrendingUpIcon, UsersIcon } from './Icons';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const navLinkClasses = 'flex items-center px-4 py-3 text-text-secondary hover:bg-secondary hover:text-text-primary rounded-lg transition-colors duration-200';
  const activeNavLinkClasses = 'bg-accent text-white font-semibold';

  return (
    <>
      {/* Overlay for mobile */}
      <div 
        className={`fixed inset-0 bg-black bg-opacity-50 z-30 transition-opacity lg:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      ></div>

      <div className={`fixed top-0 left-0 h-full w-64 bg-primary flex-shrink-0 p-4 border-r border-border z-40 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-accent mr-2"><path d="M14 19.5v-5.5a2.5 2.5 0 1 0-5 0v5.5a.5.5 0 0 0 .5.5h4a.5.5 0 0 0 .5-.5Z"/><path d="M12 22a2.5 2.5 0 0 0 2.5-2.5V18h-5v1.5A2.5 2.5 0 0 0 12 22Z"/><path d="M12 2a3 3 0 0 0-3 3v2h6V5a3 3 0 0 0-3-3Z"/><path d="M10 2v3"/><path d="M14 2v3"/></svg>
            <h1 className="text-2xl font-bold text-text-primary">Perfume ERP</h1>
          </div>
          <button onClick={onClose} className="lg:hidden text-text-secondary hover:text-text-primary">
            <CloseIcon className="h-6 w-6" />
          </button>
        </div>
        <nav className="space-y-2">
          <NavLink to="/" onClick={onClose} className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`}>
            <HomeIcon className="h-5 w-5 mr-3" /> Dashboard
          </NavLink>
          <NavLink to="/inventory" onClick={onClose} className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`}>
            <PackageIcon className="h-5 w-5 mr-3" /> Inventario
          </NavLink>
          <NavLink to="/purchases" onClick={onClose} className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`}>
            <ShoppingCartIcon className="h-5 w-5 mr-3" /> Compras
          </NavLink>
           <NavLink to="/customers" onClick={onClose} className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`}>
            <UsersIcon className="h-5 w-5 mr-3" /> Clientes
          </NavLink>
          <NavLink to="/pos" onClick={onClose} className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`}>
            <LightningBoltIcon className="h-5 w-5 mr-3" /> Venta Rápida
          </NavLink>
          <NavLink to="/sales" onClick={onClose} className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`}>
            <DollarSignIcon className="h-5 w-5 mr-3" /> Historial Ventas
          </NavLink>
           <NavLink to="/cashflow" onClick={onClose} className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`}>
            <TrendingUpIcon className="h-5 w-5 mr-3" /> Flujo de Caja
          </NavLink>
          <NavLink to="/reports" onClick={onClose} className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`}>
            <DocumentTextIcon className="h-5 w-5 mr-3" /> Reportes
          </NavLink>
          <NavLink to="/analytics" onClick={onClose} className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`}>
            <BarChartIcon className="h-5 w-5 mr-3" /> Análisis IA
          </NavLink>
        </nav>
      </div>
    </>
  );
};

export default Sidebar;