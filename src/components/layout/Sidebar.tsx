import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Search, FileText, ArrowRightLeft, Truck,
  Bell, Package, ClipboardList, Users, BarChart3,
  AlertTriangle, BookOpen
} from 'lucide-react';
import { AgriFlowLogo } from '../ui/AgriFlowLogo';
import type { UserRole } from '../../types';
import { useApp } from '../../context/AppContext';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

function getNavItems(role: UserRole): NavItem[] {
  switch (role) {
    case 'buyer':
      return [
        { label: 'Dashboard', path: '/app/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
        { label: 'Find Supply', path: '/app/supply', icon: <Search className="w-4 h-4" /> },
        { label: 'My Demands', path: '/app/demands', icon: <FileText className="w-4 h-4" /> },
        { label: 'Transactions', path: '/app/transactions', icon: <ArrowRightLeft className="w-4 h-4" /> },
        { label: 'Shipments', path: '/app/shipments', icon: <Truck className="w-4 h-4" /> },
        { label: 'Notifications', path: '/app/notifications', icon: <Bell className="w-4 h-4" /> },
      ];
    case 'supplier':
      return [
        { label: 'Dashboard', path: '/app/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
        { label: 'My Supply', path: '/app/supply/manage', icon: <Package className="w-4 h-4" /> },
        { label: 'Requests', path: '/app/requests', icon: <ArrowRightLeft className="w-4 h-4" /> },
        { label: 'Fulfilment', path: '/app/shipments', icon: <Truck className="w-4 h-4" /> },
        { label: 'Notifications', path: '/app/notifications', icon: <Bell className="w-4 h-4" /> },
      ];
    case 'logistics':
      return [
        { label: 'Dashboard', path: '/app/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
        { label: 'Job Queue', path: '/app/jobs', icon: <ClipboardList className="w-4 h-4" /> },
        { label: 'Active Shipments', path: '/app/shipments', icon: <Truck className="w-4 h-4" /> },
        { label: 'Notifications', path: '/app/notifications', icon: <Bell className="w-4 h-4" /> },
      ];
    case 'admin':
      return [
        { label: 'Overview', path: '/app/dashboard', icon: <BarChart3 className="w-4 h-4" /> },
        { label: 'Users', path: '/app/admin/users', icon: <Users className="w-4 h-4" /> },
        { label: 'Transactions', path: '/app/admin/transactions', icon: <ArrowRightLeft className="w-4 h-4" /> },
        { label: 'Logistics Jobs', path: '/app/admin/logistics', icon: <Truck className="w-4 h-4" /> },
        { label: 'Disputes', path: '/app/admin/disputes', icon: <AlertTriangle className="w-4 h-4" /> },
        { label: 'Audit Trail', path: '/app/admin/audit', icon: <BookOpen className="w-4 h-4" /> },
        { label: 'Notifications', path: '/app/notifications', icon: <Bell className="w-4 h-4" /> },
      ];
  }
}

export function Sidebar() {
  const { session, unreadCount } = useApp();
  if (!session) return null;

  const navItems = getNavItems(session.role);
  const roleLabels: Record<UserRole, string> = {
    buyer: 'Buyer', supplier: 'Supplier', logistics: 'Logistics Provider', admin: 'Operations Admin',
  };
  const roleBg: Record<UserRole, string> = {
    buyer: 'bg-green-100 text-green-800',
    supplier: 'bg-green-100 text-green-800',
    logistics: 'bg-green-100 text-green-800',
    admin: 'bg-gray-100 text-gray-800',
  };

  return (
    <aside className="w-60 min-h-screen bg-white border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-100">
        <AgriFlowLogo size="md" />
      </div>

      {/* User info */}
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-agri-700 flex items-center justify-center text-white text-sm font-semibold">
            {session.name[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-gray-800 truncate">{session.name}</div>
            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${roleBg[session.role]}`}>
              {roleLabels[session.role]}
            </span>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path.endsWith('dashboard')}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
               ${isActive ? 'bg-agri-50 text-agri-800 font-semibold' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`
            }
          >
            {item.icon}
            <span className="flex-1">{item.label}</span>
            {item.label === 'Notifications' && unreadCount > 0 && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-agri-600 text-white">
                {unreadCount}
              </span>
            )}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
