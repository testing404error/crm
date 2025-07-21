import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useSettings } from '../../contexts/SettingsContext';
import { 
  LayoutDashboard, 
  Users, 
  Target, 
  UserCheck, 
  Calendar, 
  BarChart3, 
  Settings,
  ChevronLeft,
  Building2,
  LogOut
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const menuItems = [
  { id: 'dashboard', path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'leads', path: '/leads', label: 'Leads', icon: Users },
  { id: 'opportunities', path: '/opportunities', label: 'Opportunities', icon: Target },
  { id: 'customers', path: '/customers', label: 'Customers', icon: UserCheck },
  { id: 'activities', path: '/activities', label: 'Activities', icon: Calendar },
  { id: 'reports', path: '/reports', label: 'Reports', icon: BarChart3 },
  { id: 'settings', path: '/settings', label: 'Settings', icon: Settings },
];

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
  const { user, logout } = useAuth();
  const { settings, isLoading } = useSettings();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className={`bg-white border-r border-gray-200 transition-all duration-300 ${
      isOpen ? 'w-64' : 'w-16'
    } flex flex-col h-full`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div className={`flex items-center space-x-3 ${isOpen ? 'opacity-100' : 'opacity-0'} transition-opacity duration-200`}>
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl text-gray-900">
            {isLoading ? '...' : settings.companyName}
          </span>
        </div>
        <button
          onClick={onToggle}
          className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ChevronLeft className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
            isOpen ? 'rotate-0' : 'rotate-180'
          }`} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <li key={item.id}>
                <Link
                  to={item.path}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                  title={!isOpen ? item.label : undefined}
                >
                  <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
                  <span className={`font-medium ${isOpen ? 'opacity-100' : 'opacity-0'} transition-opacity duration-200`}>
                    {item.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3">
          {/* <img
            src={user?.avatar || 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=40&h=40&fit=crop'}
            alt="User"
            className="w-8 h-8 rounded-full flex-shrink-0"
          /> */}
          <div className={`${isOpen ? 'opacity-100' : 'opacity-0'} transition-opacity duration-200 flex-1 min-w-0`}>
            <p className="font-medium text-sm text-gray-900 truncate">{user?.name}</p>
            <p className="text-xs text-gray-500 truncate">{user?.role} • {user?.team}</p>
          </div>
          {isOpen && (
            <button
              onClick={handleLogout}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};