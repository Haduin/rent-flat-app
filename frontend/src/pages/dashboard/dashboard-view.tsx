import { useDashboard } from './dashboard-view.hook';
import { IncomeChart } from './charts/income-chart';
import { OccupancyChart } from './charts/occupancy-chart';
import { PaymentStatusChart } from './charts/payment-status-chart';
import { MonthlyComparisonChart } from './charts/monthly-comparison-chart';
import { Card } from 'primereact/card';
import { Dropdown } from 'primereact/dropdown';
import { ProgressSpinner } from 'primereact/progressspinner';

const DashboardView = () => {
  const {
    incomeData,
    occupancyData,
    paymentStatusData,
    monthlyComparisonData,
    timeRange,
    setTimeRange,
    loading,
    error
  } = useDashboard();

  const timeRangeOptions = [
    { label: 'Ostatnie 3 miesiące', value: '3m' },
    { label: 'Ostatnie 6 miesięcy', value: '6m' },
    { label: 'Ostatni rok', value: '1y' }
  ];

  if (loading) {
    return (
      <div className="flex justify-content-center align-items-center h-screen">
        <ProgressSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-content-center align-items-center h-screen">
        <Card title="Błąd" style={{ width: '25rem' }}>
          <p className="m-0">
            Wystąpił błąd podczas ładowania danych. Spróbuj ponownie później.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="dashboard p-4">
      <div className="flex justify-content-between align-items-center mb-4">
        <h2>Dashboard Analityczny</h2>
        <Dropdown 
          value={timeRange} 
          options={timeRangeOptions} 
          onChange={(e) => setTimeRange(e.value)} 
          placeholder="Wybierz zakres czasu" 
        />
      </div>

      <div className="grid">
        <div className="col-12 md:col-6 lg:col-6 mb-4">
          <Card title="Przychody miesięczne">
            <IncomeChart data={incomeData} />
          </Card>
        </div>
        <div className="col-12 md:col-6 lg:col-6 mb-4">
          <Card title="Poziom zajętości">
            <OccupancyChart data={occupancyData} />
          </Card>
        </div>
        <div className="col-12 md:col-6 lg:col-6 mb-4">
          <Card title="Status płatności">
            <PaymentStatusChart data={paymentStatusData} />
          </Card>
        </div>
        <div className="col-12 md:col-6 lg:col-6 mb-4">
          <Card title="Porównanie miesięczne">
            <MonthlyComparisonChart data={monthlyComparisonData} />
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;