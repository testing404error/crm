import React, { useState } from 'react';
import { Bell, Mail, MessageSquare, Calendar, DollarSign, Users, Save } from 'lucide-react';

interface NotificationSetting {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  email: boolean;
  push: boolean;
  sms: boolean;
}

export const NotificationSettings: React.FC = () => {
  const [settings, setSettings] = useState<NotificationSetting[]>([
    {
      id: 'new-leads',
      title: 'New Leads',
      description: 'Get notified when new leads are assigned to you',
      icon: Users,
      email: true,
      push: true,
      sms: false
    },
    {
      id: 'deal-updates',
      title: 'Deal Updates',
      description: 'Notifications about opportunity stage changes',
      icon: DollarSign,
      email: true,
      push: true,
      sms: true
    },
    {
      id: 'meetings',
      title: 'Meeting Reminders',
      description: 'Reminders for upcoming meetings and calls',
      icon: Calendar,
      email: true,
      push: true,
      sms: false
    },
    {
      id: 'messages',
      title: 'Team Messages',
      description: 'Messages from team members and collaborators',
      icon: MessageSquare,
      email: false,
      push: true,
      sms: false
    },
    {
      id: 'system',
      title: 'System Updates',
      description: 'Important system notifications and updates',
      icon: Bell,
      email: true,
      push: false,
      sms: false
    }
  ]);

  const updateSetting = (id: string, type: 'email' | 'push' | 'sms', value: boolean) => {
    setSettings(settings.map(setting => 
      setting.id === id ? { ...setting, [type]: value } : setting
    ));
  };

  const handleSave = () => {
    // Save settings logic here
    console.log('Saving notification settings:', settings);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Notification Settings</h2>
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Save className="w-4 h-4" />
          <span>Save Settings</span>
        </button>
      </div>

      <div className="space-y-6">
        {/* Notification Methods */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-lg font-medium text-blue-900 mb-2">Notification Methods</h3>
          <p className="text-blue-700 text-sm">
            Choose how you want to receive notifications for different types of events.
          </p>
        </div>

        {/* Settings Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Notification Type
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <Mail className="w-4 h-4 mx-auto" />
                  <div className="mt-1">Email</div>
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <Bell className="w-4 h-4 mx-auto" />
                  <div className="mt-1">Push</div>
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <MessageSquare className="w-4 h-4 mx-auto" />
                  <div className="mt-1">SMS</div>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {settings.map((setting) => {
                const Icon = setting.icon;
                return (
                  <tr key={setting.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                          <Icon className="w-5 h-5 text-gray-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{setting.title}</div>
                          <div className="text-sm text-gray-500">{setting.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <input
                        type="checkbox"
                        checked={setting.email}
                        onChange={(e) => updateSetting(setting.id, 'email', e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <input
                        type="checkbox"
                        checked={setting.push}
                        onChange={(e) => updateSetting(setting.id, 'push', e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <input
                        type="checkbox"
                        checked={setting.sms}
                        onChange={(e) => updateSetting(setting.id, 'sms', e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Quiet Hours */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Quiet Hours</h3>
          <p className="text-gray-600 mb-4">
            Set times when you don't want to receive non-urgent notifications.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Time
              </label>
              <input
                type="time"
                defaultValue="22:00"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Time
              </label>
              <input
                type="time"
                defaultValue="08:00"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="mt-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                defaultChecked
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-2"
              />
              <span className="text-sm text-gray-700">Apply to weekends</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};