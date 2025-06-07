import {useToast} from "../../components/commons/ToastProvider.tsx";
import {useState} from "react";
import {dateToStringWithYearMonth} from "../../components/commons/dateFormatter.ts";
import {Payment, PaymentConfirmationDTO} from "../../components/commons/types.ts";
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
            return api.contractsApi.generateMouthPayments(dateToStringWithYearMonth(dateSelected));
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: ['payments'],
                refetchType: 'active'
            });
            showToast('success', 'Pomyślnie wygenerowano płatności');
        },
        onError: (error) => {
            console.error("Błąd podczas generowania płatności:", error);
            showToast('error', 'Nie udało się wygenerować płatności');
        }
    });

    const handleConfirmPayment = useMutation({
        mutationFn: async (request: PaymentConfirmationDTO) =>
            api.paymentsApi.confirmPayment(request),
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: ['payments']
            })
            closeConfirmationDialog()
            showToast('success', 'Pomyślnie potwierdzono płatność');
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
