import React, { useState } from 'react';
import { ProfileSettings } from './ProfileSettings';
import { UserManagement } from './UserManagement';
import { SystemSettings } from './SystemSettings';
import { NotificationSettings } from './NotificationSettings';
import { SecuritySettings } from './SecuritySettings';
import { IntegrationSettings } from './IntegrationSettings';
import { EmailSettings } from './EmailSettings';
import { EmailTemplateSettings } from './EmailTemplateSettings';
import { AssigneeSettings } from './AssigneeSettings';
import { useAuth } from '../../contexts/AuthContext';
import { 
  User, 
  Users, 
  Settings as SettingsIcon, 
  Bell, 
  Shield, 
  Zap,
  Database,
  Mail,
  UserCheck
} from 'lucide-react';

const settingsTabs = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'users', label: 'User Management', icon: Users, adminOnly: true },
  { id: 'assignees', label: 'Assignees', icon: UserCheck, adminOnly: true },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'integrations', label: 'Integrations', icon: Zap },
  { id: 'email-settings', label: 'Email Settings', icon: Mail },
  { id: 'email-templates', label: 'Email Templates', icon: Mail },
  { id: 'system', label: 'System', icon: SettingsIcon, adminOnly: true },
  { id: 'data', label: 'Data Management', icon: Database, adminOnly: true }
];

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');

  const filteredTabs = settingsTabs.filter(tab => 
    !tab.adminOnly || user?.role === 'admin' || user?.role === 'manager'
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileSettings />;
      case 'users':
        return <UserManagement />;
      case 'notifications':
        return <NotificationSettings />;
      case 'security':
        return <SecuritySettings />;
      case 'integrations':
        return <IntegrationSettings />;
      case 'email-settings':
        return <EmailSettings />;
      case 'email-templates':
        return <EmailTemplateSettings />;
      case 'assignees':
        return <AssigneeSettings />;
      case 'system':
        return <SystemSettings />;
      case 'data':
        return <div className="p-6"><h3 className="text-lg font-medium">Data Management coming soon...</h3></div>;
      default:
        return <ProfileSettings />;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-2">Manage your account and system preferences</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="flex">
          {/* Sidebar */}
          <div className="w-64 bg-gray-50 border-r border-gray-200">
            <nav className="p-4 space-y-1">
              {filteredTabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
};