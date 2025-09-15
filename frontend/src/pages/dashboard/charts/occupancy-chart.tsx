import React from 'react';
import { Chart } from 'primereact/chart';
import { OccupancyDataPoint } from '../../../api/dashboard.api';

interface OccupancyChartProps {
  data: OccupancyDataPoint[];
}

export const OccupancyChart: React.FC<OccupancyChartProps> = ({ data }) => {
  const chartData = {
    labels: data.map(item => item.month),
    datasets: [
      {
        label: 'Poziom zajętości (%)',
        data: data.map(item => item.occupancyRate),
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgb(75, 192, 192)',
        borderWidth: 2,
        fill: true
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
          label: function(context: { dataset: { label: string }; parsed: number }) {
            return `${context.dataset.label}: ${context.parsed.toFixed(2)}%`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: function(value: number) {
            return value + '%';
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