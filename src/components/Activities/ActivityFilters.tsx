import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Activity } from '../../types';
import { Search } from 'lucide-react';

interface ActivityFiltersProps {
  filters: Partial<Activity>;
  onFiltersChange: (filters: Partial<Activity>) => void;
}

export const ActivityFilters: React.FC<ActivityFiltersProps> = ({ filters, onFiltersChange }) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (name: 'type' | 'status' | 'assignedTo' | 'relatedTo.type') => (value: string) => {
    const isAll = value === 'all';
    if (name === 'relatedTo.type') {
        const newRelatedTo = isAll ? undefined : { ...filters.relatedTo, type: value };
        onFiltersChange({ ...filters, relatedTo: newRelatedTo });
    } else {
        onFiltersChange({ ...filters, [name]: isAll ? undefined : value });
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-2 w-full">
      <div className="relative flex-grow">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
            name="title"
            placeholder="Search by title..."
            value={filters.title || ''}
            onChange={handleInputChange}
            className="pl-10"
        />
      </div>
      
      <Select value={filters.type || 'all'} onValueChange={handleSelectChange('type')}>
        <SelectTrigger className="w-full md:w-[150px]">
          <SelectValue placeholder="Filter by type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          <SelectItem value="task">Task</SelectItem>
          <SelectItem value="call">Call</SelectItem>
          <SelectItem value="email">Email</SelectItem>
          <SelectItem value="meeting">Meeting</SelectItem>
          <SelectItem value="note">Note</SelectItem>
        </SelectContent>
      </Select>

      <Select value={filters.status || 'all'} onValueChange={handleSelectChange('status')}>
        <SelectTrigger className="w-full md:w-[150px]">
          <SelectValue placeholder="Filter by status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="completed">Completed</SelectItem>
          <SelectItem value="overdue">Overdue</SelectItem>
        </SelectContent>
      </Select>

      {/* In a real app, these options would be dynamically populated */}
      <Select value={filters.assignedTo || 'all'} onValueChange={handleSelectChange('assignedTo')}>
        <SelectTrigger className="w-full md:w-[180px]">
          <SelectValue placeholder="Filter by assignee" />
        </SelectTrigger>
        <SelectContent>
            <SelectItem value="all">All Assignees</SelectItem>
            <SelectItem value="Alice Johnson">Alice Johnson</SelectItem>
            <SelectItem value="Bob Smith">Bob Smith</SelectItem>
            <SelectItem value="Carol Davis">Carol Davis</SelectItem>
            <SelectItem value="David Wilson">David Wilson</SelectItem>
        </SelectContent>
      </Select>

      <Select value={filters.relatedTo?.type || 'all'} onValueChange={handleSelectChange('relatedTo.type')}>
        <SelectTrigger className="w-full md:w-[180px]">
          <SelectValue placeholder="Filter by related type" />
        </SelectTrigger>
        <SelectContent>
            <SelectItem value="all">All Related Types</SelectItem>
            <SelectItem value="lead">Lead</SelectItem>
            <SelectItem value="opportunity">Opportunity</SelectItem>
            <SelectItem value="customer">Customer</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
