import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { opportunityService, OpportunityFilters } from '../../services/opportunityService';
import { KanbanBoard } from './KanbanBoard';
import { OpportunityForm } from './OpportunityForm';
import { ImportModal } from '../Common/ImportModal';
import { ExportModal } from '../Common/ExportModal';
import { AdvancedFilters } from '../Common/AdvancedFilters';
import { Opportunity } from '../../types';
import { Plus, Filter, BarChart3, Upload, Download, CalendarClock, DollarSign, User, Briefcase, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { ScheduledFollowUpsView } from '../Leads/ScheduledFollowUpsView'; // Reusing the component

const opportunityFilterConfigs = [
  { key: 'name', label: 'Search by Name', type: 'text' as const, placeholder: 'Search opportunities...' },
  { key: 'stage', label: 'Stage', type: 'select' as const, options: [
    { value: 'prospecting', label: 'Prospecting' },
    { value: 'qualification', label: 'Qualification' },
    { value: 'proposal', label: 'Proposal' },
    { value: 'negotiation', label: 'Negotiation' },
    { value: 'closed-won', label: 'Closed Won' },
    { value: 'closed-lost', label: 'Closed Lost' }
  ]},
  { key: 'assigned_to', label: 'Assigned To', type: 'select' as const,
    options: [
      { value: 'user_id_1', label: 'Alice Johnson' },
      { value: 'user_id_2', label: 'Bob Smith' },
    ]
  },
  { key: 'min_value', label: 'Min Value', type: 'number' as const, placeholder: '0' },
  { key: 'max_value', label: 'Max Value', type: 'number' as const, placeholder: '1000000' },
  { key: 'probability_min', label: 'Min Probability (%)', type: 'number' as const, placeholder: '0' },
  { key: 'probability_max', label: 'Max Probability (%)', type: 'number' as const, placeholder: '100' },
  { key: 'expected_close_date_after', label: 'Expected Close After', type: 'date' as const },
  { key: 'expected_close_date_before', label: 'Expected Close Before', type: 'date' as const },
  { key: 'tags', label: 'Tags', type: 'multiselect' as const,
    options: [
      { value: 'enterprise', label: 'Enterprise' },
      { value: 'high-value', label: 'High Value' },
    ]
  }
];

const sampleOpportunityData = {
  name: 'New Q1 Deal',
  value: '75000',
  currency: 'USD',
  stage: 'qualification',
  probability: '25',
  expected_close_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  assigned_to: 'user_id_1',
  description: 'Promising new deal for Q1.',
  tags: 'high-value,strategic'
};

export const OpportunitiesPage: React.FC = () => {
  const { user } = useAuth();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [opportunityToEdit, setOpportunityToEdit] = useState<Opportunity | null>(null);
  const [detailedOpportunity, setDetailedOpportunity] = useState<Opportunity | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [filters, setFilters] = useState<OpportunityFilters>({ name: '', stage: '', assigned_to: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalOpportunities, setTotalOpportunities] = useState(0);
  const kanbanLimit = 100;
  const [sortBy, setSortBy] = useState('created_at');
  const [sortAsc, setSortAsc] = useState(false);
  const [view, setView] = useState<'kanban' | 'scheduled'>('kanban');

  const fetchData = useCallback(async () => {
    if (!user) {
      setError('You must be logged in to view opportunities.');
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const currentFilters: OpportunityFilters = { ...filters };
      if (filters.min_value && typeof filters.min_value === 'string') currentFilters.min_value = parseFloat(filters.min_value);
      if (filters.max_value && typeof filters.max_value === 'string') currentFilters.max_value = parseFloat(filters.max_value);

      const { data, total } = await opportunityService.getOpportunities(user.id, currentPage, kanbanLimit, currentFilters, sortBy, sortAsc);
      setOpportunities(data);
      setTotalOpportunities(total);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user, currentPage, filters, sortBy, sortAsc, kanbanLimit]);

  useEffect(() => {
    if (view === 'kanban') {
      fetchData();
    }
  }, [view, fetchData]);

  useEffect(() => {
    if (!user) return;
    const subscription = opportunityService.subscribeToOpportunities(user.id, (payload) => {
      console.log('Opportunity subscription payload:', payload);
      fetchData(); // Refetch on any change for simplicity
    });
    return () => {
      subscription.unsubscribe();
    };
  }, [user, fetchData]);

  const handleCreateOpportunity = async (opportunityData: Partial<Opportunity>) => {
    if (!user) return;
    try {
      const dataToCreate = { ...opportunityData, value: parseFloat(opportunityData.value as any || '0'), probability: parseFloat(opportunityData.probability as any || '0.1') };
      await opportunityService.createOpportunity(dataToCreate, user.id);
      setShowForm(false);
      fetchData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleUpdateOpportunity = async (opportunityData: Partial<Opportunity>) => {
    if (!user || !opportunityToEdit) return;
    try {
      const dataToUpdate = { ...opportunityData, value: opportunityData.value !== undefined ? parseFloat(opportunityData.value as any) : undefined, probability: opportunityData.probability !== undefined ? parseFloat(opportunityData.probability as any) : undefined };
      await opportunityService.updateOpportunity(opportunityToEdit.id, dataToUpdate, user.id);
      setOpportunityToEdit(null);
      setShowForm(false);
      fetchData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleStageChange = async (opportunityId: string, newStage: Opportunity['stage']) => {
    if (!user) return;
    try {
      const opportunity = opportunities.find(opp => opp.id === opportunityId);
      if (opportunity) {
        await opportunityService.updateOpportunity(opportunityId, { stage: newStage }, user.id);
        fetchData();
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteOpportunity = async (opportunityId: string) => {
    if (!user) return;
    try {
      await opportunityService.deleteOpportunity(opportunityId, user.id);
      fetchData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleImport = async (importedData: any[]) => {
    // ... your existing import logic
  };

  const totalValue = opportunities.reduce((sum, opp) => sum + opp.value, 0);
  const wonValue = opportunities.filter(opp => opp.stage === 'closed-won').reduce((sum, opp) => sum + opp.value, 0);
  const activeOpportunitiesCount = opportunities.filter(opp => !['closed-won', 'closed-lost'].includes(opp.stage)).length;

  if (loading && opportunities.length === 0) { return <div className="p-6 text-center">Loading opportunities...</div>; }
  if (error) { return <div className="p-6 text-red-600">Error: {error}</div>; }

  return (
    <div className="p-6 h-full flex flex-col bg-gray-50">
      <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-2">
            <Button variant={view === 'kanban' ? 'secondary' : 'ghost'} onClick={() => setView('kanban')}>
                Kanban Board
            </Button>
            <Button variant={view === 'scheduled' ? 'secondary' : 'ghost'} onClick={() => setView('scheduled')}>
                <CalendarClock className="w-4 h-4 mr-2" />
                Scheduled Follow-ups
            </Button>
        </div>
        <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={() => setShowAdvancedFilters(true)}><Filter className="w-4 h-4 mr-2" /> Filter</Button>
            <Button variant="outline" size="sm" onClick={() => setShowImport(true)}><Upload className="w-4 h-4 mr-2" /> Import</Button>
            <Button variant="outline" size="sm" onClick={() => setShowExport(true)}><Download className="w-4 h-4 mr-2" /> Export</Button>
            <Button size="sm" onClick={() => { setOpportunityToEdit(null); setShowForm(true); }}>
                <Plus className="w-4 h-4 mr-2" /> New Opportunity
            </Button>
        </div>
      </div>

      <div className="flex-grow overflow-y-auto">
        {view === 'kanban' ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-lg border p-4"><div className="text-sm text-gray-600">Total Pipeline Value</div><div className="text-2xl font-bold">${(totalValue / 1000).toFixed(0)}K</div></div>
              <div className="bg-white rounded-lg border p-4"><div className="text-sm text-gray-600">Won Opportunities</div><div className="text-2xl font-bold text-green-600">${(wonValue / 1000).toFixed(0)}K</div></div>
              <div className="bg-white rounded-lg border p-4"><div className="text-sm text-gray-600">Active Opportunities</div><div className="text-2xl font-bold text-blue-600">{activeOpportunitiesCount}</div></div>
            </div>
            <KanbanBoard
                opportunities={opportunities}
                onStageChange={handleStageChange}
                onCardClick={(opp) => {
                    setDetailedOpportunity(opp);
                    setIsDetailsModalOpen(true);
                }}
                onEditOpportunity={(opp) => {
                    setOpportunityToEdit(opp);
                    setShowForm(true);
                }}
                onDeleteOpportunity={handleDeleteOpportunity}
            />
          </>
        ) : (
            <div className="bg-white p-4 rounded-lg border h-full">
                <ScheduledFollowUpsView />
            </div>
        )}
      </div>

      {detailedOpportunity && (
        <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle className="text-2xl">{detailedOpportunity.name}</DialogTitle>
                    <DialogDescription>{detailedOpportunity.company}</DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                            <h4 className="font-semibold mb-2 text-gray-800">Details</h4>
                            <p className="text-sm text-gray-600 flex justify-between"><strong>Value:</strong><span>{detailedOpportunity.value.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span></p>
                            <p className="text-sm text-gray-600 flex justify-between"><strong>Stage:</strong><span>{detailedOpportunity.stage}</span></p>
                            <p className="text-sm text-gray-600 flex justify-between"><strong>Probability:</strong><span>{detailedOpportunity.probability}%</span></p>
                            <p className="text-sm text-gray-600 flex justify-between"><strong>Close Date:</strong><span>{new Date(detailedOpportunity.expected_close_date).toLocaleDateString()}</span></p>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-2 text-gray-800">Assigned To</h4>
                            <p className="flex items-center gap-2 text-sm text-gray-600"><User className="h-4 w-4 text-gray-400" /> {detailedOpportunity.assigned_to}</p>
                            <p className="flex items-center gap-2 text-sm text-gray-600"><Briefcase className="h-4 w-4 text-gray-400" /> {detailedOpportunity.contact_person}</p>
                        </div>
                    </div>
                    {detailedOpportunity.tags && detailedOpportunity.tags.length > 0 && (
                        <div className="mt-4">
                            <h4 className="font-semibold mb-2 text-gray-800">Tags</h4>
                            <div className="flex flex-wrap gap-2">
                            {detailedOpportunity.tags.map(tag => (
                                <div key={tag} className="flex items-center gap-1 bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                                    <Tag className="h-3 w-3" /> {tag}
                                </div>
                            ))}
                            </div>
                        </div>
                    )}
                </div>
                 <DialogFooter>
                    <Button variant="secondary" onClick={() => {
                        setIsDetailsModalOpen(false);
                        setOpportunityToEdit(detailedOpportunity);
                        setShowForm(true);
                    }}>
                        Edit
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
      )}

      {showForm && <OpportunityForm opportunity={opportunityToEdit} onSubmit={opportunityToEdit ? handleUpdateOpportunity : handleCreateOpportunity} onCancel={() => { setShowForm(false); setOpportunityToEdit(null); }} />}
      <ImportModal isOpen={showImport} onClose={() => setShowImport(false)} onImport={handleImport} entityType="opportunities" sampleData={sampleOpportunityData} />
      <ExportModal isOpen={showExport} onClose={() => setShowExport(false)} data={opportunities} entityType="opportunities" />
      <AdvancedFilters isOpen={showAdvancedFilters} onClose={() => setShowAdvancedFilters(false)} filters={filters} onFiltersChange={setFilters} filterConfigs={opportunityFilterConfigs} onApply={fetchData} onReset={() => setFilters({})} />
    </div>
  );
};
