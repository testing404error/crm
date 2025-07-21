import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify'; // Assuming react-hot-toast is used or will be added
import { SalesReport } from './SalesReport';
import { LeadsReport } from './LeadsReport';
import { ActivityReport } from './ActivityReport';
import { TeamPerformanceReport } from './TeamPerformanceReport';
import { RevenueReport } from './RevenueReport';
import { ConversionReport } from './ConversionReport';
// import { CustomReport } from './CustomReport'; // Custom Report component import IS NOW COMMENTED OUT
import { ReportFilters } from './ReportFilters';
import { ExportModal } from '../Common/ExportModal';
import { Pagination } from '../Common/Pagination'; // Assuming a Pagination component exists
import { reportService, ReportFilters as ReportFilterType } from '../../services/reportService';
import { ReportData, SalesOverview, LeadAnalysisData, ActivityReportData, TeamPerformance, RevenueData, ConversionRate } from '../../types';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Calendar, 
  DollarSign, 
  Target,
  // FileText, // Commented out as Custom Reports are disabled
  Download,
  Filter,
  RefreshCw
} from 'lucide-react';

const reportTabs = [
  { id: 'sales', label: 'Sales Overview', icon: BarChart3 },
  { id: 'leads', label: 'Leads Analysis', icon: Users },
  { id: 'activities', label: 'Activities', icon: Calendar },
  { id: 'team', label: 'Team Performance', icon: Target },
  { id: 'revenue', label: 'Revenue', icon: DollarSign },
  { id: 'conversion', label: 'Conversion', icon: TrendingUp },
  // { id: 'custom', label: 'Custom Reports', icon: FileText } // Custom reports tab IS NOW COMMENTED OUT
];

const ITEMS_PER_PAGE = 10;

export const ReportsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('sales');
  const [reportData, setReportData] = useState<ReportData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [filters, setFilters] = useState<ReportFilterType>({
    dateRange: {
      startDate: new Date(new Date().getFullYear(), new Date().getMonth() - 3, 1).toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
    },
    team: '',
    assignedTo: '',
    source: '',
    stage: '',
  });

  const fetchReportData = useCallback(async () => {
    setIsLoading(true);
    setIsRefreshing(true);
    setError(null);
    try {
      let result: { data: ReportData[]; total: number } | undefined;
      const currentFilters = { ...filters, dateRange: filters.dateRange };

      switch (activeTab) {
        case 'sales':
          result = await reportService.getSalesOverview(currentPage, currentFilters);
          break;
        case 'leads':
          result = await reportService.getLeadAnalysis(currentPage, currentFilters);
          break;
        case 'activities':
          result = await reportService.getActivitiesReport(currentPage, currentFilters);
          break;
        case 'team':
          result = await reportService.getTeamPerformance(currentPage, currentFilters);
          break;
        case 'revenue':
          result = await reportService.getRevenueReport(currentPage, currentFilters);
          break;
        case 'conversion':
          result = await reportService.getConversionReport(currentPage, currentFilters);
          break;
        default:
          // This toast might be problematic if called during initial render before root toast provider is ready
          // Consider logging to console or setting an error state instead if it causes issues.
          // toast.error('Invalid report tab selected');
          console.error('Invalid report tab selected');
          result = { data: [], total: 0 };
      }

      if (result) {
        setReportData(result.data);
        setTotalItems(result.total);
      }

    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch report data.';
      setError(errorMessage);
      // This toast might also be problematic if called during initial render.
      // toast.error(errorMessage);
      console.error(errorMessage, err);
      setReportData([]);
      setTotalItems(0);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [activeTab, currentPage, filters]);

  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);

  useEffect(() => {
    let subscription: { unsubscribe: () => void } | undefined;

    let tableNameToSubscribe: string | undefined;
    switch (activeTab) {
      case 'sales': tableNameToSubscribe = 'opportunities'; break;
      case 'leads': tableNameToSubscribe = 'leads'; break;
      case 'activities': tableNameToSubscribe = 'activities'; break;
      case 'team': tableNameToSubscribe = 'opportunities'; break; // Also activities, but we can only subscribe to one
      case 'revenue': tableNameToSubscribe = 'opportunities'; break;
      case 'conversion': tableNameToSubscribe = 'opportunities'; break;
    }

    if (tableNameToSubscribe) {
      subscription = reportService.subscribeToReportUpdates(tableNameToSubscribe, (payload) => {
        console.log('Real-time update received for', tableNameToSubscribe, payload);
        toast.success(`Data for ${activeTab} updated. Refreshing...`);
        fetchReportData();
      });
    }

    return () => {
      subscription?.unsubscribe();
    };
  }, [activeTab, fetchReportData]);


  const handleRefresh = () => {
    toast.loading('Refreshing data...', { id: 'refresh-toast' });
    fetchReportData().finally(() => {
      toast.dismiss('refresh-toast');
      toast.success('Data refreshed!');
    });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleFiltersChange = (newFilters: ReportFilterType) => {
    setFilters(prevFilters => ({ ...prevFilters, ...newFilters }));
    setCurrentPage(1);
  };

  const handleApplyFiltersInModal = (appliedFiltersFromModal: ReportFilterType) => {
    setFilters(appliedFiltersFromModal);
    setCurrentPage(1);
    setShowFiltersModal(false);
  };


  const renderTabContent = () => {
    const commonProps = {
      data: reportData,
      isLoading,
      error,
    };
    
    switch (activeTab) {
      case 'sales':
        return <SalesReport {...commonProps} data={reportData as SalesOverview[]} />;
      case 'leads':
        return <LeadsReport {...commonProps} data={reportData as LeadAnalysisData[]} />;
      case 'activities':
        return <ActivityReport {...commonProps} data={reportData as ActivityReportData[]} />;
      case 'team':
        return <TeamPerformanceReport {...commonProps} data={reportData as TeamPerformance[]} />;
      case 'revenue':
        return <RevenueReport {...commonProps} data={reportData as RevenueData[]} />;
      case 'conversion':
        return <ConversionReport {...commonProps} data={reportData as ConversionRate[]} />;
      default:
        return <div className="text-center p-4">Select a report tab to view data.</div>;
    }
  };

  const getExportData = (): any[] => {
    // Removed toast.error from here to prevent side effects during render
    if (!reportData || reportData.length === 0) {
      return [];
    }
    return reportData;
  };


  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600 mt-2">Comprehensive insights into your sales performance</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowFiltersModal(true)}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
          </button>
          <button
            onClick={() => {
              if (!reportData || reportData.length === 0) {
                toast.error("No data available to export.");
              } else {
                setShowExportModal(true);
              }
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Date Range</h3>
          <div className="flex items-center space-x-4">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">From</label>
              <input
                id="startDate"
                type="date"
                value={filters.dateRange?.startDate || ''}
                onChange={(e) => handleFiltersChange({
                  ...filters,
                  dateRange: { ...(filters.dateRange || {}), startDate: e.target.value }
                })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">To</label>
              <input
                id="endDate"
                type="date"
                value={filters.dateRange?.endDate || ''}
                onChange={(e) => handleFiltersChange({
                  ...filters,
                  dateRange: { ...(filters.dateRange || {}), endDate: e.target.value }
                })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex space-x-2 mt-6">
              <button
                onClick={() => {
                  const today = new Date();
                  const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
                  const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
                  handleFiltersChange({
                    ...filters,
                    dateRange: {
                      startDate: lastMonthStart.toISOString().split('T')[0],
                      endDate: lastMonthEnd.toISOString().split('T')[0]
                    }
                  });
                }}
                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
              >
                Last Month
              </button>
              <button
                onClick={() => {
                  const today = new Date();
                  const quarterStart = new Date(today.getFullYear(), Math.floor(today.getMonth() / 3) * 3 - 3, 1);
                  const quarterEnd = new Date(quarterStart.getFullYear(), quarterStart.getMonth() + 3, 0);
                  handleFiltersChange({
                    ...filters,
                    dateRange: {
                      startDate: quarterStart.toISOString().split('T')[0],
                      endDate: quarterEnd.toISOString().split('T')[0]
                    }
                  });
                }}
                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
              >
                Last Quarter
              </button>
              <button
                onClick={() => {
                  const today = new Date();
                  const lastYearStart = new Date(today.getFullYear() - 1, 0, 1);
                  const lastYearEnd = new Date(today.getFullYear() - 1, 11, 31);
                  handleFiltersChange({
                    ...filters,
                    dateRange: {
                      startDate: lastYearStart.toISOString().split('T')[0],
                      endDate: lastYearEnd.toISOString().split('T')[0]
                    }
                  });
                }}
                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
              >
                Last Year
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {reportTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setCurrentPage(1);
                  }}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {isLoading && <div className="text-center p-4">Loading report data...</div>}
          {!isLoading && error && <div className="text-center p-4 text-red-500">Error: {error}</div>}
          {!isLoading && !error && reportData.length === 0 && <div className="text-center p-4">No data available for this report.</div>}
          {!isLoading && !error && reportData.length > 0 && renderTabContent()}
        </div>

        {!isLoading && !error && reportData.length > 0 && totalItems > ITEMS_PER_PAGE && (
          <div className="p-4 border-t border-gray-200">
            <Pagination
              currentPage={currentPage}
              totalItems={totalItems}
              itemsPerPage={ITEMS_PER_PAGE}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>

      <ReportFilters
        isOpen={showFiltersModal}
        onClose={() => setShowFiltersModal(false)}
        filters={filters}
        onFiltersChange={handleFiltersChange} // For live updates within modal if any
        onApplyFilters={handleApplyFiltersInModal}
      />

      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        data={getExportData()}
        entityType={`${activeTab}-report`}
        filename={`${activeTab}-report-${filters.dateRange?.startDate}-to-${filters.dateRange?.endDate}`}
      />
    </div>
  );
};