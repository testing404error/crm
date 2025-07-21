import React, { useEffect, useState } from 'react';
import { activityService } from '@/services/activityService';
import { ScheduledActivity } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Mail, Phone, Users } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '../ui/button';

interface UpcomingActivitiesProps {
  leadId?: string;
  opportunityId?: string;
  refreshKey: number;
}

const activityIcons = {
  Call: <Phone className="h-5 w-5 text-blue-500" />,
  Email: <Mail className="h-5 w-5 text-green-500" />,
  Meeting: <Users className="h-5 w-5 text-purple-500" />,
};

export const UpcomingActivities: React.FC<UpcomingActivitiesProps> = ({
  leadId,
  opportunityId,
  refreshKey,
}) => {
  const [activities, setActivities] = useState<ScheduledActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState('');
  const [filterDate, setFilterDate] = useState('');

  useEffect(() => {
    const fetchActivities = async () => {
      setIsLoading(true);
      const parentId = leadId || opportunityId;
      const parentType = leadId ? 'lead' : 'opportunity';
      if (parentId) {
        try {
            const fetchedActivities = await activityService.getScheduledActivities(parentId, parentType);
            setActivities(fetchedActivities);
        } catch (error) {
            console.error("Failed to fetch activities:", error);
        }
      }
      setIsLoading(false);
    };

    fetchActivities();
  }, [leadId, opportunityId, refreshKey]);

  const filteredActivities = activities
    .filter((activity) => (filterType ? activity.type === filterType : true))
    .filter((activity) =>
      filterDate ? new Date(activity.scheduled_at) >= new Date(filterDate) : true
    )
    .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime());

  const clearFilters = () => {
      setFilterType('');
      setFilterDate('');
  }

  if (isLoading) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Upcoming Activities</CardTitle>
            </CardHeader>
            <CardContent>
                <p>Loading activities...</p>
            </CardContent>
        </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Activities</CardTitle>
        <div className="flex flex-wrap gap-2 mt-4">
          <Select onValueChange={setFilterType} value={filterType}>
            <SelectTrigger className="flex-1 min-w-[150px]">
              <SelectValue placeholder="Filter by type..." />
            </SelectTrigger>
            <SelectContent>
              {/* The "All Types" item with an empty value was removed to fix the error. */}
              {/* The "Clear" button should be used to reset this filter. */}
              <SelectItem value="Call">Call</SelectItem>
              <SelectItem value="Email">Email</SelectItem>
              <SelectItem value="Meeting">Meeting</SelectItem>
            </SelectContent>
          </Select>
          <Input
            type="date"
            placeholder="Filter by date from..."
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="flex-1 min-w-[150px]"
          />
          <Button variant="ghost" onClick={clearFilters}>Clear</Button>
        </div>
      </CardHeader>
      <CardContent>
        {filteredActivities.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No upcoming activities scheduled.</p>
        ) : (
          <ul className="space-y-4">
            {filteredActivities.map((activity) => (
              <li key={activity.id} className="flex items-start gap-4 p-2 rounded-lg hover:bg-gray-50">
                <div className="mt-1">{activityIcons[activity.type]}</div>
                <div className='flex-1'>
                  <p className="font-semibold">{activity.type}</p>
                  <p className="text-sm text-gray-600">
                    <Calendar className="inline-block h-4 w-4 mr-1" />
                    {new Date(activity.scheduled_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                  </p>
                  {activity.notes && <p className="text-sm mt-1 bg-gray-100 p-2 rounded">{activity.notes}</p>}
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};
