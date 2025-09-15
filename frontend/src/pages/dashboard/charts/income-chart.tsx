import React from 'react';
import { Chart } from 'primereact/chart';
import { IncomeDataPoint } from '../../../api/dashboard.api';

interface IncomeChartProps {
  data: IncomeDataPoint[];
}

export const IncomeChart: React.FC<IncomeChartProps> = ({ data }) => {
  const chartData = {
    labels: data.map(item => item.month),
    datasets: [
      {
        label: 'Oczekiwany przychód',
        data: data.map(item => item.expected),
        fill: false,
        borderColor: '#42A5F5',
        tension: 0.4
      },
      {
        label: 'Otrzymany przychód',
        data: data.map(item => item.received),
        fill: false,
        borderColor: '#66BB6A',
        tension: 0.4
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            size: 14
          }
        }
      },
      tooltip: {
        callbacks: {
          label: function(context: { dataset: { label: string }; parsed: { y: number } }) {
            return `${context.dataset.label}: ${context.parsed.y.toFixed(2)} zł`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: number) {
            return value + ' zł';
          }
        }
      }
    }
  };

  return (
    <div className="card">
      <Chart type="line" data={chartData} options={options} />
    </div>
  );
};
