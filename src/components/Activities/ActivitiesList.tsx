import React from 'react';
import { Activity } from '../../types';
import { Phone, Mail, Calendar as CalendarIcon, CheckSquare, FileText, Edit, Trash2, Check, Clock, AlertTriangle, User, Building2, Link2 } from 'lucide-react'; // Renamed Calendar to CalendarIcon to avoid conflict

interface ActivitiesListProps {
  activities: Activity[];
  onEditActivity: (activity: Activity) => void;
  onDeleteActivity: (activityId: string) => void;
  onCompleteActivity: (activityId: string) => void;
  // Optional: To display user names if `assignedTo` is a user ID
  // usersMap?: Map<string, string>; // Map of user ID to user name
}

export const ActivitiesList: React.FC<ActivitiesListProps> = ({ 
  activities, 
  onEditActivity, 
  onDeleteActivity,
  onCompleteActivity,
  // usersMap
}) => {
  const getActivityIcon = (type: Activity['type']) => {
    const iconProps = { className: 'w-5 h-5' };
    switch (type) {
      case 'call': return <Phone {...iconProps} />;
      case 'email': return <Mail {...iconProps} />;
      case 'meeting': return <CalendarIcon {...iconProps} />;
      case 'task': return <CheckSquare {...iconProps} />;
      case 'note': return <FileText {...iconProps} />;
      default: return <FileText {...iconProps} />;
    }
  };

  const getActivityColor = (type: Activity['type']) => {
    switch (type) {
      case 'call': return 'bg-blue-100 text-blue-600 border-blue-200';
      case 'email': return 'bg-green-100 text-green-600 border-green-200';
      case 'meeting': return 'bg-purple-100 text-purple-600 border-purple-200';
      case 'task': return 'bg-orange-100 text-orange-600 border-orange-200';
      case 'note': return 'bg-gray-100 text-gray-600 border-gray-200';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const getStatusColor = (status: Activity['status'], dueDate?: string) => {
    if (status === 'pending' && dueDate && new Date(dueDate) < new Date()) {
      return 'bg-red-100 text-red-800'; // Overdue based on date
    }
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'overdue': return 'bg-red-100 text-red-800'; // Explicit overdue status
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: Activity['status'], dueDate?: string) => {
    if (status === 'pending' && dueDate && new Date(dueDate) < new Date()) {
      return <AlertTriangle className="w-4 h-4" />; // Overdue based on date
    }
    switch (status) {
      case 'completed': return <Check className="w-4 h-4" />;
      case 'overdue': return <AlertTriangle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getRelatedIcon = (type?: string) => {
    if (!type) return <Link2 className="w-4 h-4 text-gray-400" />;
    switch (type.toLowerCase()) {
      case 'customer': return <Building2 className="w-4 h-4 text-indigo-500" />;
      case 'opportunity': return <CheckSquare className="w-4 h-4 text-teal-500" />;
      case 'lead': return <User className="w-4 h-4 text-pink-500" />;
      default: return <Link2 className="w-4 h-4 text-gray-400" />;
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return 'Invalid Date';
    }
  };

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return 'N/A';
     try {
      return new Date(dateString).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Invalid Date';
    }
  };

  // const getAssignedToName = (userId: string) => {
  //   return usersMap?.get(userId) || userId; // Fallback to ID if name not found
  // };


  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-10">
                Activity
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Related To
              </th>
              {/* <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Assigned To
              </th> */}
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Due Date
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Completed At
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider sticky right-0 bg-gray-50 z-10">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {activities.map((activity) => (
              <tr key={activity.id} className="hover:bg-gray-50 transition-colors group">
                <td className="px-4 py-4 whitespace-nowrap sticky left-0 bg-white group-hover:bg-gray-50 z-10">
                  <div className="flex items-start space-x-3">
                    <div className={`flex-shrink-0 w-10 h-10 rounded-lg border flex items-center justify-center ${getActivityColor(activity.type)}`}>
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate" title={activity.title}>{activity.title}</div>
                      {activity.description && (
                        <div className="text-sm text-gray-500 mt-1 line-clamp-1" title={activity.description}>
                          {activity.description}
                        </div>
                      )}
                      <div className="text-xs text-gray-400 mt-1 capitalize">
                        {activity.type}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  {activity.relatedTo ? (
                    <div className="flex items-center space-x-2">
                      <div className="flex-shrink-0">
                        {getRelatedIcon(activity.relatedTo.type)}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900 truncate" title={activity.relatedTo.name}>
                          {activity.relatedTo.name}
                        </div>
                        <div className="text-xs text-gray-500 capitalize">
                          {activity.relatedTo.type}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400 italic">None</span>
                  )}
                </td>
                {/* <td className="px-4 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    Ideally, fetch user avatar or use initials
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-gray-600" />
                    </div>
                    <div className="text-sm text-gray-900">{getAssignedToName(activity.assignedTo)}</div>
                  </div>
                </td> */}
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {formatDate(activity.dueDate)}
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(activity.status, activity.dueDate)}`}>
                    {getStatusIcon(activity.status, activity.dueDate)}
                    <span className="ml-1 capitalize">
                      {activity.status === 'pending' && activity.dueDate && new Date(activity.dueDate) < new Date() && activity.status !== 'completed' ? 'Overdue' : activity.status}
                    </span>
                  </span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDateTime(activity.created_at)}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                  {activity.completedAt ? formatDateTime(activity.completedAt) : <span className="italic">N/A</span>}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium sticky right-0 bg-white group-hover:bg-gray-50 z-10">
                  <div className="flex items-center justify-end space-x-1">
                    {activity.status === 'pending' && (
                      <button
                        onClick={() => onCompleteActivity(activity.id)}
                        className="text-green-600 hover:text-green-800 p-1.5 hover:bg-green-100 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-green-500"
                        title="Mark as completed"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => onEditActivity(activity)}
                      className="text-blue-600 hover:text-blue-800 p-1.5 hover:bg-blue-100 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                      title="Edit Activity"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteActivity(activity.id)}
                      className="text-red-600 hover:text-red-800 p-1.5 hover:bg-red-100 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
                      title="Delete Activity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {activities.length === 0 && (
        <div className="text-center py-12">
          <CalendarIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <div className="text-gray-500 text-lg font-medium">No activities found</div>
          <div className="text-gray-400 text-sm mt-1">Create your first activity or adjust your filters.</div>
        </div>
      )}
    </div>
  );
};
