import React, { useState } from 'react';
import { EmailTemplateList } from './EmailTemplateList';
import { EmailTemplateForm } from './EmailTemplateForm';
import { EmailTemplatePreview } from './EmailTemplatePreview';
import { EmailTemplate } from '../../types';
import { mockEmailTemplates } from '../../data/mockData';
import { Plus, Mail, Search, Filter, Download, Upload } from 'lucide-react';

export const EmailTemplateSettings: React.FC = () => {
  const [templates, setTemplates] = useState<EmailTemplate[]>(mockEmailTemplates);
  const [showForm, setShowForm] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const handleCreateTemplate = (templateData: Partial<EmailTemplate>) => {
    const newTemplate: EmailTemplate = {
      id: Date.now().toString(),
      name: templateData.name || '',
      subject: templateData.subject || '',
      body: templateData.body || '',
      type: templateData.type || 'follow-up',
      isActive: templateData.isActive ?? true,
      createdAt: new Date()
    };
    setTemplates([newTemplate, ...templates]);
    setShowForm(false);
  };

  const handleUpdateTemplate = (templateData: Partial<EmailTemplate>) => {
    if (selectedTemplate) {
      setTemplates(templates.map(template => 
        template.id === selectedTemplate.id 
          ? { ...template, ...templateData }
          : template
      ));
      setSelectedTemplate(null);
      setShowForm(false);
    }
  };

  const handleDeleteTemplate = (templateId: string) => {
    setTemplates(templates.filter(template => template.id !== templateId));
  };

  const handleToggleStatus = (templateId: string) => {
    setTemplates(templates.map(template => 
      template.id === templateId 
        ? { ...template, isActive: !template.isActive }
        : template
    ));
  };

  const handleDuplicateTemplate = (template: EmailTemplate) => {
    const duplicatedTemplate: EmailTemplate = {
      ...template,
      id: Date.now().toString(),
      name: `${template.name} (Copy)`,
      createdAt: new Date()
    };
    setTemplates([duplicatedTemplate, ...templates]);
  };

  const handlePreview = (template: EmailTemplate) => {
    setPreviewTemplate(template);
    setShowPreview(true);
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = !searchTerm || 
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.body.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = !typeFilter || template.type === typeFilter;
    const matchesStatus = !statusFilter || 
      (statusFilter === 'active' && template.isActive) ||
      (statusFilter === 'inactive' && !template.isActive);

    return matchesSearch && matchesType && matchesStatus;
  });

  const templateStats = {
    total: templates.length,
    active: templates.filter(t => t.isActive).length,
    inactive: templates.filter(t => !t.isActive).length,
    byType: {
      welcome: templates.filter(t => t.type === 'welcome').length,
      'follow-up': templates.filter(t => t.type === 'follow-up').length,
      'lead-followup': templates.filter(t => t.type === 'lead-followup').length,
      'opportunity-proposal': templates.filter(t => t.type === 'opportunity-proposal').length
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Email Templates</h2>
          <p className="text-gray-600 mt-1">Create and manage email templates for automated communications</p>
        </div>
        <button
          onClick={() => {
            setSelectedTemplate(null);
            setShowForm(true);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>New Template</span>
        </button>
      </div>

      {/* Template Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <Mail className="w-8 h-8 text-blue-600 mr-3" />
            <div>
              <div className="text-sm text-gray-600">Total Templates</div>
              <div className="text-2xl font-bold text-gray-900">{templateStats.total}</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
              <Mail className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="text-sm text-gray-600">Active</div>
              <div className="text-2xl font-bold text-green-600">{templateStats.active}</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
              <Mail className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <div className="text-sm text-gray-600">Inactive</div>
              <div className="text-2xl font-bold text-gray-600">{templateStats.inactive}</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
              <Mail className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <div className="text-sm text-gray-600">Most Used</div>
              <div className="text-sm font-bold text-purple-600">Follow-up</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="flex items-center space-x-4 mb-4">
          <Filter className="w-5 h-5 text-gray-500" />
          <span className="font-medium text-gray-900">Filters</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Types</option>
            <option value="welcome">Welcome</option>
            <option value="follow-up">Follow-up</option>
            <option value="lead-followup">Lead Follow-up</option>
            <option value="opportunity-proposal">Opportunity Proposal</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <div className="flex space-x-2">
            <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-1">
              <Upload className="w-4 h-4" />
              <span>Import</span>
            </button>
            <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-1">
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Templates List */}
      <EmailTemplateList
        templates={filteredTemplates}
        onEdit={(template) => {
          setSelectedTemplate(template);
          setShowForm(true);
        }}
        onDelete={handleDeleteTemplate}
        onToggleStatus={handleToggleStatus}
        onDuplicate={handleDuplicateTemplate}
        onPreview={handlePreview}
      />

      {/* Template Form Modal */}
      {showForm && (
        <EmailTemplateForm
          template={selectedTemplate}
          onSubmit={selectedTemplate ? handleUpdateTemplate : handleCreateTemplate}
          onCancel={() => {
            setShowForm(false);
            setSelectedTemplate(null);
          }}
        />
      )}

      {/* Preview Modal */}
      {showPreview && previewTemplate && (
        <EmailTemplatePreview
          template={previewTemplate}
          onClose={() => {
            setShowPreview(false);
            setPreviewTemplate(null);
          }}
        />
      )}
    </div>
  );
};