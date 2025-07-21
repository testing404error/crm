import React from 'react';
import { LeadSourceDataPoint } from '../../services/dashboardService'; // Import the type

interface LeadSourceChartProps {
  data: LeadSourceDataPoint[];
}

// Define a mapping for colors or use a utility function if you have one
const sourceColors: { [key: string]: string } = {
  Website: 'bg-blue-500',
  Referral: 'bg-green-500',
  'Social Media': 'bg-purple-500',
  Email: 'bg-orange-500',
  Manual: 'bg-gray-500',
  Other: 'bg-pink-500', // Fallback or for other sources
};

const getSourceColor = (source: string): string => {
  return sourceColors[source] || sourceColors.Other;
};

const getStrokeColor = (bgColor: string): string => {
  // Simple conversion from bg-color-500 to color (for SVG stroke)
  return bgColor.replace('bg-', '').split('-')[0];
};

export const LeadSourceChart: React.FC<LeadSourceChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Lead Sources</h3>
        <p className="text-sm text-gray-500">No lead source data available.</p>
      </div>
    );
  }

  const totalLeads = data.reduce((sum, item) => sum + item.count, 0);

  const chartData = data.map(item => ({
    ...item,
    percentage: totalLeads > 0 ? parseFloat(((item.count / totalLeads) * 100).toFixed(1)) : 0,
    color: getSourceColor(item.source),
  }));


  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Lead Sources</h3>
      <div className="space-y-4">
        {chartData.map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
              <span className="text-sm font-medium text-gray-700">{item.source}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">{item.count}</span>
              <span className="text-sm font-medium text-gray-900">{item.percentage}%</span>
            </div>
          </div>
        ))}
      </div>
      
      {/* Simple donut chart representation */}
      {totalLeads > 0 && (
        <div className="mt-6 flex justify-center">
          <div className="relative w-32 h-32">
            <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#e5e7eb" // Background circle
                strokeWidth="10"
              />
              {chartData.map((item, index) => {
                // Calculate offset for this segment
                const previousSegmentsPercentage = chartData
                  .slice(0, index)
                  .reduce((sum, s) => sum + (s.percentage || 0), 0);

                const circumference = 2 * Math.PI * 40; // Radius is 40
                const segmentLength = ((item.percentage || 0) / 100) * circumference;
                const dashOffset = (previousSegmentsPercentage / 100) * circumference;

                return (
                  <circle
                    key={index}
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke={getStrokeColor(item.color)}
                    strokeWidth="10"
                    strokeDasharray={`${segmentLength} ${circumference - segmentLength}`}
                    strokeDashoffset={-dashOffset}
                    className="transition-all duration-300"
                  />
                );
              })}
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{totalLeads}</div>
                <div className="text-xs text-gray-600">Total Leads</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};