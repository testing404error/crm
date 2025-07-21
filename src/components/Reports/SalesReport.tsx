import React from 'react';
import { DollarSign, TrendingUp, Users, Calendar, AlertCircle, Info } from 'lucide-react';
import { SalesOverview } from '../../types'; // Ensure this type is correctly defined

interface SalesReportProps {
  data: SalesOverview[];
  isLoading: boolean;
  error: string | null;
}

export const SalesReport: React.FC<SalesReportProps> = ({ data, isLoading, error }) => {
  if (isLoading) {
    return <div className="p-4 text-center">Loading sales overview data...</div>;
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
        No sales overview data available for the selected period or filters.
      </div>
    );
  }

  // Example: Displaying a summary of the first data point or aggregated data
  // The current SalesOverview type is a list of records.
  // You might want to aggregate this data or display it as a table.
  // For simplicity, let's display a table of the sales overview records.

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Sales Overview</h2>

      {/* Displaying data in a table format */}
      <div className="overflow-x-auto bg-white rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Period
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Revenue
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                New Customers
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Opportunities Won
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Avg. Deal Size
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
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  ${item.total_revenue.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{item.new_customers}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{item.opportunities_won}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  ${item.average_deal_size.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(item.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/*
        The original SalesReport component had multiple sections (Key Metrics, Pipeline, Top Performers, Revenue Trend).
        To reintegrate these, you would need to:
        1. Ensure your `SalesOverview` data from Supabase contains all necessary fields for these sections.
           This might mean the `sales_overviews` table in Supabase needs to be quite comprehensive, or you
           might fetch data from multiple sources/views for a single "Sales Overview" tab.
        2. Adapt the JSX for those sections to use the dynamic `data` prop.
           For example, `salesMetrics` could be derived from the first item in the `data` array if it's a summary,
           or aggregated if `data` is a list of transactions/events.
        3. If the `SalesOverview` type is just one table among many that contribute to the "Sales Overview" concept,
           you might need to adjust `ReportsPage.tsx` to fetch multiple datasets for this tab or create a
           more complex backend view in Supabase.

        For this iteration, a simple table display of the fetched `SalesOverview[]` data is implemented.
        Further enhancements would involve mapping the rich UI of the original component to the new data structure.
      */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700">
        <div className="flex items-center">
          <Info className="w-5 h-5 mr-2" />
          <p>
            <strong>Note:</strong> This report currently displays a table of sales overview records.
            The original detailed UI with charts and summaries can be reintegrated by ensuring the backend data
            structure (`SalesOverview` type and corresponding Supabase table/view) provides all necessary fields.
          </p>
        </div>
      </div>
    </div>
  );
};