import React, { useEffect, useState } from 'react';
import { MetricCard } from './MetricCard';
import { ActivityFeed } from './ActivityFeed';
import { PipelineChart } from './PipelineChart';
import { LeadSourceChart } from './LeadSourceChart';
import { dashboardService, DashboardMetrics, LeadSourceDataPoint, PipelineStageDataPoint, TopOpportunity } from '../../services/dashboardService';
import { Activity } from '../../types';
import { Users, Target, DollarSign, TrendingUp, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';

export const Dashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [leadSourceData, setLeadSourceData] = useState<LeadSourceDataPoint[]>([]);
  const [pipelineData, setPipelineData] = useState<PipelineStageDataPoint[]>([]);
  const [activityFeed, setActivityFeed] = useState<Activity[]>([]);
  const [topOpportunities, setTopOpportunities] = useState<TopOpportunity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Fetch all data in parallel
        const [
          metricsData,
          leadSourceResult,
          pipelineResult,
          activityResult,
          topOppsResult
        ] = await Promise.all([
          dashboardService.getDashboardMetrics(),
          dashboardService.getLeadSourceData(),
          dashboardService.getPipelineData(),
          dashboardService.getActivityFeedData(),
          dashboardService.getTopOpportunities()
        ]);

        setMetrics(metricsData);
        setLeadSourceData(leadSourceResult);
        setPipelineData(pipelineResult);
        setActivityFeed(activityResult);
        setTopOpportunities(topOppsResult);

      } catch (err: any) {
        const errorMessage = err.message || "Failed to load dashboard data.";
        setError(errorMessage);
        toast.error(errorMessage);
        console.error("Dashboard fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto text-center">
        <div className="text-2xl font-semibold">Loading Dashboard...</div>
        {/* You could add a spinner icon here */}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-7xl mx-auto text-center text-red-500">
        <AlertCircle className="w-12 h-12 mx-auto mb-4" />
        <div className="text-2xl font-semibold">Error Loading Dashboard</div>
        <p>{error}</p>
      </div>
    );
  }

  // Default values for metrics if null, to prevent render errors before data loads or if fetch fails partially
  const displayMetrics = metrics || {
    totalLeads: 0,
    totalOpportunities: 0,
    activeOpportunities: 0,
    totalRevenue: 0,
    avgDealSize: 0,
    conversionRate: 0,
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome back! Here's what's happening with your sales.</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Total Leads"
          value={displayMetrics.totalLeads}
          // change={8.2} // TODO: Calculate change if needed
          icon={Users}
          color="blue"
        />
        <MetricCard
          title="Active Opportunities" // Changed from "Opportunities" to be more specific
          value={displayMetrics.activeOpportunities}
          // change={12.5} // TODO: Calculate change
          icon={Target}
          color="purple"
        />
        <MetricCard
          title="Total Revenue"
          value={`$${(displayMetrics.totalRevenue / 1000).toFixed(0)}K`}
          // change={displayMetrics.monthlyGrowth} // monthlyGrowth not in current DashboardMetrics
          icon={DollarSign}
          color="green"
        />
        <MetricCard
          title="Conversion Rate"
          value={`${displayMetrics.conversionRate.toFixed(1)}%`}
          // change={3.1} // TODO: Calculate change
          icon={TrendingUp}
          color="orange"
        />
      </div>

      {/* Charts and Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <PipelineChart data={pipelineData} /> {/* Pass dynamic data */}
        </div>
        <div>
          <LeadSourceChart data={leadSourceData} /> {/* Pass dynamic data */}
        </div>
      </div>

      {/* Recent Activity & Top Opportunities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ActivityFeed activities={activityFeed} /> {/* Pass dynamic data */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Opportunities</h3>
          <div className="space-y-4">
            {topOpportunities.length > 0 ? topOpportunities.map((opp) => (
              <div key={opp.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{opp.name}</p>
                  <p className="text-sm text-gray-600">
                    {opp.stage} • {opp.probability !== undefined ? `${opp.probability}% prob.` : ''}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">${(opp.value / 1000).toFixed(0)}K</p>
                </div>
              </div>
            )) : (
              <p className="text-sm text-gray-500">No top opportunities to display.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};