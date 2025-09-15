import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../api/api';
import { DashboardData } from '../../api/dashboard.api';

export const useDashboard = () => {
  const [timeRange, setTimeRange] = useState<string>('6m');

  const { data, isLoading, error } = useQuery<DashboardData>({
    queryKey: ['dashboard', timeRange],
    queryFn: () => api.dashboardApi.getDashboardData(timeRange)
  });

  return {
    incomeData: data?.incomeData || [],
    occupancyData: data?.occupancyData || [],
    paymentStatusData: data?.paymentStatusData || [],
    monthlyComparisonData: data?.monthlyComparisonData || [],
    timeRange,
    setTimeRange,
    loading: isLoading,
    error
  };
};