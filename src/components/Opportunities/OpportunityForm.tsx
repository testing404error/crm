import React, { useState, useEffect } from 'react';
import { Opportunity, Assignee } from '../../types';
import { getAssignees } from '../../services/assigneeService';
import { X } from 'lucide-react';

interface OpportunityFormProps {
  opportunity?: Opportunity | null;
  onSubmit: (opportunityData: Partial<Opportunity>) => void;
  onCancel: () => void;
}

export const OpportunityForm: React.FC<OpportunityFormProps> = ({
  opportunity,
  onSubmit,
  onCancel
}) => {
  const [assignees, setAssignees] = useState<Assignee[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    value: 0,
    currency: 'USD',
    stage: 'prospecting' as Opportunity['stage'],
    probability: 25,
    expected_close_date: '',
    assigned_to: '',
    description: '',
    next_action: '',
    tags: [] as string[]
  });

  useEffect(() => {
    const fetchAssignees = async () => {
      try {
        const data = await getAssignees();
        setAssignees(data);
      } catch (error) {
        console.error('Failed to fetch assignees:', error);
      }
    };

    fetchAssignees();

    if (opportunity) {
      setFormData({
        name: opportunity.name,
        value: opportunity.value,
        currency: opportunity.currency,
        stage: opportunity.stage,
        probability: opportunity.probability,
        expected_close_date: opportunity.expected_close_date ? new Date(opportunity.expected_close_date).toISOString().split('T')[0] : '',
        assigned_to: opportunity.assigned_to,
        description: opportunity.description || '',
        next_action: opportunity.next_action || '',
        tags: opportunity.tags
      });
    } else {
      // Set default expected close date to 30 days from now
      const defaultDate = new Date();
      defaultDate.setDate(defaultDate.getDate() + 30);
      setFormData(prev => ({
        ...prev,
        expected_close_date: defaultDate.toISOString().split('T')[0]
      }));
    }
  }, [opportunity]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      expected_close_date: formData.expected_close_date ? new Date(formData.expected_close_date).toISOString() : new Date().toISOString()
    });
  };

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tags = e.target.value.split(',').map(tag => tag.trim()).filter(Boolean);
    setFormData({ ...formData, tags });
  };

  const stageOptions = [
    { value: 'prospecting', label: 'Prospecting', probability: 25 },
    { value: 'qualification', label: 'Qualification', probability: 40 },
    { value: 'proposal', label: 'Proposal', probability: 60 },
    { value: 'negotiation', label: 'Negotiation', probability: 75 },
    { value: 'closed-won', label: 'Closed Won', probability: 100 },
    { value: 'closed-lost', label: 'Closed Lost', probability: 0 },
  ];

  const handleStageChange = (stage: Opportunity['stage']) => {
    const stageOption = stageOptions.find(opt => opt.value === stage);
    setFormData({
      ...formData,
      stage,
      probability: stageOption?.probability || formData.probability
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {opportunity ? 'Edit Opportunity' : 'Create New Opportunity'}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Opportunity Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Value
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Currency
              </label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="CAD">CAD</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stage
              </label>
              <select
                value={formData.stage}
                onChange={(e) => handleStageChange(e.target.value as Opportunity['stage'])}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {stageOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Probability (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.probability}
                onChange={(e) => setFormData({ ...formData, probability: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expected Close Date
              </label>
              <input
                type="date"
                value={formData.expected_close_date}
                onChange={(e) => setFormData({ ...formData, expected_close_date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assigned To
              </label>
              <select
                value={formData.assigned_to}
                onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select assignee</option>
                {assignees?.map((assignee) => (
                  <option key={assignee.id} value={assignee.name}>
                    {assignee.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Next Action
            </label>
            <input
              type="text"
              value={formData.next_action}
              onChange={(e) => setFormData({ ...formData, next_action: e.target.value })}
              placeholder="e.g., Schedule demo, Send proposal, Follow up call"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              value={formData.tags.join(', ')}
              onChange={handleTagsChange}
              placeholder="e.g., enterprise, high-value, custom"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

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
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {opportunity ? 'Update Opportunity' : 'Create Opportunity'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
