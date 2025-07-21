import React, { useState } from 'react';
import { EmailTemplate } from '../../types';
import { X, Send, Copy, Download, Edit } from 'lucide-react';

interface EmailTemplatePreviewProps {
  template: EmailTemplate;
  onClose: () => void;
}

export const EmailTemplatePreview: React.FC<EmailTemplatePreviewProps> = ({
  template,
  onClose
}) => {
  const [sampleData, setSampleData] = useState({
    lead_name: 'John Doe',
    lead_email: 'john.doe@example.com',
    lead_company: 'Example Corp',
    user_name: 'Alice Johnson',
    user_email: 'alice@company.com',
    company_name: 'CRM Pro',
    opportunity_name: 'Enterprise Deal',
    opportunity_value: '$125,000',
    customer_name: 'TechCorp Industries',
    current_date: new Date().toLocaleDateString(),
    meeting_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
    proposal_link: 'https://company.com/proposal/123'
  });

  const [showCustomData, setShowCustomData] = useState(false);

  const processTemplate = (text: string) => {
    let processed = text;
    Object.entries(sampleData).forEach(([key, value]) => {
      const variable = `{{${key}}}`;
      processed = processed.replace(new RegExp(variable.replace(/[{}]/g, '\\$&'), 'g'), value);
    });
    return processed;
  };

  const handleCopyToClipboard = () => {
    const emailContent = `Subject: ${processTemplate(template.subject)}\n\n${processTemplate(template.body)}`;
    navigator.clipboard.writeText(emailContent);
  };

  const handleSendTestEmail = () => {
    // In a real app, this would send a test email
    console.log('Sending test email...');
    alert('Test email sent! (This is a demo)');
  };

  const handleDownload = () => {
    const emailContent = `Subject: ${processTemplate(template.subject)}\n\n${processTemplate(template.body)}`;
    const blob = new Blob([emailContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${template.name.replace(/\s+/g, '_')}_preview.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Email Template Preview</h2>
            <p className="text-gray-600 text-sm mt-1">{template.name}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Actions */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowCustomData(!showCustomData)}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {showCustomData ? 'Hide' : 'Customize'} Sample Data
              </button>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleCopyToClipboard}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-1"
              >
                <Copy className="w-4 h-4" />
                <span>Copy</span>
              </button>
              <button
                onClick={handleDownload}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-1"
              >
                <Download className="w-4 h-4" />
                <span>Download</span>
              </button>
              <button
                onClick={handleSendTestEmail}
                className="px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-1"
              >
                <Send className="w-4 h-4" />
                <span>Send Test</span>
              </button>
            </div>
          </div>

          {/* Custom Sample Data */}
          {showCustomData && (
            <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-3">Customize Sample Data</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(sampleData).map(([key, value]) => (
                  <div key={key}>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </label>
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => setSampleData({ ...sampleData, [key]: e.target.value })}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Email Preview */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            {/* Email Header */}
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">Email Preview</div>
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <span>Type: {template.type}</span>
                  <span>Status: {template.isActive ? 'Active' : 'Inactive'}</span>
                </div>
              </div>
            </div>

            {/* Email Content */}
            <div className="bg-white">
              {/* Email Headers */}
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                <div className="space-y-2">
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-700 w-16">From:</span>
                    <span className="text-sm text-gray-900">{sampleData.user_name} &lt;{sampleData.user_email}&gt;</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-700 w-16">To:</span>
                    <span className="text-sm text-gray-900">{sampleData.lead_name} &lt;{sampleData.lead_email}&gt;</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-700 w-16">Subject:</span>
                    <span className="text-sm text-gray-900 font-medium">{processTemplate(template.subject)}</span>
                  </div>
                </div>
              </div>

              {/* Email Body */}
              <div className="px-6 py-6">
                <div 
                  className="prose prose-sm max-w-none text-gray-900"
                  style={{ 
                    whiteSpace: 'pre-wrap',
                    lineHeight: '1.6',
                    fontFamily: 'system-ui, -apple-system, sans-serif'
                  }}
                >
                  {processTemplate(template.body)}
                </div>
              </div>

              {/* Email Footer */}
              <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
                <div className="text-xs text-gray-500">
                  This is a preview of the "{template.name}" email template.
                </div>
              </div>
            </div>
          </div>

          {/* Template Info */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Template Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-blue-700 font-medium">Created:</span>
                <span className="text-blue-800 ml-2">{new Date(template.createdAt).toLocaleDateString()}</span>
              </div>
              <div>
                <span className="text-blue-700 font-medium">Type:</span>
                <span className="text-blue-800 ml-2 capitalize">{template.type.replace('-', ' ')}</span>
              </div>
              <div>
                <span className="text-blue-700 font-medium">Status:</span>
                <span className={`ml-2 ${template.isActive ? 'text-green-700' : 'text-gray-600'}`}>
                  {template.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};