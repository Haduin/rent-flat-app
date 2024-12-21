import React, {useEffect, useState} from "react";
import {Column} from "primereact/column";
import {DataTable} from "primereact/datatable";
import {Button} from "primereact/button";

interface User {
    id: number;
    name: string;
    surname: string;
}

const OsobyTabela: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        // Fetch users from the API
        const fetchUsers = async () => {
            setLoading(true);
            try {
                const response = await fetch('http://localhost:8080/osoby'); // Replace with your API endpoint
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                const data: User[] = await response.json();

                setUsers(data);
            } catch (error) {
                console.error('Error fetching users:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    const actionBodyTemplate = () => {
        return (
            <Button
                label="Delete"
                icon="pi pi-trash"
                className="p-button-danger"
            />
        );
    };

    return (
        <div className="datatable-responsive">
            <h2>Lista użytkowników</h2>
            <DataTable
                value={users}
                paginator
                rows={10}
                loading={loading}
                emptyMessage="Brak użytkowników do wyświetlenia."
            >
                <Column field="id" header="ID" style={{width: '10%'}}></Column>
                <Column field="name" header="Imię" style={{width: '30%'}}></Column>
                <Column field="surname" header="Nazwisko" style={{width: '30%'}}></Column>
                <Column
                    header="Akcje"
                    body={actionBodyTemplate}
                    style={{width: '30%'}}
                ></Column>
            </DataTable>
        </div>
    );
};
export default OsobyTabela;