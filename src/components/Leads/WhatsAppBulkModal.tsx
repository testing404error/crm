import React, { useState } from 'react';
import { Lead } from '../../types';
import { X, MessageCircle, Send, Users, FileText, Eye, EyeOff } from 'lucide-react';

interface WhatsAppBulkModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedLeads: Lead[];
  onSend: (message: string, leads: Lead[]) => void;
}

export const WhatsAppBulkModal: React.FC<WhatsAppBulkModalProps> = ({
  isOpen,
  onClose,
  selectedLeads,
  onSend
}) => {
  const [message, setMessage] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [isSending, setIsSending] = useState(false);

  if (!isOpen) return null;

  const handleSend = async () => {
    if (!message.trim() || selectedLeads.length === 0) return;
    
    setIsSending(true);
    
    // Simulate sending delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    onSend(message, selectedLeads);
    setIsSending(false);
    setMessage('');
    onClose();
  };

  const messageTemplates = [
    {
      name: 'Introduction',
      content: 'Hi {{name}}, I hope this message finds you well. I wanted to reach out regarding your interest in our solutions at {{company}}. Would you be available for a brief call this week to discuss how we can help your business grow?'
    },
    {
      name: 'Follow-up',
      content: 'Hello {{name}}, following up on our previous conversation about {{company}}\'s needs. I have some exciting updates that I think would be perfect for your business. When would be a good time to connect?'
    },
    {
      name: 'Special Offer',
      content: 'Hi {{name}}, we have a special offer running this month that could save {{company}} up to 30% on our premium solutions. I\'d love to share the details with you. Are you available for a quick 15-minute call?'
    }
  ];

  const processMessage = (template: string, lead: Lead) => {
    return template
      .replace(/{{name}}/g, lead.name)
      .replace(/{{company}}/g, lead.company || 'your company');
  };

  const leadsWithPhone = selectedLeads.filter(lead => lead.phone);
  const leadsWithoutPhone = selectedLeads.filter(lead => !lead.phone);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <MessageCircle className="w-6 h-6 text-green-600" />
            <h2 className="text-xl font-semibold text-gray-900">Send Bulk WhatsApp Messages</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Recipients Summary */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-medium text-gray-900">Recipients</h3>
              <div className="flex items-center space-x-4 text-sm">
                <span className="text-green-600 font-medium">
                  <Users className="w-4 h-4 inline mr-1" />
                  {leadsWithPhone.length} with phone
                </span>
                {leadsWithoutPhone.length > 0 && (
                  <span className="text-orange-600 font-medium">
                    {leadsWithoutPhone.length} without phone
                  </span>
                )}
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 max-h-32 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {leadsWithPhone.map((lead) => (
                  <div key={lead.id} className="flex items-center space-x-2 text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="font-medium">{lead.name}</span>
                    <span className="text-gray-500">({lead.phone})</span>
                  </div>
                ))}
                {leadsWithoutPhone.map((lead) => (
                  <div key={lead.id} className="flex items-center space-x-2 text-sm text-orange-600">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span className="font-medium">{lead.name}</span>
                    <span className="text-gray-500">(No phone)</span>
                  </div>
                ))}
              </div>
            </div>

            {leadsWithoutPhone.length > 0 && (
              <div className="mt-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <p className="text-orange-800 text-sm">
                  <strong>Note:</strong> {leadsWithoutPhone.length} lead(s) will be skipped as they don't have phone numbers.
                </p>
              </div>
            )}
          </div>

          {/* Message Templates */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Quick Templates</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {messageTemplates.map((template, index) => (
                <button
                  key={index}
                  onClick={() => setMessage(template.content)}
                  className="p-3 text-left border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                >
                  <div className="font-medium text-gray-900 mb-1">{template.name}</div>
                  <div className="text-sm text-gray-600 line-clamp-2">
                    {template.content.substring(0, 80)}...
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Message Composer */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-medium text-gray-900">Message</h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700"
                >
                  {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  <span>{showPreview ? 'Hide' : 'Show'} Preview</span>
                </button>
              </div>
            </div>
            
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
              placeholder="Type your message here... Use {{name}} for lead name and {{company}} for company name."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            
            <div className="mt-2 flex items-center justify-between text-sm text-gray-600">
              <div>
                Available variables: <code className="bg-gray-100 px-1 rounded">{{name}}</code>, <code className="bg-gray-100 px-1 rounded">{{company}}</code>
              </div>
              <div>{message.length} characters</div>
            </div>
          </div>

          {/* Message Preview */}
          {showPreview && message && leadsWithPhone.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Preview</h3>
              <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
                <div className="space-y-4">
                  {leadsWithPhone.slice(0, 3).map((lead) => (
                    <div key={lead.id} className="bg-white rounded-lg p-3 border border-gray-200">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <MessageCircle className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{lead.name}</div>
                          <div className="text-sm text-gray-500">{lead.phone}</div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-700 whitespace-pre-wrap">
                        {processMessage(message, lead)}
                      </div>
                    </div>
                  ))}
                  {leadsWithPhone.length > 3 && (
                    <div className="text-center text-sm text-gray-500">
                      ... and {leadsWithPhone.length - 3} more recipients
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              Ready to send to {leadsWithPhone.length} recipient(s)
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSend}
                disabled={!message.trim() || leadsWithPhone.length === 0 || isSending}
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
                    <span>Send Messages</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};