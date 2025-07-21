import React from 'react';
import { Search, Filter } from 'lucide-react';

interface LeadFiltersProps {
  filters: {
    status: string;
    source: string;
    assignedTo: string;
    score: string;
    search: string;
  };
  onFiltersChange: (filters: any) => void;
}

export const LeadFilters: React.FC<LeadFiltersProps> = ({ filters, onFiltersChange }) => {
  const updateFilter = (key: string, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center space-x-4 mb-4">
        <Filter className="w-5 h-5 text-gray-500" />
        <span className="font-medium text-gray-900">Filters</span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search leads..."
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <select
            value={filters.status}
            onChange={(e) => updateFilter('status', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Statuses</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="qualified">Qualified</option>
            <option value="converted">Converted</option>
          </select>
        </div>

        <div>
          <select
            value={filters.source}
            onChange={(e) => updateFilter('source', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Sources</option>
            <option value="website">Website</option>
            <option value="email">Email</option>
            <option value="social">Social Media</option>
            <option value="referral">Referral</option>
            <option value="manual">Manual</option>
          </select>
        </div>

        <div>
          <select
            value={filters.assignedTo}
            onChange={(e) => updateFilter('assignedTo', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Assignees</option>
            <option value="Alice Johnson">Alice Johnson</option>
            <option value="Bob Smith">Bob Smith</option>
            <option value="Carol Davis">Carol Davis</option>
            <option value="David Wilson">David Wilson</option>
          </select>
        </div>

        <div>
          <select
            value={filters.score}
            onChange={(e) => updateFilter('score', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Scores</option>
            <option value="high">High (80-100)</option>
            <option value="medium">Medium (60-79)</option>
            <option value="low">Low (0-59)</option>
          </select>
        </div>
      </div>
    </div>
  );
};