import React from 'react';
import { Users, TrendingUp, AlertCircle, Info, Globe } from 'lucide-react';
import { LeadAnalysisData } from '../../types';

interface LeadsReportProps {
  data: LeadAnalysisData[];
  isLoading: boolean;
  error: string | null;
}

export const LeadsReport: React.FC<LeadsReportProps> = ({ data, isLoading, error }) => {
  if (isLoading) {
    return <div className="p-4 text-center">Loading lead analysis data...</div>;
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
        No lead analysis data available for the selected period or filters.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Lead Analysis</h2>

      <div className="overflow-x-auto bg-white rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Lead Name
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Source
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Score
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Conversion Time (Days)
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created At
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((lead) => (
              <tr key={lead.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {lead.lead_name || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {lead.lead_email || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{lead.source}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    lead.status === 'converted' ? 'bg-green-100 text-green-800' :
                    lead.status === 'qualified' ? 'bg-blue-100 text-blue-800' :
                    lead.status === 'contacted' ? 'bg-yellow-100 text-yellow-800' :
                    lead.status === 'new' ? 'bg-gray-100 text-gray-800' :
                    'bg-red-100 text-red-800' // for 'lost' or other statuses
                  }`}>
                    {lead.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {lead.qualification_score ?? 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {lead.conversion_time_days ?? 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(lead.created_at).toLocaleDateString()}
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
            <strong>Note:</strong> This report displays a table of lead analysis records.
            The original UI with charts (Lead Sources, Funnel, Source Performance) can be reintegrated
            by processing the fetched `LeadAnalysisData[]` or by fetching aggregated data specifically for those charts.
            Lead names and emails are shown if available from the backend (e.g. via joins).
          </p>
        </div>
      </div>
    </div>
  );
};