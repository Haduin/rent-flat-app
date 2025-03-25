import {useToast} from "../commons/ToastProvider.tsx";
import {useState} from "react";
import {dateToStringWithYearMonth} from "../commons/dateFormatter.ts";
import {Payment, PaymentConfirmationDTO} from "../commons/types.ts";
import {useMutation, useQuery} from "@tanstack/react-query";
import {api} from "../../api/api.ts";
import {queryClient} from "../../main.tsx";

export const usePaymentsView = () => {
    const {showToast} = useToast();
    const [dateSelected, setDateSelected] = useState<Date>();
    const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
    const [isConfirmationDialogVisible, setIsConfirmationDialogVisible] = useState<boolean>(false);

    const {
        data: payments,
        isLoading: loading,
    } = useQuery({
        queryKey: ['payments', dateSelected ? dateToStringWithYearMonth(dateSelected) : ''],
        queryFn: () => {
            if (!dateSelected) return Promise.resolve([]);
            return api.paymentsApi.getPayments(dateToStringWithYearMonth(dateSelected));
        },
        enabled: !!dateSelected
    });

    const handleDateSelectAndFetchPayments = (date: Date) => {
        setDateSelected(date);
    };

    const handleGenerateNewMonthPayments = useMutation({
        mutationFn: () => {
            if (!dateSelected) throw new Error("Nie wybrano miesiąca");
            return api.paymentsApi.generateMouthPayments(dateToStringWithYearMonth(dateSelected));
        },
        onSuccess: () => {
            if (dateSelected) {
                queryClient.invalidateQueries({
                    queryKey: ['payments', dateToStringWithYearMonth(dateSelected)]
                });
                showToast('success', 'Pomyślnie wygenerowano płatności');
            }
        },
        onError: (error) => {
            console.error("Błąd podczas generowania płatności:", error);
            showToast('error', 'Nie udało się wygenerować płatności');
        }
    });

    const handleConfirmPayment = useMutation({
        mutationFn: (request: PaymentConfirmationDTO) =>
            api.paymentsApi.confirmPayment(request),
        onSuccess: async () => {
            if (dateSelected) {
                await queryClient.invalidateQueries({
                    queryKey: ['payments', dateToStringWithYearMonth(dateSelected)]
                });
                showToast('success', 'Pomyślnie potwierdzono płatność');
                setIsConfirmationDialogVisible(false);
                setSelectedPayment(null);
            }
        },
        onError: (error: Error) => {
            showToast('error', `Nie udało sie potwierdzić płatności: ${error.message}`);
        }
    });


    const closeConfirmationDialog = () => {
        setIsConfirmationDialogVisible(false);
        setSelectedPayment(null);
    };

    const openConfirmationDialog = (payment: Payment) => {
        setIsConfirmationDialogVisible(true);
        setSelectedPayment(payment);
    };

    return {
        payments,
        loading,
        dateSelected,
        selectedPayment,
        isConfirmationDialogVisible,
        handleDateSelectAndFetchPayments,
        openConfirmationDialog,
        closeConfirmationDialog,
        handleConfirmPayment,
        handleGenerateNewMonthPayments,
    };
};
