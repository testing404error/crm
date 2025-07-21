import React from 'react';
import { Activity } from '../../types';
import { Phone, Mail, Calendar, CheckSquare, FileText } from 'lucide-react';

interface ActivityFeedProps {
  activities: Activity[];
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ activities }) => {
  const getActivityIcon = (type: Activity['type']) => {
    const iconProps = { className: 'w-4 h-4' };
    switch (type) {
      case 'call': return <Phone {...iconProps} />;
      case 'email': return <Mail {...iconProps} />;
      case 'meeting': return <Calendar {...iconProps} />;
      case 'task': return <CheckSquare {...iconProps} />;
      case 'note': return <FileText {...iconProps} />;
      default: return <FileText {...iconProps} />;
    }
  };

  const getActivityColor = (type: Activity['type']) => {
    switch (type) {
      case 'call': return 'bg-blue-100 text-blue-600';
      case 'email': return 'bg-green-100 text-green-600';
      case 'meeting': return 'bg-purple-100 text-purple-600';
      case 'task': return 'bg-orange-100 text-orange-600';
      case 'note': return 'bg-gray-100 text-gray-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      // Check if the date is valid
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      }).format(date);
    } catch (error) {
      console.error("Error formatting date:", dateString, error);
      return 'Invalid date';
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start space-x-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getActivityColor(activity.type)}`}>
              {getActivityIcon(activity.type)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">{activity.title}</p>
              <p className="text-sm text-gray-600">
                {activity.relatedTo ? `${activity.relatedTo.name} • ` : ''}{activity.assignedTo}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {activity.completedAt ? formatDate(activity.completedAt) : 
                 activity.dueDate ? `Due ${formatDate(activity.dueDate)}` : 
                 formatDate(activity.createdAt)}
              </p>
            </div>
            <div className="flex-shrink-0">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                activity.status === 'completed' ? 'bg-green-100 text-green-800' :
                activity.status === 'overdue' ? 'bg-red-100 text-red-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {activity.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};