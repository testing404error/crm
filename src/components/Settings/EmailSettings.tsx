import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { settingsService } from '../../services/settingsService';
import { Mail, Save, AlertTriangle } from 'lucide-react';

export const EmailSettings: React.FC = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState({
    provider: '',
    apiKey: '',
    apiSecret: '',
    domain: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const emailSettings = await settingsService.getEmailSettings(user.id);
        if (emailSettings) {
          setSettings(emailSettings);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      setLoading(true);
      await settingsService.saveEmailSettings(user.id, settings);
      setSuccess('Email settings saved successfully!');
      setError(null);
    } catch (err: any) {
      setError(err.message);
      setSuccess(null);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setSettings({
      ...settings,
      [e.target.name]: e.target.value,
    });
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center mb-6">
        <Mail className="w-6 h-6 mr-3 text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-900">Email Settings</h1>
      </div>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
          <div className="flex">
            <div className="py-1"><AlertTriangle className="h-6 w-6 text-red-500 mr-4" /></div>
            <div>
              <p className="font-bold">Error</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6" role="alert">
          <p>{success}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 border border-gray-200 rounded-lg shadow-sm">
        <div>
          <label htmlFor="provider" className="block text-sm font-medium text-gray-700">Email Provider</label>
          <select
            id="provider"
            name="provider"
            value={settings.provider}
            onChange={handleChange}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          >
            <option value="">Select a provider</option>
            <option value="resend">Resend</option>
            <option value="sendgrid">SendGrid</option>
            <option value="mailgun">Mailgun</option>
            <option value="smtp">SMTP</option>
          </select>
        </div>

        {settings.provider && (
          <>
            <div>
              <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700">API Key</label>
              <input
                type="password"
                id="apiKey"
                name="apiKey"
                value={settings.apiKey}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            {settings.provider !== 'resend' && (
              <>
                <div>
                  <label htmlFor="apiSecret" className="block text-sm font-medium text-gray-700">API Secret</label>
                  <input
                    type="password"
                    id="apiSecret"
                    name="apiSecret"
                    value={settings.apiSecret}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>

                {settings.provider === 'mailgun' && (
                  <div>
                    <label htmlFor="domain" className="block text-sm font-medium text-gray-700">Domain</label>
                    <input
                      type="text"
                      id="domain"
                      name="domain"
                      value={settings.domain}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                )}
              </>
            )}
          </>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <Save className="w-5 h-5 mr-2" />
            {loading ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
};
