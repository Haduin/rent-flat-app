import React from 'react';
import { usePaymentSummary } from './payment-summary.hook.ts';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Chart } from 'primereact/chart';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Card } from 'primereact/card';
import { Divider } from 'primereact/divider';

const PaymentSummary: React.FC = () => {
    const {
        paymentSummaries,
        loading,
        error,
        pieChartData,
        barChartData,
        totalPaid,
        totalPending,
        totalLate,
        totalCancelled
    } = usePaymentSummary();

    if (loading) {
        return (
            <div className="flex justify-content-center">
                <ProgressSpinner />
            </div>
        );
    }

    if (error) {
        return <div>Wystąpił błąd podczas ładowania danych: {error.toString()}</div>;
    }

    const chartOptions = {
        plugins: {
            legend: {
                position: 'bottom'
            }
        }
    };

    const formatCurrency = (value: number) => {
        return value.toLocaleString('pl-PL', { style: 'currency', currency: 'PLN' });
    };

    const amountTemplate = (rowData: any, field: string) => {
        return formatCurrency(rowData[field]);
    };

    return (
        <div className="p-4">
            <h2 className="text-2xl font-bold mb-4">Podsumowanie płatności</h2>
            
            <div className="grid">
                <div className="col-12 md:col-6 lg:col-3">
                    <Card title="Zapłacone" className="bg-blue-50">
                        <div className="text-2xl font-bold">{formatCurrency(totalPaid)}</div>
                    </Card>
                </div>
                <div className="col-12 md:col-6 lg:col-3">
                    <Card title="Oczekujące" className="bg-yellow-50">
                        <div className="text-2xl font-bold">{formatCurrency(totalPending)}</div>
                    </Card>
                </div>
                <div className="col-12 md:col-6 lg:col-3">
                    <Card title="Spóźnione" className="bg-red-50">
                        <div className="text-2xl font-bold">{formatCurrency(totalLate)}</div>
                    </Card>
                </div>
                <div className="col-12 md:col-6 lg:col-3">
                    <Card title="Anulowane" className="bg-teal-50">
                        <div className="text-2xl font-bold">{formatCurrency(totalCancelled)}</div>
                    </Card>
                </div>
            </div>

            <Divider />

            <div className="grid">
                <div className="col-12 md:col-6">
                    <h3 className="text-xl font-bold mb-2">Rozkład płatności</h3>
                    <Chart type="pie" data={pieChartData} options={chartOptions} className="w-full" />
                </div>
                <div className="col-12 md:col-6">
                    <h3 className="text-xl font-bold mb-2">Płatności według osób</h3>
                    <Chart type="bar" data={barChartData} options={chartOptions} className="w-full" />
                </div>
            </div>

            <Divider />

            <h3 className="text-xl font-bold mb-2">Szczegóły płatności według osób</h3>
            <DataTable value={paymentSummaries} stripedRows paginator rows={10} rowsPerPageOptions={[5, 10, 25, 50]}>
                <Column field="firstName" header="Imię" sortable />
                <Column field="lastName" header="Nazwisko" sortable />
                <Column field="totalPaid" header="Zapłacone" sortable body={(rowData) => amountTemplate(rowData, 'totalPaid')} />
                <Column field="totalPending" header="Oczekujące" sortable body={(rowData) => amountTemplate(rowData, 'totalPending')} />
                <Column field="totalLate" header="Spóźnione" sortable body={(rowData) => amountTemplate(rowData, 'totalLate')} />
                <Column field="totalCancelled" header="Anulowane" sortable body={(rowData) => amountTemplate(rowData, 'totalCancelled')} />
                <Column field="paymentCount" header="Liczba płatności" sortable />
            </DataTable>
        </div>
    );
};

export default PaymentSummary;