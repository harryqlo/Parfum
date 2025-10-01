import React from 'react';

interface DashboardCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, value, icon, color }) => {
  return (
    <div className="bg-white/90 backdrop-blur p-5 rounded-2xl shadow-lg ring-1 ring-white/50 flex items-center space-x-4 transition-transform duration-200 hover:-translate-y-1">
      <div className={`p-3 rounded-full bg-gradient-to-br ${color} shadow-md shadow-black/10`}>{icon}</div>
      <div>
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
      </div>
    </div>
  );
};

export default React.memo(DashboardCard);