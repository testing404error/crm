import React from 'react';
import { DollarSign, TrendingUp, Calendar, Target, AlertCircle, Info } from 'lucide-react';
import { RevenueData } from '../../types';

interface RevenueReportProps {
  data: RevenueData[];
  isLoading: boolean;
  error: string | null;
}

export const RevenueReport: React.FC<RevenueReportProps> = ({ data, isLoading, error }) => {
  if (isLoading) {
    return <div className="p-4 text-center">Loading revenue data...</div>;
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
        No revenue data available for the selected period or filters.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Revenue Report</h2>

      <div className="overflow-x-auto bg-white rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Transaction ID
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Source Type
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Currency
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Transaction Date
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer ID
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Product/Service
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created At
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.transaction_id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{item.source_type}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {item.amount}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{item.currency}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {item.transaction_date ? new Date(item.transaction_date).toLocaleDateString() : 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{item.customer_id || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{item.product_service_name || 'N/A'}</td>
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
            <strong>Note:</strong> This report displays a table of revenue transaction records.
            The original UI with trend charts, source breakdowns, top deals, and forecasts can be reintegrated
            by processing the fetched `RevenueData[]` or by fetching aggregated/specialized data
            for those visualizations.
          </p>
        </div>
      </div>
    </div>
  );
};