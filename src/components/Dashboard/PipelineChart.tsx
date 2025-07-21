import React from 'react';
import { PipelineStageDataPoint } from '../../services/dashboardService';
import { Opportunity } from '../../types'; // For Opportunity['stage'] type

interface PipelineChartProps {
  data: PipelineStageDataPoint[];
}

// Define a mapping for colors or use a utility function
const stageColors: { [key in Opportunity['stage']]: string } = {
  prospecting: 'bg-blue-500',
  qualification: 'bg-indigo-500',
  proposal: 'bg-purple-500',
  negotiation: 'bg-pink-500',
  'closed-won': 'bg-green-500',
  'closed-lost': 'bg-red-500', // Added for completeness, though not always shown in pipeline value
};

const getStageColor = (stage: Opportunity['stage']): string => {
  return stageColors[stage] || 'bg-gray-500'; // Fallback color
};

// Define a specific order for pipeline stages if not inherently sorted by the data
const STAGE_ORDER: Opportunity['stage'][] = [
  'prospecting',
  'qualification',
  'proposal',
  'negotiation',
  'closed-won',
  'closed-lost', // Optional: include if you want to show lost deals in the pipeline context
];


export const PipelineChart: React.FC<PipelineChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Sales Pipeline</h3>
        <p className="text-sm text-gray-500">No pipeline data available.</p>
      </div>
    );
  }

  // Sort data according to predefined stage order
  const sortedData = data.sort((a, b) => {
    return STAGE_ORDER.indexOf(a.stage) - STAGE_ORDER.indexOf(b.stage);
  });

  const maxValue = Math.max(...sortedData.map(item => item.value), 0); // Ensure maxValue is not negative if all values are 0

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Sales Pipeline</h3>
      <div className="space-y-4">
        {sortedData.map((item, index) => (
          // Filter out stages you don't want to display, e.g., 'closed-lost' from value pipeline
          (item.stage !== 'closed-lost' || item.value > 0) && ( // Example: only show closed-lost if it has value or always hide
            <div key={index} className="flex items-center space-x-4">
              <div className="w-28 text-sm font-medium text-gray-700 capitalize">{item.stage.replace('-', ' ')}</div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-600">{item.count} opportunities</span>
                  <span className="text-sm font-medium text-gray-900">
                    ${(item.value / 1000).toFixed(0)}K
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5"> {/* Increased height slightly */}
                  <div
                    className={`h-2.5 rounded-full ${getStageColor(item.stage)}`}
                    style={{ width: maxValue > 0 ? `${(item.value / maxValue) * 100}%` : '0%' }}
                  ></div>
                </div>
              </div>
            </div>
          )
        ))}
      </div>
    </div>
  );
};