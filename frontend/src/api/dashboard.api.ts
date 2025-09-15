import { axiosInstance } from "./api.ts";

export interface IncomeDataPoint {
  month: string;
  expected: number;
  received: number;
}

export interface OccupancyDataPoint {
  month: string;
  totalRooms: number;
  occupiedRooms: number;
  occupancyRate: number;
}

export interface StatusDataPoint {
  status: string;
  count: number;
  amount: number;
}

export interface PaymentStatusDataPoint {
  month: string;
  statusData: StatusDataPoint[];
}

export interface MonthlyComparisonDataPoint {
  month: string;
  income: number;
  previousIncome: number;
  change: number;
}

export interface DashboardData {
  incomeData: IncomeDataPoint[];
  occupancyData: OccupancyDataPoint[];
  paymentStatusData: PaymentStatusDataPoint[];
  monthlyComparisonData: MonthlyComparisonDataPoint[];
}

export const dashboardApi: DashboardApi = {
  getDashboardData: (timeRange: string) => 
    axiosInstance.get(`/dashboard/${timeRange}`).then(response => response.data)
};

export type DashboardApi = {
  getDashboardData: (timeRange: string) => Promise<DashboardData>;
};