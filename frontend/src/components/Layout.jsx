import React from 'react';
import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import { 
  LayoutDashboard, 
  DoorOpen, 
  Monitor, 
  CalendarDays, 
  BarChart3, 
  History, 
  Bell,
  LogOut,
  User as UserIcon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const SidebarItem = ({ to, icon: Icon, label }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
        isActive 
          ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30' 
          : 'text-slate-500 hover:bg-slate-100'
      }`
    }
  >
    <Icon size={20} />
    <span className="font-medium">{label}</span>
  </NavLink>
);

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden text-slate-900">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-slate-200 flex flex-col p-6 gap-8">
        <div className="flex items-center gap-3 px-2">
          <div className="bg-primary-600 p-2 rounded-lg text-white">
            <CalendarDays size={24} />
          </div>
          <h1 className="text-xl font-bold tracking-tight">Atelier IT</h1>
        </div>

        <nav className="flex flex-col gap-2 flex-1">
          <SidebarItem to="/dashboard" icon={LayoutDashboard} label="Tableau de bord" />
          <SidebarItem to="/reservations" icon={CalendarDays} label="Réservations" />
          <SidebarItem to="/rooms" icon={DoorOpen} label="Salles" />
          <SidebarItem to="/equipment" icon={Monitor} label="Équipements" />
          <SidebarItem to="/reports" icon={BarChart3} label="Rapports" />
          <SidebarItem to="/history" icon={History} label="Historique" />
        </nav>

        <div className="border-t border-slate-200 pt-6 mt-auto">
          <div className="flex items-center gap-3 px-2 mb-6">
            <div className="bg-slate-100 p-2 rounded-full text-slate-600">
              <UserIcon size={20} />
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-semibold truncate">{user?.name}</span>
              <span className="text-xs text-slate-500 capitalize">{user?.role}</span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl transition-all font-medium"
          >
            <LogOut size={20} />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-10 px-8 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-800">Gestion des Réservations</h2>
          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
          </div>
        </header>

        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
