import React from 'react';

interface DashboardCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, value, icon, color }) => {
  return (
    <div className="bg-primary p-5 rounded-xl shadow-md border border-border flex items-center space-x-4 transition-transform hover:scale-105">
      <div className={`p-3 rounded-full ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-text-secondary">{title}</p>
        <p className="text-2xl font-bold text-text-primary">{value}</p>
      </div>
    </div>
  );
};

export default React.memo(DashboardCard);