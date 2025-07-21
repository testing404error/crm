import React, { useState } from 'react';
import { Plus, Play, Save, Download, BarChart3, PieChart, LineChart } from 'lucide-react';

interface CustomReportProps {
  dateRange: { startDate: string; endDate: string };
  filters: any;
}

export const CustomReport: React.FC<CustomReportProps> = ({ dateRange, filters }) => {
  const [showBuilder, setShowBuilder] = useState(false);
  const [reportConfig, setReportConfig] = useState({
    name: '',
    description: '',
    dataSource: 'leads',
    chartType: 'bar',
    metrics: [] as string[],
    groupBy: '',
    filters: {} as any
  });

  const savedReports = [
    {
      id: '1',
      name: 'Weekly Sales Performance',
      description: 'Track weekly sales metrics and team performance',
      lastRun: '2024-01-23',
      type: 'bar'
    },
    {
      id: '2',
      name: 'Lead Source Analysis',
      description: 'Analyze lead sources and conversion rates',
      lastRun: '2024-01-22',
      type: 'pie'
    },
    {
      id: '3',
      name: 'Revenue Trend Report',
      description: 'Monthly revenue trends and forecasting',
      lastRun: '2024-01-21',
      type: 'line'
    }
  ];

  const dataSourceOptions = [
    { value: 'leads', label: 'Leads' },
    { value: 'opportunities', label: 'Opportunities' },
    { value: 'customers', label: 'Customers' },
    { value: 'activities', label: 'Activities' }
  ];

  const metricOptions = {
    leads: ['Count', 'Conversion Rate', 'Source', 'Score', 'Status'],
    opportunities: ['Count', 'Value', 'Stage', 'Probability', 'Close Date'],
    customers: ['Count', 'Total Value', 'Language', 'Currency', 'Created Date'],
    activities: ['Count', 'Type', 'Status', 'Assigned To', 'Completion Rate']
  };

  const chartTypeOptions = [
    { value: 'bar', label: 'Bar Chart', icon: BarChart3 },
    { value: 'pie', label: 'Pie Chart', icon: PieChart },
    { value: 'line', label: 'Line Chart', icon: LineChart }
  ];

  const handleMetricToggle = (metric: string) => {
    setReportConfig(prev => ({
      ...prev,
      metrics: prev.metrics.includes(metric)
        ? prev.metrics.filter(m => m !== metric)
        : [...prev.metrics, metric]
    }));
  };

  const handleSaveReport = () => {
    console.log('Saving report:', reportConfig);
    setShowBuilder(false);
  };

  const handleRunReport = (reportId: string) => {
    console.log('Running report:', reportId);
  };

  const getChartIcon = (type: string) => {
    switch (type) {
      case 'bar': return BarChart3;
      case 'pie': return PieChart;
      case 'line': return LineChart;
      default: return BarChart3;
    }
  };

  return (
    <div className="space-y-6">
      {!showBuilder ? (
        <>
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Custom Reports</h3>
              <p className="text-gray-600">Create and manage custom reports</p>
            </div>
            <button
              onClick={() => setShowBuilder(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Create Report</span>
            </button>
          </div>

          {/* Saved Reports */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedReports.map((report) => {
              const ChartIcon = getChartIcon(report.type);
              return (
                <div key={report.id} className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <ChartIcon className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{report.name}</h4>
                        <p className="text-sm text-gray-600">{report.description}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-500 mb-4">
                    Last run: {new Date(report.lastRun).toLocaleDateString()}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleRunReport(report.id)}
                      className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-1"
                    >
                      <Play className="w-4 h-4" />
                      <span>Run</span>
                    </button>
                    <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Insights */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Insights</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">247</div>
                <div className="text-sm text-blue-700">Total Leads</div>
                <div className="text-xs text-blue-600 mt-1">+15% this month</div>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">$892K</div>
                <div className="text-sm text-green-700">Revenue</div>
                <div className="text-xs text-green-600 mt-1">+12% this month</div>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">36.2%</div>
                <div className="text-sm text-purple-700">Conversion Rate</div>
                <div className="text-xs text-purple-600 mt-1">+3% this month</div>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">23</div>
                <div className="text-sm text-orange-700">Active Opportunities</div>
                <div className="text-xs text-orange-600 mt-1">+8% this month</div>
              </div>
            </div>
          </div>
        </>
      ) : (
        /* Report Builder */
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Report Builder</h3>
            <button
              onClick={() => setShowBuilder(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
          </div>

          <div className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Report Name
                </label>
                <input
                  type="text"
                  value={reportConfig.name}
                  onChange={(e) => setReportConfig({ ...reportConfig, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter report name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data Source
                </label>
                <select
                  value={reportConfig.dataSource}
                  onChange={(e) => setReportConfig({ ...reportConfig, dataSource: e.target.value, metrics: [] })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {dataSourceOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={reportConfig.description}
                onChange={(e) => setReportConfig({ ...reportConfig, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Describe what this report shows"
              />
            </div>

            {/* Chart Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chart Type
              </label>
              <div className="grid grid-cols-3 gap-4">
                {chartTypeOptions.map(option => {
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.value}
                      onClick={() => setReportConfig({ ...reportConfig, chartType: option.value })}
                      className={`p-4 border rounded-lg flex flex-col items-center space-y-2 transition-colors ${
                        reportConfig.chartType === option.value
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <Icon className="w-6 h-6" />
                      <span className="text-sm font-medium">{option.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Metrics */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Metrics to Include
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {metricOptions[reportConfig.dataSource as keyof typeof metricOptions]?.map(metric => (
                  <label key={metric} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={reportConfig.metrics.includes(metric)}
                      onChange={() => handleMetricToggle(metric)}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">{metric}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                onClick={() => setShowBuilder(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveReport}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>Save Report</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};