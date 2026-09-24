import { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LogOut, Bell, ChevronDown } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { LanguageSwitcher } from '../ui/LanguageSwitcher';
import type { UserRole } from '../../types';

interface NavItem {
  label: string;
  path: string;
}

function getNavItems(role: UserRole): NavItem[] {
  switch (role) {
    case 'buyer':
      return [
        { label: 'Dashboard', path: '/app/dashboard' },
        { label: 'Demands', path: '/app/demands' },
        { label: 'Matches', path: '/app/matches' },
        { label: 'Transactions', path: '/app/transactions' },
        { label: 'Deliveries', path: '/app/deliveries' },
      ];
    case 'supplier':
      return [
        { label: 'Dashboard', path: '/app/dashboard' },
        { label: 'My Supply', path: '/app/supply/manage' },
        { label: 'Requests', path: '/app/requests' },
        { label: 'Active Orders', path: '/app/transactions' },
        { label: 'Fulfilment', path: '/app/shipments' },
      ];
    case 'logistics':
      return [
        { label: 'Dashboard', path: '/app/dashboard' },
        { label: 'Assignments', path: '/app/jobs' },
        { label: 'Active Deliveries', path: '/app/shipments' },
        { label: 'History', path: '/app/deliveries' },
      ];
    case 'admin':
      return [
        { label: 'Overview', path: '/app/dashboard' },
        { label: 'Users', path: '/app/admin/users' },
        { label: 'Transactions', path: '/app/admin/transactions' },
        { label: 'Logistics Jobs', path: '/app/admin/logistics' },
        { label: 'Disputes', path: '/app/admin/disputes' },
        { label: 'Audit Trail', path: '/app/admin/audit' },
      ];
  }
}

export function Navbar() {
  const { session, logout, unreadCount } = useApp();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!session) return null;

  const navItems = getNavItems(session.role);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">

          {/* Left: Logo */}
          <NavLink to="/app/dashboard" className="flex items-center gap-2 shrink-0">
            <div className="w-7 h-7 rounded-md bg-[#0c1e0e] flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M8 2C8 2 3 5 3 9a5 5 0 0010 0c0-4-5-7-5-7z" fill="#4ade80" />
                <path d="M8 6v6M5 9h6" stroke="#0c1e0e" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <span className="font-bold text-gray-900 text-sm tracking-tight hidden sm:block">AgriFlow</span>
          </NavLink>

          {/* Center: Nav tabs */}
          <nav className="hidden md:flex items-center gap-0.5 flex-1 justify-center mx-6">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path.endsWith('dashboard')}
                className={({ isActive }) =>
                  `px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? 'text-gray-900 bg-gray-100'
                      : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Right: Utilities + User */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="hidden sm:flex items-center gap-1.5">
              <LanguageSwitcher />
              <button
                type="button"
                onClick={() => {
                  const w = document.querySelector<HTMLButtonElement>('#speech-widget button');
                  if (w) w.click();
                }}
                className="p-2 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors text-xs"
                title="Listen to page"
              >
                🔊
              </button>
            </div>

            <NavLink
              to="/app/notifications"
              className="relative p-2 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-green-600" />
              )}
            </NavLink>

            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 py-1.5 px-2 rounded-md hover:bg-gray-50 text-sm font-medium text-gray-700 transition-colors"
              >
                <div className="w-6 h-6 rounded-full bg-gray-900 text-white flex items-center justify-center text-xs font-bold">
                  {session.name.charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:block max-w-[120px] truncate text-gray-800 text-sm">
                  {session.name}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-1.5 w-52 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                  <div className="px-4 py-2.5 border-b border-gray-100">
                    <p className="text-xs font-semibold text-gray-900 truncate">{session.name}</p>
                    <p className="text-[11px] text-gray-400 truncate mt-0.5">{session.email}</p>
                    <span className="inline-block mt-1.5 text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 font-medium capitalize">
                      {session.role === 'logistics' ? 'Logistics Provider' : session.role}
                    </span>
                  </div>
                  <div className="py-1">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile nav scrollbar */}
      <div className="md:hidden flex overflow-x-auto px-4 py-1.5 border-t border-gray-50 gap-1 no-scrollbar">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `px-2.5 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                isActive ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </div>
    </header>
  );
}
