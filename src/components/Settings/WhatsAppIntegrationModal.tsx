import React, { useState } from 'react';
import { MessageCircle, Save, X } from 'lucide-react';

interface WhatsAppIntegrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: { provider: string; accountSid: string; authToken: string; phoneNumber: string }) => void;
}

const WhatsAppIntegrationModal: React.FC<WhatsAppIntegrationModalProps> = ({ isOpen, onClose, onSave }) => {
  const [settings, setSettings] = useState({
    provider: 'twilio',
    accountSid: '',
    authToken: '',
    phoneNumber: '',
  });
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setSettings({ ...settings, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    onSave(settings);
    setIsSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <MessageCircle className="w-6 h-6 text-green-600" />
            <h2 className="text-xl font-semibold text-gray-900">Configure WhatsApp</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Provider</label>
            <select
              name="provider"
              value={settings.provider}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="twilio">Twilio</option>
              <option value="meta">Meta (Official API)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Account SID</label>
            <input
              type="text"
              name="accountSid"
              value={settings.accountSid}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Auth Token</label>
            <input
              type="password"
              name="authToken"
              value={settings.authToken}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">WhatsApp Phone Number</label>
            <input
              type="text"
              name="phoneNumber"
              value={settings.phoneNumber}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="+14155238886"
            />
          </div>
        </div>
        <div className="flex items-center justify-end p-6 border-t border-gray-200 space-x-3">
          <button onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2 disabled:opacity-50"
          >
            {isSaving ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{isSaving ? 'Saving...' : 'Save'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default WhatsAppIntegrationModal;
