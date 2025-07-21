import React, { useState } from 'react';
import { Zap, Mail, Calendar, MessageSquare, Database, Globe, Settings, Check, X } from 'lucide-react';
import WhatsAppIntegrationModal from './WhatsAppIntegrationModal';
import EmailIntegrationModal from './EmailIntegrationModal';

import { LucideProps } from 'lucide-react';

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<LucideProps>;
  connected: boolean;
  category: 'email' | 'calendar' | 'communication' | 'storage' | 'analytics';
}

export const IntegrationSettings: React.FC = () => {
  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: 'gmail',
      name: 'Gmail',
      description: 'Sync emails and contacts with Gmail',
      icon: Mail,
      connected: true,
      category: 'email'
    },
    {
      id: 'outlook',
      name: 'Microsoft Outlook',
      description: 'Connect with Outlook for email and calendar',
      icon: Mail,
      connected: false,
      category: 'email'
    },
    {
      id: 'google-calendar',
      name: 'Google Calendar',
      description: 'Sync meetings and events',
      icon: Calendar,
      connected: true,
      category: 'calendar'
    },
    {
      id: 'slack',
      name: 'Slack',
      description: 'Get notifications in Slack channels',
      icon: MessageSquare,
      connected: false,
      category: 'communication'
    },
    {
      id: 'zapier',
      name: 'Zapier',
      description: 'Connect with 3000+ apps via Zapier',
      icon: Zap,
      connected: false,
      category: 'analytics'
    },
    {
      id: 'google-drive',
      name: 'Google Drive',
      description: 'Store and share files in Google Drive',
      icon: Database,
      connected: true,
      category: 'storage'
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      description: 'Connect with WhatsApp for messaging',
      icon: MessageSquare,
      connected: false,
      category: 'communication'
    }
  ]);

  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [selectedEmailIntegration, setSelectedEmailIntegration] = useState<Integration | null>(null);

  const toggleIntegration = (id: string) => {
    const integration = integrations.find(i => i.id === id);
    if (!integration) return;

    if (integration.category === 'email') {
      setSelectedEmailIntegration(integration);
      setShowEmailModal(true);
    } else if (id === 'whatsapp') {
      setShowWhatsAppModal(true);
    } else {
      setIntegrations(integrations.map(i =>
        i.id === id
          ? { ...i, connected: !i.connected }
          : i
      ));
    }
  };

  const handleSaveWhatsAppSettings = (settings: { provider: string; accountSid: string; authToken: string; phoneNumber: string }) => {
    console.log('WhatsApp settings saved:', settings);
    localStorage.setItem('whatsappSettings', JSON.stringify(settings));
    setIntegrations(integrations.map(i =>
      i.id === 'whatsapp' ? { ...i, connected: true } : i
    ));
  };

  const handleSaveEmailSettings = (settings: { provider: string; apiKey: string; apiSecret: string; host: string; port: string; username: string; password: string }) => {
    console.log('Email settings saved:', settings);
    localStorage.setItem('emailSettings', JSON.stringify(settings));
    if (selectedEmailIntegration) {
      setIntegrations(integrations.map(i =>
        i.id === selectedEmailIntegration.id ? { ...i, connected: true } : i
      ));
    }
  };

  const categories = [
    { id: 'email', name: 'Email', icon: Mail },
    { id: 'calendar', name: 'Calendar', icon: Calendar },
    { id: 'communication', name: 'Communication', icon: MessageSquare },
    { id: 'storage', name: 'Storage', icon: Database },
    { id: 'analytics', name: 'Analytics', icon: Globe }
  ];

  const getIntegrationsByCategory = (category: string) => {
    return integrations.filter(integration => integration.category === category);
  };

  return (
    <div className="p-6">
      <WhatsAppIntegrationModal
        isOpen={showWhatsAppModal}
        onClose={() => setShowWhatsAppModal(false)}
        onSave={handleSaveWhatsAppSettings}
      />
      <EmailIntegrationModal
        isOpen={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        onSave={handleSaveEmailSettings}
      />
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Integrations</h2>
        <p className="text-gray-600 mt-1">Connect your CRM with external services and tools</p>
      </div>

      {/* Integration Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-600">Total Integrations</div>
          <div className="text-2xl font-bold text-gray-900">{integrations.length}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-600">Connected</div>
          <div className="text-2xl font-bold text-green-600">
            {integrations.filter(i => i.connected).length}
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-600">Available</div>
          <div className="text-2xl font-bold text-blue-600">
            {integrations.filter(i => !i.connected).length}
          </div>
        </div>
      </div>

      {/* Integrations by Category */}
      <div className="space-y-6">
        {categories.map((category) => {
          const categoryIntegrations = getIntegrationsByCategory(category.id);
          if (categoryIntegrations.length === 0) return null;

          const CategoryIcon = category.icon;
          
          return (
            <div key={category.id} className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center mb-4">
                <CategoryIcon className="w-5 h-5 text-gray-600 mr-2" />
                <h3 className="text-lg font-medium text-gray-900">{category.name}</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categoryIntegrations.map((integration) => {
                  const IntegrationIcon = integration.icon;
                  
                  return (
                    <div
                      key={integration.id}
                      className={`border rounded-lg p-4 transition-colors ${
                        integration.connected
                          ? 'border-green-200 bg-green-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 ${
                            integration.connected ? 'bg-green-100' : 'bg-gray-100'
                          }`}>
                            <IntegrationIcon className={`w-5 h-5 ${
                              integration.connected ? 'text-green-600' : 'text-gray-600'
                            }`} />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{integration.name}</h4>
                          </div>
                        </div>
                        
                        <div className="flex items-center">
                          {integration.connected ? (
                            <Check className="w-5 h-5 text-green-600" />
                          ) : (
                            <X className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-4">{integration.description}</p>
                      
                      <button
                        onClick={() => toggleIntegration(integration.id)}
                        className={`w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          integration.connected
                            ? 'bg-red-600 text-white hover:bg-red-700'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                      >
                        {integration.connected ? 'Disconnect' : 'Connect'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* API Settings */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mt-6">
        <div className="flex items-center mb-4">
          <Settings className="w-5 h-5 text-gray-600 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">API Settings</h3>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              API Key
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value="crm_sk_1234567890abcdef"
                readOnly
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
              />
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Regenerate
              </button>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Use this API key to connect external applications to your CRM
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Webhook URL
            </label>
            <input
              type="url"
              placeholder="https://your-app.com/webhook"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-sm text-gray-600 mt-1">
              Receive real-time notifications about CRM events
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};