import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { activityService } from '../../services/activityService';
import { ScheduledActivity } from '../../types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CalendarPlus, Calendar, Mail, Phone, Users, Briefcase, User as LeadIcon } from 'lucide-react';
import { UniversalScheduleActivityModal } from '@/components/Shared/UniversalScheduleActivityModal';

const activityIcons = {
  Call: <Phone className="h-5 w-5 text-blue-500" />,
  Email: <Mail className="h-5 w-5 text-green-500" />,
  Meeting: <Users className="h-5 w-5 text-purple-500" />,
};

const parentIcons = {
    Lead: <LeadIcon className="h-4 w-4 text-gray-500" />,
    Opportunity: <Briefcase className="h-4 w-4 text-gray-500" />,
};

// CORRECTED: The component is named ScheduledFollowUpsView and is exported correctly.
export const ScheduledFollowUps: React.FC = () => {
  const { user } = useAuth();
  const [allActivities, setAllActivities] = useState<ScheduledActivity[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<ScheduledActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    if (!user) return;
    const fetchActivities = async () => {
      setIsLoading(true);
      try {
        const data = await activityService.getAllScheduledActivities(user.id);
        setAllActivities(data);
      } catch (error) {
        console.error("Failed to fetch scheduled activities", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchActivities();
  }, [user, refreshKey]);

  useEffect(() => {
    let activities = [...allActivities];
    if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        activities = activities.filter(a => new Date(a.scheduled_at) >= start);
    }
    if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        activities = activities.filter(a => new Date(a.scheduled_at) <= end);
    }
    setFilteredActivities(activities);
  }, [startDate, endDate, allActivities]);

  const handleActivityScheduled = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Scheduled Follow-ups</h2>
        <Button size="sm" onClick={() => setIsModalOpen(true)}>
          <CalendarPlus className="w-4 h-4 mr-2" />
          Schedule New
        </Button>
      </div>

      <Card className="mb-4">
        <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1 w-full">
                <Label className="text-xs font-medium">From</Label>
                <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
            </div>
            <div className="flex-1 w-full">
                <Label className="text-xs font-medium">To</Label>
                <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
            </div>
            <div className="pt-5">
                <Button variant="ghost" onClick={() => { setStartDate(''); setEndDate(''); }}>Clear</Button>
            </div>
        </CardContent>
      </Card>
      
      <div className="flex-grow overflow-y-auto">
        {isLoading ? (
            <p className="text-center py-8">Loading...</p>
        ) : filteredActivities.length === 0 ? (
            <div className="text-center py-10 text-gray-500">No scheduled activities found.</div>
        ) : (
            <div className="space-y-3">
                {filteredActivities
                    .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())
                    .map(activity => (
                        <Card key={activity.id}>
                            <CardContent className="p-4 flex items-start gap-4">
                                <div className="mt-1">{activityIcons[activity.type]}</div>
                                <div className='flex-1'>
                                    <p className="font-semibold">{activity.type} with {activity.parentName}</p>
                                    <div className="flex items-center text-sm text-gray-600 gap-4">
                                        <p className="flex items-center gap-1.5">
                                            <Calendar className="h-4 w-4" />
                                            {new Date(activity.scheduled_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                                        </p>
                                        {activity.parentType && (
                                            <p className="flex items-center gap-1.5">
                                                {parentIcons[activity.parentType]}
                                                {activity.parentType}
                                            </p>
                                        )}
                                    </div>
                                    {activity.notes && <p className="text-sm mt-2 bg-gray-100 p-2 rounded">{activity.notes}</p>}
                                </div>
                            </CardContent>
                        </Card>
                ))}
            </div>
        )}
      </div>

      <UniversalScheduleActivityModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onActivityScheduled={handleActivityScheduled}
      />
    </div>
  );
};
