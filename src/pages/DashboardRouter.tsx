import { useApp } from '../context/AppContext';
import { BuyerDashboard } from './dashboards/BuyerDashboard';
import { SupplierDashboard } from './dashboards/SupplierDashboard';
import { LogisticsDashboard } from './dashboards/LogisticsDashboard';
import { AdminDashboard } from './dashboards/AdminDashboard';
import { FarmerModeDashboard } from './dashboards/FarmerModeDashboard';
import { Navigate } from 'react-router-dom';

export function DashboardRouter() {
  const { session, farmerMode } = useApp();
  if (!session) return <Navigate to="/login" />;
  if (farmerMode && (session.role === 'buyer' || session.role === 'supplier')) {
    return <FarmerModeDashboard />;
  }
  switch (session.role) {
    case 'buyer': return <BuyerDashboard />;
    case 'supplier': return <SupplierDashboard />;
    case 'logistics': return <LogisticsDashboard />;
    case 'admin': return <AdminDashboard />;
    default: return <Navigate to="/login" />;
  }
}
