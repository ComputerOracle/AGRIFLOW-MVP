import { useApp } from '../context/AppContext';
import { BuyerDashboard } from './dashboards/BuyerDashboard';
import { SupplierDashboard } from './dashboards/SupplierDashboard';
import { LogisticsDashboard } from './dashboards/LogisticsDashboard';
import { AdminDashboard } from './dashboards/AdminDashboard';
import { Navigate } from 'react-router-dom';

export function DashboardRouter() {
  const { session } = useApp();
  if (!session) return <Navigate to="/login" />;
  switch (session.role) {
    case 'buyer': return <BuyerDashboard />;
    case 'supplier': return <SupplierDashboard />;
    case 'logistics': return <LogisticsDashboard />;
    case 'admin': return <AdminDashboard />;
    default: return <Navigate to="/login" />;
  }
}
