import React, { useState } from 'react';
import { Chart } from 'primereact/chart';
import { Dropdown } from 'primereact/dropdown';
import { PaymentStatusDataPoint } from '../../../api/dashboard.api';

interface PaymentStatusChartProps {
  data: PaymentStatusDataPoint[];
}

export const PaymentStatusChart: React.FC<PaymentStatusChartProps> = ({ data }) => {
  const [selectedMonth, setSelectedMonth] = useState<string>(
    data.length > 0 ? data[data.length - 1].month : ''
  );

  const monthOptions = data.map(item => ({
    label: item.month,
    value: item.month
  }));

  const selectedData = data.find(item => item.month === selectedMonth)?.statusData || [];

  const statusColors = {
    'PAID': { backgroundColor: 'rgba(75, 192, 192, 0.6)', borderColor: 'rgb(75, 192, 192)' },
    'PENDING': { backgroundColor: 'rgba(255, 159, 64, 0.6)', borderColor: 'rgb(255, 159, 64)' },
    'LATE': { backgroundColor: 'rgba(255, 99, 132, 0.6)', borderColor: 'rgb(255, 99, 132)' },
    'CANCELLED': { backgroundColor: 'rgba(201, 203, 207, 0.6)', borderColor: 'rgb(201, 203, 207)' }
  };

  const statusLabels = {
    'PAID': 'Zapłacone',
    'PENDING': 'Oczekujące',
    'LATE': 'Opóźnione',
    'CANCELLED': 'Anulowane'
  };

  const chartData = {
    labels: selectedData.map(item => statusLabels[item.status as keyof typeof statusLabels] || item.status),
    datasets: [
      {
        data: selectedData.map(item => item.amount),
        backgroundColor: selectedData.map(item => 
          statusColors[item.status as keyof typeof statusColors]?.backgroundColor || 'rgba(0, 0, 0, 0.2)'
        ),
        borderColor: selectedData.map(item => 
          statusColors[item.status as keyof typeof statusColors]?.borderColor || 'rgb(0, 0, 0)'
        ),
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          font: {
            size: 14
          }
        }
      },
      tooltip: {
        callbacks: {
          label: function(context: { parsed: number; dataIndex: number }) {
            const item = selectedData[context.dataIndex];
            const total = selectedData.reduce((sum, item) => sum + item.amount, 0);
            const percentage = total > 0 ? Math.round((item.amount / total) * 100) : 0;
            return `${item.amount.toFixed(2)} zł (${percentage}%) - ${item.count} płatności`;
          }
        }
      }
    }
  };

  return (
    <div className="card">
      <div className="flex justify-content-end mb-3">
        <Dropdown
          value={selectedMonth}
          options={monthOptions}
          onChange={(e) => setSelectedMonth(e.value)}
          placeholder="Wybierz miesiąc"
        />
      </div>
      <Chart type="pie" data={chartData} options={options} className="h-20rem" />
    </div>
  );
};
