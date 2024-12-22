import React, {useEffect, useState} from 'react';
import {DataTable} from 'primereact/datatable';
import {Column} from 'primereact/column';
import {ProgressSpinner} from 'primereact/progressspinner';
import {apiClient} from "../config/apiClient.ts";


// Struktura danych płatności
interface Payment {
    id: number,
    contractId: number,
    dueDate: string,
    payedDate: string,
    amount: number,
    status: string
}

const PaymentsView: React.FC = () => {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState<boolean>(true);


    const fetchPayments = async () => {
        try {
            const response = await apiClient.get<Payment[]>('/payments'); // Zakładając, że endpoint API to '/payments'
            setPayments(response.data);
        } catch (error) {
            console.error("Błąd podczas pobierania danych płatności:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPayments();
    }, []);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pl-PL', {
            style: 'currency',
            currency: 'PLN',
        }).format(value);
    };

    return (
        <div className="card">
            <h2 className="text-center">Historia Płatności</h2>

            {loading ? (
                <div className="flex justify-content-center">
                    <ProgressSpinner/>
                </div>
            ) : (
                <DataTable value={payments} paginator rows={10} stripedRows>
                    <Column field="id" header="ID" style={{width: '10%'}}></Column>
                    <Column field="payerName" header="Płatnik" style={{width: '30%'}}
                            body={(rowData: Payment) => rowData.status}>
                    </Column>
                    <Column
                        field="amount"
                        header="Kwota"
                        body={(rowData: Payment) => formatCurrency(rowData.amount)}
                        style={{width: '20%'}}
                    ></Column>
                    <Column
                        field="date"
                        header="Data"
                        body={(rowData: Payment) => rowData.dueDate}
                        style={{width: '20%'}}
                    ></Column>
                    <Column field="paymentMethod" header="Metoda płatności" style={{width: '20%'}}></Column>
                </DataTable>
            )}
        </div>
    );
};

export default PaymentsView;