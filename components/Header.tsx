import React from 'react';
import { useLocation } from 'react-router-dom';
import { MenuIcon } from './Icons';

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const location = useLocation();
  const getTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Dashboard';
    if (path === '/inventory') return 'Gestión de Inventario';
    if (path.startsWith('/inventory/')) return 'Detalle de Producto';
    if (path === '/purchases') return 'Registro de Compras';
    if (path === '/pos') return 'Punto de Venta (POS)';
    if (path === '/sales') return 'Historial de Ventas';
    if (path === '/customers') return 'Gestión de Clientes';
    if (path.startsWith('/customers/')) return 'Detalle de Cliente';
    if (path === '/cashflow') return 'Análisis de Flujo de Caja';
    if (path === '/reports') return 'Generador de Reportes';
    return 'Perfume ERP Pro';
  };

  return (
    <header className="bg-primary p-4 shadow-sm border-b border-border flex items-center">
      <button onClick={onMenuClick} className="lg:hidden text-text-secondary mr-4">
        <MenuIcon className="h-6 w-6" />
      </button>
      <h1 className="text-xl font-semibold text-text-primary">{getTitle()}</h1>
    </header>
  );
};

export default Header;