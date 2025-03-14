import {useToast} from "../commons/ToastProvider.tsx";
import {useState} from "react";
import {apiClient} from "../../config/apiClient.ts";
import {dateToStringFullYearMouthDay, dateToStringWithYearMonth} from "../commons/dateFormatter.ts";
import {Payment, PaymentConfirmationDTO} from "../commons/types.ts";

export const usePaymentsView = () => {
    const {showToast} = useToast()
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [dateSelected, setDateSelected] = useState<Date>();
    const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
    const [isConfirmationDialogVisible, setIsConfirmationDialogVisible] = useState<boolean>(false);

    const fetchPayments = async (mouth: string) => {
        try {
            setLoading(true);
            const response = await apiClient.get<Payment[]>(`/payments/${mouth}`);
            setPayments(response.data);
            console.log(response.data);
        } catch (error) {
            console.error("Błąd podczas pobierania danych płatności:", error);
        } finally {
            setLoading(false);
        }
    };
    const handleDateSelectAndFetchPayments = async (date: Date) => {
        setDateSelected(date)
        await fetchPayments(dateToStringWithYearMonth(date));
    }

    const handleGenerateNewMonthPayments = async (date: Date) => {
        try {
            setLoading(true);
            await apiClient.post(`/contracts/generateMonthlyPayments`);
            await fetchPayments(dateToStringWithYearMonth(date));
        } catch (error) {
            console.error("Błąd podczas pobierania danych płatności:", error);
        } finally {
            setLoading(false);
        }

    }

    const handleConfirmPayment = async (date: Date, paymentId: number, amount: number) => {
        const request: PaymentConfirmationDTO = {
            paymentId: paymentId,
            paymentDate: dateToStringFullYearMouthDay(date),
            payedAmount: amount
        }
        console.log(request);
        await apiClient.post(`/payments/confirm`, request).then(() => {
            showToast('success', "Pomyślnie potwierdzono płatność")
        }).catch(error => {
            showToast('error', `Nie udało sie potwierdzić płatności: ${error.message}`)
        })

    }

    const closeConfirmationDialog = () => {
        setIsConfirmationDialogVisible(false);
        setSelectedPayment(null);
    }

    const openConfirmationDialog = (payment: Payment) => {
        setIsConfirmationDialogVisible(true);
        setSelectedPayment(payment);
    }

    return {
        loading,
        payments,
        dateSelected,
        selectedPayment,
        isConfirmationDialogVisible,
        handleDateSelectAndFetchPayments,
        openConfirmationDialog,
        closeConfirmationDialog,
        handleConfirmPayment,
        handleGenerateNewMonthPayments
    }
}