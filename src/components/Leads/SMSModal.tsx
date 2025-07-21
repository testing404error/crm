import React, { useState } from 'react';
import { Lead, Customer } from '../../types';
import { X, MessageSquare, Send, Smartphone } from 'lucide-react';

type Contact = Lead | Customer;

interface SMSModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Contact;
  onSend: (smsData: SMSData) => void;
}

interface SMSData {
  to: string;
  message: string;
}

export const SMSModal: React.FC<SMSModalProps> = ({
  isOpen,
  onClose,
  lead: contact,
  onSend
}) => {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  if (!isOpen) return null;

  const smsTemplates = [
    {
      name: 'Introduction',
      content: 'Hi {{name}}, this is {{user}} from CRM Pro. I wanted to reach out about your interest in our solutions. Would you be available for a quick call this week?'
    },
    {
      name: 'Follow-up',
      content: 'Hi {{name}}, following up on our conversation. I have some updates that might interest {{company}}. When would be a good time to connect?'
    },
    {
      name: 'Meeting Reminder',
      content: 'Hi {{name}}, just a friendly reminder about our meeting scheduled for tomorrow. Looking forward to speaking with you!'
    },
    {
      name: 'Thank You',
      content: 'Hi {{name}}, thank you for taking the time to speak with me today. I\'ll send over the information we discussed via email shortly.'
    }
  ];

  const processTemplate = (template: string) => {
    return template
      .replace(/{{name}}/g, contact.name)
      .replace(/{{user}}/g, 'Alice Johnson');
  };

  const handleTemplateSelect = (template: typeof smsTemplates[0]) => {
    setMessage(processTemplate(template.content));
  };

  const getWhatsAppSettings = () => {
    const settings = localStorage.getItem('whatsappSettings');
    return settings ? JSON.parse(settings) : null;
  };

  const handleSend = async () => {
    if (!message.trim() || !contact.phone) return;

    const whatsappSettings = getWhatsAppSettings();
    if (!whatsappSettings) {
      alert('WhatsApp settings are not configured. Please configure them in the settings page.');
      return;
    }

    console.log('Sending SMS with the following settings:', whatsappSettings);
    
    setIsSending(true);
    
    // Simulate sending delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    onSend({
      to: contact.phone,
      message: message.trim()
    });
    
    setIsSending(false);
    setMessage('');
    onClose();
  };

  const maxLength = 160;
  const remainingChars = maxLength - message.length;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <MessageSquare className="w-6 h-6 text-green-600" />
            <h2 className="text-xl font-semibold text-gray-900">Send SMS</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Recipient Info */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="font-medium text-gray-900">{contact.name}</div>
                <div className="text-sm text-gray-600">{contact.phone || 'No phone number'}</div>
                {contact.company && (
                  <div className="text-sm text-gray-500">{contact.company}</div>
                )}
              </div>
            </div>
          </div>

          {!contact.phone && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm">
                <strong>Warning:</strong> This contact doesn't have a phone number. Please add one before sending SMS.
              </p>
            </div>
          )}

          {/* SMS Templates */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Quick Templates</h3>
            <div className="grid grid-cols-2 gap-2">
              {smsTemplates.map((template, index) => (
                <button
                  key={index}
                  onClick={() => handleTemplateSelect(template)}
                  className="p-2 text-left border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                >
                  <div className="text-sm font-medium text-gray-900">{template.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Message Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              maxLength={maxLength}
              placeholder="Type your SMS message here..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
            <div className="flex items-center justify-between mt-2 text-sm">
              <div className="text-gray-600">
                Available variables: <code className="bg-gray-100 px-1 rounded">name</code>
              </div>
              <div className={`${remainingChars < 0 ? 'text-red-600' : remainingChars < 20 ? 'text-orange-600' : 'text-gray-600'}`}>
                {remainingChars} chars left
              </div>
            </div>
          </div>

          {/* Message Preview */}
          {message && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Preview</h3>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="bg-blue-600 text-white rounded-lg p-3 max-w-xs ml-auto">
                  <div className="text-sm whitespace-pre-wrap">{message}</div>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSend}
              disabled={!message.trim() || !contact.phone || remainingChars < 0 || isSending}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Send SMS</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};