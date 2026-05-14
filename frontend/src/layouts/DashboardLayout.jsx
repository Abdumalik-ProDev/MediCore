import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../stores/AuthContext';
import { NAV_ITEMS } from '../utils/constants';
import {
  LayoutDashboard, Stethoscope, Users, ClipboardList,
  LogOut, Menu, X, HeartPulse,
} from 'lucide-react';

const icons = {
  Dashboard: LayoutDashboard,
  Doctors: Stethoscope,
  Patients: Users,
  Diagnoses: ClipboardList,
};

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const allowedItems = NAV_ITEMS.filter((item) => item.roles.includes(user?.role));

  return (
    <div className="min-h-screen flex">
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 lg:translate-x-0 lg:static lg:inset-auto ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-200">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary-500 text-white">
            <HeartPulse size={22} />
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-900">MediCore</h2>
            <p className="text-xs text-gray-500">MRMS Portal</p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {allowedItems.map((item) => {
            const Icon = icons[item.label];
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                {Icon && <Icon size={20} />}
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-primary-500 text-white flex items-center justify-center text-sm font-medium">
              {user?.email?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user?.email}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-600 rounded-lg hover:bg-gray-50 hover:text-red-600 transition-colors"
          >
            <LogOut size={18} />
            Sign out
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
          >
            <Menu size={24} />
          </button>
          <div className="flex items-center gap-2">
            <HeartPulse size={20} className="text-primary-500" />
            <span className="font-semibold text-gray-900">MediCore</span>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
          >
            <LogOut size={20} />
          </button>
        </header>

        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
