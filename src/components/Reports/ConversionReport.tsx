import React from 'react';
import { Target, TrendingUp, Users, Percent, AlertCircle, Info } from 'lucide-react';
import { ConversionRate } from '../../types';

interface ConversionReportProps {
  data: ConversionRate[];
  isLoading: boolean;
  error: string | null;
}

export const ConversionReport: React.FC<ConversionReportProps> = ({ data, isLoading, error }) => {
  if (isLoading) {
    return <div className="p-4 text-center">Loading conversion rate data...</div>;
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
        No conversion rate data available for the selected period or filters.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Conversion Rate Report</h2>

      <div className="overflow-x-auto bg-white rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Period
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stage From
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stage To
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Conversion Count
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total From Stage
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rate (%)
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created At
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.period}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{item.stage_from}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{item.stage_to}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{item.conversion_count}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{item.total_count_from_stage}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-semibold">
                  {item.rate.toFixed(2)}%
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(item.created_at).toLocaleDateString()}
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
            <strong>Note:</strong> This report displays a table of conversion rate records.
            The original UI with funnel visualizations, source breakdowns, and trend charts can be reintegrated
            by processing the fetched `ConversionRate[]` data or by fetching more specialized data
            for those visualizations.
          </p>
        </div>
      </div>
    </div>
  );
};