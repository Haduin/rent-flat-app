import {useEffect, useState} from "react";
import {ProgressSpinner} from 'primereact/progressspinner';
import {Button} from "primereact/button";
import {OperationalExpense} from "../../components/commons/types.ts";
import {ExpensesTable} from "./expenses-view.table.tsx";
import {api} from "../../api/api.ts";

export default function ExpensesView() {
    const [items, setItems] = useState<OperationalExpense[]>([]);
    const [loading, setLoading] = useState(false);
    const [apartmentId, setApartmentId] = useState<string>("");
    const [roomId, setRoomId] = useState<string>("");
    const [yearMonth, setYearMonth] = useState<string>(() => {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    });

    const fetchData = async () => {
        try {
            setLoading(true);
            const apt = apartmentId ? Number(apartmentId) : undefined;
            const room = roomId ? Number(roomId) : undefined;
            const data = await api.expensesApi.fetchExpenses(apt, room);
            setItems(data);
        } catch (e) {
            console.error(e);
            alert('Nie udało się pobrać wydatków');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const onDelete = async (id: number) => {
        if (!confirm('Czy na pewno chcesz usunąć ten wydatek?')) return;
        try {
            await api.expensesApi.deleteExpense(id);
            await fetchData();
        } catch (e) {
            console.error(e);
            alert('Nie udało się usunąć wydatku');
        }
    };

    const startEdit = () => {
        alert('Edycja wydatku nie jest jeszcze dostępna.');
    };

    const generateMonthly = async () => {
        try {
            setLoading(true);
            const res = await api.expenseTemplatesApi.generate(yearMonth);
            await fetchData();
            alert(`Utworzono ${res.created} płatności dla ${yearMonth}.`);
        } catch (e) {
            console.error(e);
            alert('Nie udało się wygenerować miesięcznych płatności');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4">
            <h2 className="text-xl font-semibold mb-3">Wydatki operacyjne</h2>

            {/* Filters */}
            <div className="flex gap-2 items-end flex-wrap mb-4">
                <div>
                    <label className="block text-sm">ID mieszkania</label>
                    <input
                        type="number"
                        value={apartmentId}
                        onChange={e => setApartmentId(e.target.value)}
                        className="border p-2 rounded min-w-[160px]"
                        placeholder="np. 1"
                    />
                </div>
                <div>
                    <label className="block text-sm">ID pokoju</label>
                    <input
                        type="number"
                        value={roomId}
                        onChange={e => setRoomId(e.target.value)}
                        className="border p-2 rounded min-w-[160px]"
                        placeholder="opcjonalnie"
                    />
                </div>
                <Button
                    className="p-button-raised"
                    onClick={fetchData}
                    label="Filtruj"
                />
                <div className="ml-auto flex items-end gap-2">
                    <div>
                        <label className="block text-sm">Miesiąc</label>
                        <input
                            type="month"
                            value={yearMonth}
                            onChange={e => setYearMonth(e.target.value)}
                            className="border p-2 rounded min-w-[160px]"
                        />
                    </div>
                    <Button
                        className="p-button-raised"
                        onClick={generateMonthly}
                        label="Wygeneruj miesięczne płatności"
                        icon="pi pi-refresh"
                    />
                </div>
            </div>

            {loading ? (
                <div className="flex justify-content-center">
                    <ProgressSpinner/>
                </div>
            ) : (
                <div className="p-2">
                    <ExpensesTable
                        items={items}
                        loading={loading}
                        onEdit={startEdit as any}
                        onDelete={onDelete}
                    />
                </div>
            )}
        </div>
    );
}
