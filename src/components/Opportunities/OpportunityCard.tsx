import React from 'react';
import { Opportunity } from '../../types';
import { Calendar, DollarSign, User, Edit, Trash2 } from 'lucide-react';

interface OpportunityCardProps {
  opportunity: Opportunity;
  onEdit: (opportunity: Opportunity) => void;
  onDelete: (opportunityId: string) => void;
}

export const OpportunityCard: React.FC<OpportunityCardProps> = ({
  opportunity,
  onEdit,
  onDelete
}) => {
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('opportunityId', opportunity.id);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const getProbabilityColor = (probability: number) => {
    if (probability >= 75) return 'text-green-600 bg-green-100';
    if (probability >= 50) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className="bg-white rounded-lg border border-gray-200 p-4 cursor-move hover:shadow-md transition-shadow"
    >
      <div className="mb-3">
        <h4 className="font-medium text-gray-900 text-sm leading-tight">
          {opportunity.name}
        </h4>
        {opportunity.description && (
          <p className="text-xs text-gray-600 mt-1 line-clamp-2">
            {opportunity.description}
          </p>
        )}
      </div>

      <div className="space-y-2 mb-3">
        <div className="flex items-center text-xs text-gray-600">
          <DollarSign className="w-3 h-3 mr-1" />
          ${opportunity.value.toLocaleString()}
        </div>
        
        <div className="flex items-center text-xs text-gray-600">
          <User className="w-3 h-3 mr-1" />
          {opportunity.assignedTo}
        </div>
        
        <div className="flex items-center text-xs text-gray-600">
          <Calendar className="w-3 h-3 mr-1" />
          {formatDate(opportunity.expectedCloseDate)}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getProbabilityColor(opportunity.probability)}`}>
          {opportunity.probability}%
        </span>
        
        <div className="flex items-center space-x-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(opportunity);
            }}
            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
          >
            <Edit className="w-3 h-3" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(opportunity.id);
            }}
            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {opportunity.tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {opportunity.tags.slice(0, 2).map((tag, index) => (
            <span
              key={index}
              className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full"
            >
              {tag}
            </span>
          ))}
          {opportunity.tags.length > 2 && (
            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
              +{opportunity.tags.length - 2}
            </span>
          )}
        </div>
      )}
    </div>
  );
};