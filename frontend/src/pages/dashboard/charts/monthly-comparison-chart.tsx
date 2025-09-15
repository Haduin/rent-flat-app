import React from 'react';
import { Chart } from 'primereact/chart';
import { MonthlyComparisonDataPoint } from '../../../api/dashboard.api';

interface MonthlyComparisonChartProps {
  data: MonthlyComparisonDataPoint[];
}

export const MonthlyComparisonChart: React.FC<MonthlyComparisonChartProps> = ({ data }) => {
  const chartData = {
    labels: data.map(item => item.month),
    datasets: [
      {
        type: 'bar',
        label: 'Przychód',
        backgroundColor: 'rgba(66, 165, 245, 0.6)',
        data: data.map(item => item.income),
        borderColor: 'rgb(66, 165, 245)',
        borderWidth: 2
      },
      {
        type: 'line',
        label: 'Zmiana %',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgb(255, 99, 132)',
        borderWidth: 2,
        fill: false,
        data: data.map(item => item.change),
        yAxisID: 'y1'
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          font: {
            size: 14
          }
        }
      },
      tooltip: {
        callbacks: {
          label: function(context: { dataset: { label: string; yAxisID?: string }; parsed: { y: number } }) {
            if (context.dataset.yAxisID === 'y1') {
              return `${context.dataset.label}: ${context.parsed.y.toFixed(2)}%`;
            }
            return `${context.dataset.label}: ${context.parsed.y.toFixed(2)} zł`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Przychód (zł)'
        },
        ticks: {
          callback: function(value: number) {
            return value + ' zł';
          }
        }
      },
      y1: {
        position: 'right' as const,
        title: {
          display: true,
          text: 'Zmiana (%)'
        },
        ticks: {
          callback: function(value: number) {
            return value + '%';
          }
        },
        grid: {
          drawOnChartArea: false
        }
      }
    }
  };

  return (
    <div className="card">
      <Chart type="bar" data={chartData} options={options} />
    </div>
  );
};