import React from 'react';
import { Calendar, Phone, Mail, Users, AlertCircle, Info, CheckCircle, XCircle, Clock } from 'lucide-react';
import { ActivityReportData } from '../../types';

interface ActivityReportProps {
  data: ActivityReportData[];
  isLoading: boolean;
  error: string | null;
}

export const ActivityReport: React.FC<ActivityReportProps> = ({ data, isLoading, error }) => {
  if (isLoading) {
    return <div className="p-4 text-center">Loading activity report data...</div>;
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-600 flex items-center justify-center">
        <AlertCircle className="w-5 h-5 mr-2" />
        Error: {error}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500 flex items-center justify-center">
        <Info className="w-5 h-5 mr-2" />
        No activity data available for the selected period or filters.
      </div>
    );
  }

  const getActivityIcon = (type: ActivityReportData['type']) => {
    switch (type) {
      case 'call': return <Phone className="w-4 h-4 text-blue-600" />;
      case 'email': return <Mail className="w-4 h-4 text-green-600" />;
      case 'meeting': return <Users className="w-4 h-4 text-purple-600" />;
      case 'task': return <CheckCircle className="w-4 h-4 text-orange-600" />; // Assuming task is a type
      default: return <Calendar className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusIcon = (status: ActivityReportData['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'overdue': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <Info className="w-4 h-4 text-gray-500" />;
    }
  };


  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Activity Report</h2>

      <div className="overflow-x-auto bg-white rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Title
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Duration (min)
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created At
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((activity) => (
              <tr key={activity.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {activity.activity_title || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  <div className="flex items-center space-x-2">
                    {activity.type && getActivityIcon(activity.type)}
                    <span>{activity.type ? activity.type.charAt(0).toUpperCase() + activity.type.slice(1) : 'N/A'}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                   <div className="flex items-center space-x-2">
                    {activity.status && getStatusIcon(activity.status)}
                    <span>{activity.status ? activity.status.charAt(0).toUpperCase() + activity.status.slice(1) : 'N/A'}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {activity.user_name || activity.completed_by_user_id || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {activity.duration_minutes ?? 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(activity.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700">
        <div className="flex items-center">
          <Info className="w-5 h-5 mr-2" />
          <p>
            <strong>Note:</strong> This report displays a table of activity records.
            The original UI with charts (Breakdown, Trend, Team Performance, Heatmap) can be reintegrated
            by processing the fetched `ActivityReportData[]` or by fetching aggregated data specifically for those charts.
            Activity titles and user names are shown if available from the backend (e.g. via joins).
          </p>
        </div>
      </div>
    </div>
  );
};