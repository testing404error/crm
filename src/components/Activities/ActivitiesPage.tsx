import React, { useState, useEffect, useCallback } from 'react';
import { ActivitiesList } from './ActivitiesList';
import { ActivityForm } from './ActivityForm';
import { ActivityFilters } from './ActivityFilters';
import { ImportModal } from '../Common/ImportModal';
import { ExportModal } from '../Common/ExportModal';
import { AdvancedFilters } from '../Common/AdvancedFilters';
import { Activity } from '../../types';
import { Plus, Upload, Download, Filter, Calendar, CheckSquare, ChevronLeft, ChevronRight, CalendarPlus } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { activityService } from '../../services/activityService';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// New Components for Scheduling
import { UniversalScheduleActivityModal } from '../Shared/UniversalScheduleActivityModal';
// CORRECTED IMPORT: The component is in the same directory, not in the Leads folder.
import { ScheduledFollowUps } from './ScheduledFollowUps';


const activityFilterConfigs = [
  { key: 'title', label: 'Search by Title', type: 'text' as const, placeholder: 'Search titles...' },
  {
    key: 'type',
    label: 'Type',
    type: 'select' as const,
    options: [
      { value: '', label: 'All Types' },
      { value: 'call', label: 'Call' },
      { value: 'email', label: 'Email' },
      { value: 'meeting', label: 'Meeting' },
      { value: 'task', label: 'Task' },
      { value: 'note', label: 'Note' },
    ],
  },
  {
    key: 'status',
    label: 'Status',
    type: 'select' as const,
    options: [
      { value: '', label: 'All Statuses' },
      { value: 'pending', label: 'Pending' },
      { value: 'completed', label: 'Completed' },
      { value: 'overdue', label: 'Overdue' },
    ],
  },
  { key: 'dueDateAfter', label: 'Due After', type: 'date' as const },
  { key: 'dueDateBefore', label: 'Due Before', type: 'date' as const },
  { key: 'created_at_after', label: 'Created After', type: 'date' as const },
  { key: 'created_at_before', label: 'Created Before', type: 'date' as const },
];

const sampleActivityData = {
  type: 'task' as Activity['type'],
  title: 'Follow-up with new lead',
  description: 'Discuss their requirements and our solutions.',
  dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
  status: 'pending' as Activity['status'],
};


export const ActivitiesPage: React.FC = () => {
  const { user } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [showImport, setShowImport] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalActivities, setTotalActivities] = useState(0);
  const [filters, setFilters] = useState<Partial<Activity>>({
    title: '',
    type: undefined,
    status: undefined,
  });

  // New state for scheduling modal and refreshing the list
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);


  const fetchActivities = useCallback(async () => {
    if (!user) {
      setError('You must be logged in to view activities.');
      setLoading(false);
      setActivities([]);
      setTotalActivities(0);
      return;
    }
    try {
      setLoading(true);
      const currentFilters: Record<string, unknown> = { ...filters };
      if (currentFilters.dueDateAfter === '') delete currentFilters.dueDateAfter;
      if (currentFilters.dueDateBefore === '') delete currentFilters.dueDateBefore;
      if (currentFilters.created_at_after === '') delete currentFilters.created_at_after;
      if (currentFilters.created_at_before === '') delete currentFilters.created_at_before;


      const { data, total } = await activityService.getActivities(
        user.id,
        currentPage,
        itemsPerPage,
        currentFilters
      );
      setActivities(data);
      setTotalActivities(total);
      setError(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(message);
      toast.error(`Failed to fetch activities: ${message}`);
      setActivities([]);
      setTotalActivities(0);
    } finally {
      setLoading(false);
    }
  }, [user, currentPage, itemsPerPage, filters]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  useEffect(() => {
    if (!user) return;

    const channel = activityService.subscribeToActivities(user.id, (payload: any) => {
      console.log('Activity subscription payload:', payload);

      let message = `Real-time update: Activity ${payload.eventType.toLowerCase()}`;
      if (payload.eventType === 'INSERT' && payload.new) message = `New activity added: ${(payload.new as Activity).title }`;
      if (payload.eventType === 'UPDATE' && payload.new) message = `Activity updated: ${(payload.new as Activity).title }`;
      if (payload.eventType === 'DELETE' && payload.old) message = `Activity deleted: ${payload.old.title || 'ID: ' + payload.old.id}`;
      toast.info(message);
      fetchActivities(); // Simple refetch for consistency
    });

    return () => {
      if (channel && typeof channel.unsubscribe === 'function') {
        channel.unsubscribe();
      }
    };
  }, [user, fetchActivities]);


  const handleCreateActivity = async (activityData: Partial<Activity>) => {
    if (!user) return;
    try {
      await activityService.createActivity(activityData, user.id);
      toast.success('Activity created successfully!');
      setShowForm(false);
      if (currentPage !== 1) setCurrentPage(1);
      else fetchActivities();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(message);
      toast.error(`Failed to create activity: ${message}`);
    }
  };

  const handleUpdateActivity = async (activityData: Partial<Activity>) => {
    if (!user || !selectedActivity) return;
    try {
      await activityService.updateActivity(selectedActivity.id, activityData, user.id);
      toast.success('Activity updated successfully!');
      setSelectedActivity(null);
      setShowForm(false);
      fetchActivities();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(message);
      toast.error(`Failed to update activity: ${message}`);
    }
  };

  const handleDeleteActivity = async (activityId: string) => {
    if (!user) return;
    try {
      await activityService.deleteActivity(activityId, user.id);
      toast.success('Activity deleted successfully!');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(message);
      toast.error(`Failed to delete activity: ${message}`);
    }
  };

  const handleCompleteActivity = async (activityId: string) => {
    if (!user) return;
    try {
      const activity = activities.find(a => a.id === activityId);
      if (activity) {
        await activityService.updateActivity(activityId, {
          status: 'completed',
          completedAt: new Date().toISOString()
        }, user.id);
        toast.success('Activity marked as completed!');
        fetchActivities();
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(message);
      toast.error(`Failed to complete activity: ${message}`);
    }
  };


  const handleImport = async (importedData: Record<string, any>[]) => {
    if (!user) {
        toast.error("You must be logged in to import activities.");
        return;
    }
    // ... (rest of your import logic)
    toast.info(`Starting import of ${importedData.length} activities...`);
    setShowImport(false);
    setCurrentPage(1);
    fetchActivities();
  };

  const handleActivityScheduled = () => {
    setRefreshKey(prev => prev + 1);
    toast.success("Follow-up scheduled!");
  };

  const totalPages = Math.ceil(totalActivities / itemsPerPage);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleApplyAdvancedFilters = (newFilters: Partial<Activity>) => {
    setFilters(prev => ({...prev, ...newFilters}));
    setCurrentPage(1);
    setShowAdvancedFilters(false);
  };

  const handleResetAdvancedFilters = () => {
     setFilters({
       title: filters.title,
       type: filters.type,
       status: filters.status,
     });
     setCurrentPage(1);
     setShowAdvancedFilters(false);
  }


  if (!user && !loading) {
    return <div className="p-6 text-red-600">Please log in to access activities.</div>;
  }

  const getActivityStats = () => {
    const pending = activities.filter(a => a.status === 'pending' && !(a.dueDate && new Date(a.dueDate) < new Date() && a.status !== 'completed')).length;
    const completed = activities.filter(a => a.status === 'completed').length;
    const overdue = activities.filter(a => a.status === 'overdue' || (a.status === 'pending' && a.dueDate && new Date(a.dueDate) < new Date() && a.status !== 'completed')).length;
    return { pending, completed, overdue };
  };

  const stats = getActivityStats();

  return (
    <div className="p-4 md:p-6 max-w-full mx-auto">
      <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Activities</h1>
          <p className="text-gray-600 mt-1 md:mt-2 text-sm md:text-base">Manage tasks, calls, meetings, and follow-ups</p>
        </div>
        <div className="flex items-center space-x-2 md:space-x-3">
          <Button
            variant="outline"
            onClick={() => {
              setSelectedActivity(null);
              setShowForm(true);
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            New Task
          </Button>
          <Button
            variant="default"
            onClick={() => setIsScheduleModalOpen(true)}
          >
            <CalendarPlus className="w-4 h-4 mr-2" />
            Schedule Follow-up
          </Button>
        </div>
      </div>

      <Tabs defaultValue="tasks" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="follow-ups">Scheduled Follow-ups</TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="mt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
                {[
                  { title: 'Total Tasks', value: totalActivities, icon: Calendar, color: 'text-blue-600' },
                  { title: 'Pending', value: stats.pending, icon: CheckSquare, color: 'text-yellow-600' },
                  { title: 'Completed', value: stats.completed, icon: CheckSquare, color: 'text-green-600' },
                  { title: 'Overdue', value: stats.overdue, icon: CheckSquare, color: 'text-red-600' },
                ].map(stat => (
                  <div key={stat.title} className="bg-white rounded-lg border border-gray-200 p-3 md:p-4">
                    <div className="flex items-center">
                      <stat.icon className={`w-6 h-6 md:w-8 md:h-8 ${stat.color} mr-2 md:mr-3`} />
                      <div>
                        <div className="text-xs md:text-sm text-gray-600">{stat.title}</div>
                        <div className="text-xl md:text-2xl font-bold text-gray-900">{stat.value}</div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>

            <div className="flex flex-col md:flex-row items-center justify-between mb-4 gap-4">
                <ActivityFilters
                    filters={filters}
                    onFiltersChange={(newFilters) => {
                        setFilters(prev => ({ ...prev, ...newFilters }));
                        setCurrentPage(1);
                    }}
                />
                <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" onClick={() => setShowAdvancedFilters(true)}><Filter className="w-4 h-4 mr-2" /> More Filters</Button>
                    <Button variant="outline" size="sm" onClick={() => setShowImport(true)}><Upload className="w-4 h-4 mr-2" /> Import</Button>
                    <Button variant="outline" size="sm" onClick={() => setShowExport(true)}><Download className="w-4 h-4 mr-2" /> Export</Button>
                </div>
            </div>

            {loading && activities.length === 0 ? (
                <div className="text-center py-10 text-gray-500">Loading activities...</div>
            ) : error && activities.length === 0 ? (
                <div className="p-6 text-red-600 text-center">Error: {error} <button onClick={fetchActivities} className="ml-2 px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600">Retry</button></div>
            ) : (
                <>
                    <ActivitiesList
                        activities={activities}
                        onEditActivity={(activity) => {
                            setSelectedActivity(activity);
                            setShowForm(true);
                        }}
                        onDeleteActivity={handleDeleteActivity}
                        onCompleteActivity={handleCompleteActivity}
                    />
                    {totalPages > 1 && (
                        <div className="mt-6 flex flex-col md:flex-row items-center justify-between gap-3">
                            <div className="text-sm text-gray-600">
                                Page {currentPage} of {totalPages}
                            </div>
                            <div className="flex items-center space-x-1 md:space-x-2">
                                <Button variant="outline" size="icon" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}><ChevronLeft className="w-4 h-4" /></Button>
                                <Button variant="outline" size="icon" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}><ChevronRight className="w-4 h-4" /></Button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </TabsContent>

        <TabsContent value="follow-ups" className="mt-6">
          <ScheduledFollowUps refreshKey={refreshKey} />
        </TabsContent>
      </Tabs>

      {/* Modals */}
      {showForm && (
        <ActivityForm
          activity={selectedActivity}
          onSubmit={selectedActivity ? handleUpdateActivity : handleCreateActivity}
          onCancel={() => {
            setShowForm(false);
            setSelectedActivity(null);
          }}
        />
      )}

      <UniversalScheduleActivityModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        onActivityScheduled={handleActivityScheduled}
      />

      <ImportModal
        isOpen={showImport}
        onClose={() => setShowImport(false)}
        onImport={handleImport}
        entityType="activities"
        sampleData={sampleActivityData}
      />

      <ExportModal
        isOpen={showExport}
        onClose={() => setShowExport(false)}
        data={activities}
        entityType="activities"
      />

      <AdvancedFilters
        isOpen={showAdvancedFilters}
        onClose={() => setShowAdvancedFilters(false)}
        filters={filters}
        filterConfigs={activityFilterConfigs}
        onApply={handleApplyAdvancedFilters}
        onReset={handleResetAdvancedFilters}
      />
    </div>
  );
};
