import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { leadsService } from '../../services/leadsService';
import { LeadsList } from './LeadsList';
import { LeadForm } from './LeadForm';
import { LeadFilters } from './LeadFilters';
import { WhatsAppBulkModal } from './WhatsAppBulkModal';
import { TagManager } from './TagManager';
import { EmailModal } from './EmailModal';
import { SMSModal } from './SMSModal';
import { ConversationHistory } from './ConversationHistory';
import { ImportModal } from '../Common/ImportModal';
import { ExportModal } from '../Common/ExportModal';
import { AdvancedFilters } from '../Common/AdvancedFilters';
import { Lead, CommunicationRecord } from '../../types';
import { Plus, Upload, Download, Filter, MessageCircle, Users, CheckSquare, ChevronLeft, ChevronRight, Mail, Phone, Tag, CalendarClock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";


import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";

// The new dedicated view for scheduled follow-ups
import { ScheduledFollowUpsView } from './ScheduledFollowUpsView';


const leadFilterConfigs = [
  { key: 'search', label: 'Search', type: 'text', placeholder: 'Search leads...' },
  {
    key: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { value: 'new', label: 'New' },
      { value: 'contacted', label: 'Contacted' },
      { value: 'qualified', label: 'Qualified' },
      { value: 'converted', label: 'Converted' }
    ]
  },
  {
    key: 'source',
    label: 'Source',
    type: 'select',
    options: [
      { value: 'website', label: 'Website' },
      { value: 'email', label: 'Email' },
      { value: 'social', label: 'Social Media' },
      { value: 'referral', label: 'Referral' },
      { value: 'manual', label: 'Manual' }
    ]
  },
  {
    key: 'assigned_to',
    label: 'Assigned To',
    type: 'select',
    options: [
      { value: 'Alice Johnson', label: 'Alice Johnson' },
      { value: 'Bob Smith', label: 'Bob Smith' },
      { value: 'Carol Davis', label: 'Carol Davis' },
      { value: 'David Wilson', label: 'David Wilson' },
      { value: '', label: 'Unassigned' }
    ]
  },
  { key: 'scoreMin', label: 'Min Score', type: 'number', placeholder: '0' },
  { key: 'scoreMax', label: 'Max Score', type: 'number', placeholder: '100' },
  { key: 'createdAfter', label: 'Created After', type: 'date' },
  { key: 'createdBefore', label: 'Created Before', type: 'date' },
  {
    key: 'tags',
    label: 'Tags',
    type: 'multiselect',
    options: [
      { value: 'enterprise', label: 'Enterprise' },
      { value: 'high-priority', label: 'High Priority' },
      { value: 'hot-lead', label: 'Hot Lead' },
      { value: 'linkedin', label: 'LinkedIn' },
      { value: 'startup', label: 'Startup' }
    ]
  }
];

const sampleLeadData = {
  name: 'John Doe',
  email: 'john@example.com',
  phone: '+1-555-0123',
  company: 'Example Corp',
  source: 'website',
  score: '85',
  assigned_to: 'Alice Johnson',
  location: 'San Francisco, CA',
  tags: 'enterprise,high-priority'
};

export const LeadsPage: React.FC = () => {
  const { user } = useAuth();
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [communications, setCommunications] = useState<CommunicationRecord[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [leadToEdit, setLeadToEdit] = useState<Lead | null>(null);
  const [detailedLead, setDetailedLead] = useState<Lead | null>(null);
  const [showImport, setShowImport] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [showTagManager, setShowTagManager] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showSMSModal, setShowSMSModal] = useState(false);
  const [showConversationHistory, setShowConversationHistory] = useState(false);
  const [tagManagerLead, setTagManagerLead] = useState<Lead | null>(null);
  const [emailLead, setEmailLead] = useState<Lead | null>(null);
  const [smsLead, setSmsLead] = useState<Lead | null>(null);
  const [historyLead, setHistoryLead] = useState<Lead | null>(null);
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [filters, setFilters] = useState({
    status: '',
    source: '',
    assigned_to: '',
    score: '',
    search: '',
    scoreMin: '',
    scoreMax: '',
    createdAfter: '',
    createdBefore: '',
    tags: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalLeads, setTotalLeads] = useState(0);
  const limit = 10;

  // NEW STATE: To toggle between the main list and the scheduled view
  const [view, setView] = useState<'list' | 'scheduled'>('list');

  const fetchLeadsData = useCallback(async () => {
    if (!user) {
      setError('You must be logged in to view leads.');
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const { data, total } = await leadsService.getLeads(user.id, currentPage, limit);
      setLeads(data);
      setTotalLeads(total);
      if (data.length > 0 && !detailedLead) {
        setDetailedLead(data[0]);
      }
      const commsPromises = data.map(lead => leadsService.getCommunications(lead.id, user.id));
      const commsArrays = await Promise.all(commsPromises);
      setCommunications(commsArrays.flat());
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user, currentPage, limit, detailedLead]);

  useEffect(() => {
    if (view === 'list') {
      fetchLeadsData();
    }
  }, [view, fetchLeadsData]);

  useEffect(() => {
    if (!user) return;
    const leadsSubscription = leadsService.subscribeToLeads(user.id, (payload) => {
      if (view === 'list') fetchLeadsData();
    });
    const commsSubscription = leadsService.subscribeToCommunications(user.id, (payload) => {
      if (view === 'list') fetchLeadsData();
    });
    return () => {
      leadsSubscription.unsubscribe();
      commsSubscription.unsubscribe();
    };
  }, [user, view, fetchLeadsData]);

  const handleCreateLead = async (leadData: Partial<Lead>) => {
    if (!user) return;
    try {
      await leadsService.createLead({ ...leadData, assigned_to: leadData.assigned_to }, user.id);
      setShowForm(false);
      setCurrentPage(1);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleUpdateLead = async (leadData: Partial<Lead>) => {
    if (!user || !leadToEdit) return;
    try {
      await leadsService.updateLead(leadToEdit.id, { ...leadData, assigned_to: leadData.assigned_to }, user.id);
      setLeadToEdit(null);
      setShowForm(false);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteLead = async (leadId: string) => {
    if (!user) return;
    try {
      await leadsService.deleteLead(leadId, user.id);
      setSelectedLeads((prev) => prev.filter((id) => id !== leadId));
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleSelectLead = (leadId: string) => {
    setSelectedLeads((prev) =>
      prev.includes(leadId) ? prev.filter((id) => id !== leadId) : [...prev, leadId]
    );
  };

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      !filters.search ||
      lead.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      lead.email.toLowerCase().includes(filters.search.toLowerCase()) ||
      lead.company?.toLowerCase().includes(filters.search.toLowerCase());
    const matchesStatus = !filters.status || lead.status === filters.status;
    const matchesSource = !filters.source || lead.source === filters.source;
    const matchesAssignedTo = !filters.assigned_to || lead.assigned_to === filters.assigned_to;
    const matchesMinScore = !filters.scoreMin || lead.score >= parseInt(filters.scoreMin);
    const matchesMaxScore = !filters.scoreMax || lead.score <= parseInt(filters.scoreMax);
    const matchesCreatedAfter = !filters.createdAfter || new Date(lead.created_at) >= new Date(filters.createdAfter);
    const matchesCreatedBefore = !filters.createdBefore || new Date(lead.created_at) <= new Date(filters.createdBefore);
    const matchesTags = filters.tags.length === 0 || filters.tags.some((tag: string) => lead.tags.includes(tag));
    return (
      matchesSearch && matchesStatus && matchesSource && matchesAssignedTo &&
      matchesMinScore && matchesMaxScore && matchesCreatedAfter && matchesCreatedBefore && matchesTags
    );
  });

  const handleSelectAll = () => {
    if (selectedLeads.length === filteredLeads.length) {
      setSelectedLeads([]);
    } else {
      setSelectedLeads(filteredLeads.map((lead) => lead.id));
    }
  };

  const handleSendWhatsApp = (message: string, targetLeads: Lead[]) => {
    console.log('Sending WhatsApp messages:', { message, targetLeads });
    alert(`WhatsApp messages sent to ${targetLeads.length} leads!`);
    setSelectedLeads([]);
  };

  const handleManageTags = (lead: Lead) => {
    setTagManagerLead(lead);
    setShowTagManager(true);
  };

  const handleUpdateTags = async (leadId: string, tags: string[]) => {
    if (!user) return;
    try {
      await leadsService.updateLead(leadId, { tags }, user.id);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleSendEmail = (lead: Lead) => {
    setEmailLead(lead);
    setShowEmailModal(true);
  };

  const handleSendSMS = (lead: Lead) => {
    setSmsLead(lead);
    setShowSMSModal(true);
  };

  const handleViewHistory = (lead: Lead) => {
    setHistoryLead(lead);
    setShowConversationHistory(true);
  };

  const handleEmailSent = async (emailData: any) => { /* ... */ };
  const handleSMSSent = async (smsData: any) => { /* ... */ };
  const handleReplyFromHistory = (type: 'email' | 'sms') => { /* ... */ };
  const handleImport = async (importedData: any[]) => { /* ... */ };

  const selectedLeadObjects = leads.filter((lead) => selectedLeads.includes(lead.id));
  const leadsWithPhone = selectedLeadObjects.filter((lead) => lead.phone);
  const allTags = Array.from(new Set(leads.flatMap((lead) => lead.tags))).sort();
  const totalPages = Math.ceil(totalLeads / limit);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setSelectedLeads([]);
  };

  if (!user) {
    return <div className="p-6 text-red-600">Please log in to access the leads page.</div>;
  }

  return (
    <div className="h-full flex flex-col p-6 bg-gray-50">
      {/* This is the main container, now taking full width */}
      <div className="w-full bg-white h-full flex flex-col border rounded-lg shadow-sm">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Button size="sm" variant={view === 'list' ? 'secondary' : 'ghost'} onClick={() => setView('list')}>Leads List</Button>
              <Button size="sm" variant={view === 'scheduled' ? 'secondary' : 'ghost'} onClick={() => setView('scheduled')}>
                <CalendarClock className="w-4 h-4 mr-2" /> Scheduled Follow-ups
              </Button>
            </div>
            {view === 'list' && (
              <Button size="sm" onClick={() => { setLeadToEdit(null); setShowForm(true); }}>
                <Plus className="w-4 h-4 mr-2" /> New Lead
              </Button>
            )}
          </div>
        </div>

        <div className="flex-grow overflow-y-auto">
          {view === 'list' ? (
            <div className="p-4">
              <div className="p-4 border-b">
                <LeadFilters filters={filters} onFiltersChange={setFilters} />
              </div>
              <div className="p-4 flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" onClick={() => setShowImport(true)}><Upload className="w-4 h-4 mr-2" /> Import</Button>
                  <Button variant="outline" size="sm" onClick={() => setShowExport(true)}><Download className="w-4 h-4 mr-2" /> Export</Button>
                  <Button variant="outline" size="sm" onClick={() => setShowAdvancedFilters(true)}><Filter className="w-4 h-4 mr-2" /> More Filters</Button>
                </div>
              </div>
              <div className="flex-grow overflow-y-auto">
                {loading ? (
                  <p className="p-4 text-center">Loading leads...</p>
                ) : (
                  <LeadsList
                    leads={filteredLeads}
                    selectedLeads={selectedLeads}
                    onSelectLead={handleSelectLead}
                    onSelectAll={handleSelectAll} // ✅ Fixed!
                    onRowClick={(lead) => {
                      setDetailedLead(lead);
                      setIsDetailsModalOpen(true);
                    }}
                    onEditLead={(lead) => {
                      setLeadToEdit(lead);
                      setShowForm(true);
                    }}
                    onDeleteLead={handleDeleteLead}
                    onManageTags={handleManageTags}
                    onSendEmail={handleSendEmail}
                    onSendSMS={handleSendSMS}
                    onViewHistory={handleViewHistory}
                  />

                )}

              </div>
              {totalPages > 1 && (
                <div className="p-4 border-t flex items-center justify-between">
                  <div className="text-sm text-gray-600">Page {currentPage} of {totalPages}</div>
                  <div className="flex items-center space-x-1">
                    <Button variant="outline" size="icon" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}><ChevronLeft className="w-4 h-4" /></Button>
                    <Button variant="outline" size="icon" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}><ChevronRight className="w-4 h-4" /></Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <ScheduledFollowUpsView />
          )}
        </div>
      </div>

      {/* Details Modal */}
      {detailedLead && (
        <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle className="text-2xl">{detailedLead.name}</DialogTitle>
              <DialogDescription>{detailedLead.company}</DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Contact Info</h4>
                  <p className="flex items-center gap-2 text-sm"><Mail className="h-4 w-4 text-gray-500" /> {detailedLead.email}</p>
                  <p className="flex items-center gap-2 text-sm"><Phone className="h-4 w-4 text-gray-500" /> {detailedLead.phone || 'N/A'}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Details</h4>
                  <p className="text-sm"><strong>Status:</strong> {detailedLead.status}</p>
                  <p className="text-sm"><strong>Source:</strong> {detailedLead.source}</p>
                  <p className="text-sm"><strong>Score:</strong> {detailedLead.score}</p>
                </div>
              </div>
              {detailedLead.tags && detailedLead.tags.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-semibold mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {detailedLead.tags.map(tag => (
                      <div key={tag} className="flex items-center gap-1 bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                        <Tag className="h-3 w-3" /> {tag}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* All Modals */}
      {showForm && <LeadForm lead={leadToEdit} onSubmit={leadToEdit ? handleUpdateLead : handleCreateLead} onCancel={() => { setShowForm(false); setLeadToEdit(null); }} />}
      <WhatsAppBulkModal isOpen={showWhatsAppModal} onClose={() => setShowWhatsAppModal(false)} selectedLeads={selectedLeadObjects} onSend={handleSendWhatsApp} />
      {showTagManager && tagManagerLead && <TagManager isOpen={showTagManager} onClose={() => { setShowTagManager(false); setTagManagerLead(null); }} lead={tagManagerLead} onUpdateTags={handleUpdateTags} availableTags={allTags} />}
      {showEmailModal && emailLead && <EmailModal isOpen={showEmailModal} onClose={() => { setShowEmailModal(false); setEmailLead(null); }} lead={emailLead} onSend={handleEmailSent} />}
      {showSMSModal && smsLead && <SMSModal isOpen={showSMSModal} onClose={() => { setShowSMSModal(false); setSmsLead(null); }} lead={smsLead} onSend={handleSMSSent} />}
      {showConversationHistory && historyLead && <ConversationHistory isOpen={showConversationHistory} onClose={() => { setShowConversationHistory(false); setHistoryLead(null); }} contact={historyLead} communications={communications} onReply={handleReplyFromHistory} />}
      <ImportModal isOpen={showImport} onClose={() => setShowImport(false)} onImport={handleImport} entityType="leads" sampleData={sampleLeadData} />
      <ExportModal isOpen={showExport} onClose={() => setShowExport(false)} data={filteredLeads} entityType="leads" />
      <AdvancedFilters isOpen={showAdvancedFilters} onClose={() => setShowAdvancedFilters(false)} filters={filters} onFiltersChange={setFilters} filterConfigs={leadFilterConfigs} onApply={() => { }} onReset={() => setFilters({ status: '', source: '', assigned_to: '', score: '', search: '', scoreMin: '', scoreMax: '', createdAfter: '', createdBefore: '', tags: [] })} />
    </div>
  );
};
