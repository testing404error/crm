import React from 'react';
import { OpportunityCard } from './OpportunityCard';
import { Opportunity } from '../../types';

interface KanbanColumnProps {
  stage: { id: Opportunity['stage']; name: string; color: string };
  opportunities: Opportunity[];
  stageValue: number;
  onStageChange: (opportunityId: string, newStage: Opportunity['stage']) => void;
  onEditOpportunity: (opportunity: Opportunity) => void;
  onDeleteOpportunity: (opportunityId: string) => void;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
  stage,
  opportunities,
  stageValue,
  onStageChange,
  onEditOpportunity,
  onDeleteOpportunity
}) => {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const opportunityId = e.dataTransfer.getData('opportunityId');
    if (opportunityId) {
      onStageChange(opportunityId, stage.id);
    }
  };

  return (
    <div
      className={`rounded-lg border-2 border-dashed p-4 ${stage.color} min-h-[500px]`}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">{stage.name}</h3>
          <span className="text-sm text-gray-600">{opportunities.length}</span>
        </div>
        <div className="text-sm font-medium text-gray-700 mt-1">
          ${(stageValue / 1000).toFixed(0)}K
        </div>
      </div>

      <div className="space-y-3">
        {opportunities.map((opportunity) => (
          <OpportunityCard
            key={opportunity.id}
            opportunity={opportunity}
            onEdit={onEditOpportunity}
            onDelete={onDeleteOpportunity}
          />
        ))}
      </div>
    </div>
  );
};