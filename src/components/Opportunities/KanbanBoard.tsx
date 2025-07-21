import React from 'react';
import { KanbanColumn } from './KanbanColumn';
import { Opportunity } from '../../types';

interface KanbanBoardProps {
  opportunities: Opportunity[];
  onStageChange: (opportunityId: string, newStage: Opportunity['stage']) => void;
  onEditOpportunity: (opportunity: Opportunity) => void;
  onDeleteOpportunity: (opportunityId: string) => void;
}

const stages: { id: Opportunity['stage']; name: string; color: string }[] = [
  { id: 'prospecting', name: 'Prospecting', color: 'bg-blue-100 border-blue-200' },
  { id: 'qualification', name: 'Qualification', color: 'bg-yellow-100 border-yellow-200' },
  { id: 'proposal', name: 'Proposal', color: 'bg-purple-100 border-purple-200' },
  { id: 'negotiation', name: 'Negotiation', color: 'bg-orange-100 border-orange-200' },
  { id: 'closed-won', name: 'Closed Won', color: 'bg-green-100 border-green-200' },
  { id: 'closed-lost', name: 'Closed Lost', color: 'bg-red-100 border-red-200' },
];

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  opportunities,
  onStageChange,
  onEditOpportunity,
  onDeleteOpportunity
}) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="grid grid-cols-1 lg:grid-cols-6 gap-4 min-h-[600px]">
        {stages.map((stage) => {
          const stageOpportunities = opportunities.filter(opp => opp.stage === stage.id);
          const stageValue = stageOpportunities.reduce((sum, opp) => sum + opp.value, 0);
          
          return (
            <KanbanColumn
              key={stage.id}
              stage={stage}
              opportunities={stageOpportunities}
              stageValue={stageValue}
              onStageChange={onStageChange}
              onEditOpportunity={onEditOpportunity}
              onDeleteOpportunity={onDeleteOpportunity}
            />
          );
        })}
      </div>
    </div>
  );
};