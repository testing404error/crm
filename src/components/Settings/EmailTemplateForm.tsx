import React, { useState, useEffect } from 'react';
import { EmailTemplate } from '../../types';
import { X, Save, Eye, Code, Type, Mail, Tag, Info } from 'lucide-react';

interface EmailTemplateFormProps {
  template?: EmailTemplate | null;
  onSubmit: (templateData: Partial<EmailTemplate>) => void;
  onCancel: () => void;
}

export const EmailTemplateForm: React.FC<EmailTemplateFormProps> = ({
  template,
  onSubmit,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    body: '',
    type: 'follow-up' as EmailTemplate['type'],
    isActive: true
  });
  const [activeTab, setActiveTab] = useState<'compose' | 'preview'>('compose');
  const [showVariables, setShowVariables] = useState(false);

  const availableVariables = [
    { key: '{{lead_name}}', description: 'Lead\'s full name' },
    { key: '{{lead_email}}', description: 'Lead\'s email address' },
    { key: '{{lead_company}}', description: 'Lead\'s company name' },
    { key: '{{user_name}}', description: 'Your name' },
    { key: '{{user_email}}', description: 'Your email address' },
    { key: '{{company_name}}', description: 'Your company name' },
    { key: '{{opportunity_name}}', description: 'Opportunity name' },
    { key: '{{opportunity_value}}', description: 'Opportunity value' },
    { key: '{{customer_name}}', description: 'Customer name' },
    { key: '{{current_date}}', description: 'Current date' },
    { key: '{{meeting_date}}', description: 'Meeting date' },
    { key: '{{proposal_link}}', description: 'Link to proposal' }
  ];

  useEffect(() => {
    if (template) {
      setFormData({
        name: template.name,
        subject: template.subject,
        body: template.body,
        type: template.type,
        isActive: template.isActive
      });
    }
  }, [template]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const insertVariable = (variable: string) => {
    const textarea = document.getElementById('email-body') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = formData.body;
      const before = text.substring(0, start);
      const after = text.substring(end, text.length);
      const newText = before + variable + after;
      
      setFormData({ ...formData, body: newText });
      
      // Set cursor position after the inserted variable
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + variable.length, start + variable.length);
      }, 0);
    }
  };

  const renderPreview = () => {
    // Replace variables with sample data for preview
    const sampleData = {
      '{{lead_name}}': 'John Doe',
      '{{lead_email}}': 'john.doe@example.com',
      '{{lead_company}}': 'Example Corp',
      '{{user_name}}': 'Alice Johnson',
      '{{user_email}}': 'alice@company.com',
      '{{company_name}}': 'CRM Pro',
      '{{opportunity_name}}': 'Enterprise Deal',
      '{{opportunity_value}}': '$125,000',
      '{{customer_name}}': 'TechCorp Industries',
      '{{current_date}}': new Date().toLocaleDateString(),
      '{{meeting_date}}': new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      '{{proposal_link}}': 'https://company.com/proposal/123'
    };

    let previewSubject = formData.subject;
    let previewBody = formData.body;

    Object.entries(sampleData).forEach(([variable, value]) => {
      previewSubject = previewSubject.replace(new RegExp(variable.replace(/[{}]/g, '\\$&'), 'g'), value);
      previewBody = previewBody.replace(new RegExp(variable.replace(/[{}]/g, '\\$&'), 'g'), value);
    });

    return (
      <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="border-b border-gray-200 pb-3 mb-4">
            <div className="text-sm text-gray-600 mb-1">Subject:</div>
            <div className="font-medium text-gray-900">{previewSubject}</div>
          </div>
          <div className="whitespace-pre-wrap text-gray-900" style={{ lineHeight: '1.6' }}>
            {previewBody}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {template ? 'Edit Email Template' : 'Create New Email Template'}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Type className="w-4 h-4 inline mr-1" />
                Template Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Welcome New Lead"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Tag className="w-4 h-4 inline mr-1" />
                Template Type *
              </label>
              <select
                required
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as EmailTemplate['type'] })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="welcome">Welcome</option>
                <option value="follow-up">Follow-up</option>
                <option value="lead-followup">Lead Follow-up</option>
                <option value="opportunity-proposal">Opportunity Proposal</option>
              </select>
            </div>
          </div>

          {/* Subject Line */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Mail className="w-4 h-4 inline mr-1" />
              Subject Line *
            </label>
            <input
              type="text"
              required
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              placeholder="e.g., Welcome to {{company_name}} - Let's Get Started!"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Email Body */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Email Body *
              </label>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setShowVariables(!showVariables)}
                  className="text-sm text-blue-600 hover:text-blue-700 flex items-center space-x-1"
                >
                  <Code className="w-4 h-4" />
                  <span>Variables</span>
                </button>
                <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setActiveTab('compose')}
                    className={`px-3 py-1 text-sm ${
                      activeTab === 'compose'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Compose
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('preview')}
                    className={`px-3 py-1 text-sm ${
                      activeTab === 'preview'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Eye className="w-4 h-4 inline mr-1" />
                    Preview
                  </button>
                </div>
              </div>
            </div>

            {activeTab === 'compose' ? (
              <textarea
                id="email-body"
                required
                value={formData.body}
                onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                rows={12}
                placeholder="Hi {{lead_name}},&#10;&#10;Thank you for your interest in our solutions...&#10;&#10;Best regards,&#10;{{user_name}}"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
              />
            ) : (
              renderPreview()
            )}
          </div>

          {/* Variables Panel */}
          {showVariables && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center mb-3">
                <Info className="w-4 h-4 text-blue-600 mr-2" />
                <h4 className="font-medium text-blue-900">Available Variables</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {availableVariables.map((variable) => (
                  <button
                    key={variable.key}
                    type="button"
                    onClick={() => insertVariable(variable.key)}
                    className="text-left p-2 bg-white border border-blue-200 rounded hover:bg-blue-50 transition-colors"
                  >
                    <div className="font-mono text-sm text-blue-700">{variable.key}</div>
                    <div className="text-xs text-blue-600">{variable.description}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Status */}
          <div className="mb-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-2"
              />
              <span className="text-sm font-medium text-gray-700">
                Active (template can be used for automated emails)
              </span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>{template ? 'Update Template' : 'Create Template'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};