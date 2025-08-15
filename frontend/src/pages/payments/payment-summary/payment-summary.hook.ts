import { useQuery } from "@tanstack/react-query";
import { api } from "../../../api/api.ts";
import { PaymentSummary } from "../../../components/commons/types.ts";

export const usePaymentSummary = () => {
    const {
        data: paymentSummaries,
        isLoading: loading,
        error
    } = useQuery<PaymentSummary[]>({
        queryKey: ['paymentSummaries'],
        queryFn: () => api.paymentsApi.getPaymentSummaries(),
    });

    // Calculate total amounts for all persons
    const totalPaid = paymentSummaries?.reduce((sum, summary) => sum + summary.totalPaid, 0) || 0;
    const totalPending = paymentSummaries?.reduce((sum, summary) => sum + summary.totalPending, 0) || 0;
    const totalLate = paymentSummaries?.reduce((sum, summary) => sum + summary.totalLate, 0) || 0;
    const totalCancelled = paymentSummaries?.reduce((sum, summary) => sum + summary.totalCancelled, 0) || 0;
    
    // Prepare data for charts
    const pieChartData = {
        labels: ['Zapłacone', 'Oczekujące', 'Spóźnione', 'Anulowane'],
        datasets: [
            {
                data: [totalPaid, totalPending, totalLate, totalCancelled],
                backgroundColor: ['#36A2EB', '#FFCE56', '#FF6384', '#4BC0C0'],
                hoverBackgroundColor: ['#36A2EB', '#FFCE56', '#FF6384', '#4BC0C0']
            }
        ]
    };
    
    // Prepare data for bar chart (by person)
    const barChartData = {
        labels: paymentSummaries?.map(summary => `${summary.firstName} ${summary.lastName}`) || [],
        datasets: [
            {
                label: 'Zapłacone',
                backgroundColor: '#36A2EB',
                data: paymentSummaries?.map(summary => summary.totalPaid) || []
            },
            {
                label: 'Oczekujące',
                backgroundColor: '#FFCE56',
                data: paymentSummaries?.map(summary => summary.totalPending) || []
            },
            {
                label: 'Spóźnione',
                backgroundColor: '#FF6384',
                data: paymentSummaries?.map(summary => summary.totalLate) || []
            },
            {
                label: 'Anulowane',
                backgroundColor: '#4BC0C0',
                data: paymentSummaries?.map(summary => summary.totalCancelled) || []
            }
        ]
    };

    return {
        paymentSummaries,
        loading,
        error,
        pieChartData,
        barChartData,
        totalPaid,
        totalPending,
        totalLate,
        totalCancelled
    };
};