import {useState} from "react";
import {useToast} from "../../components/commons/ToastProvider.tsx";
import {dateToStringFullYearMouthDay, dateToStringWithYearMonth} from "../../components/commons/dateFormatter.ts";
import {EditPayment, Payment, PaymentConfirmationDTO} from "../../components/commons/types.ts";
import {useMutation, useQuery} from "@tanstack/react-query";
import {api} from "../../api/api.ts";
import {queryClient} from "../../main.tsx";
import {useModal} from "../../hooks/use-modal";

export const usePaymentsView = () => {
    const {showToast} = useToast();
    const [dateSelected, setDateSelected] = useState<Date>();
    const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
    const [isConfirmationDialogVisible, setIsConfirmationDialogVisible] = useState<boolean>(false);
    const {isOpen: isEditPaymentVisible, setOpen: setIsEditPaymentVisible} = useModal()


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
            showToast('error', `Nie udało się wygenerować płatności ${error.message}`);
        }
    });

    const confirmPayment = useMutation({
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

    const openEditDialog = (payment: Payment) => {
        setIsEditPaymentVisible(true);
        setSelectedPayment(payment);
    }

    const closeEditDialog = () => {
        setIsEditPaymentVisible(false);
        setSelectedPayment(null);
    }


    const handleConfirmPayment = async (date: Date, paymentId: number, amount: number) => {
      closeConfirmationDialog()
      confirmPayment.mutate({
        paymentId: paymentId,
        paymentDate: dateToStringFullYearMouthDay(date),
        payedAmount: amount
      })
    }

    const handleEditPayment = async (payment: EditPayment) => {
      await api.paymentsApi.editPayment(payment)
      await queryClient.invalidateQueries({
        queryKey: ['payments']
      })
      showToast('success', 'Pomyślnie zaktualizowano płatność')
      closeEditDialog()
    }

    return {
        payments,
        loading: loading || handleGenerateNewMonthPayments.isPending || confirmPayment.isPending,
        dateSelected,
        selectedPayment,
        isConfirmationDialogVisible,
        handleDateSelectAndFetchPayments,
        openConfirmationDialog,
        closeConfirmationDialog,
        handleConfirmPayment,
        handleGenerateNewMonthPayments,
        isEditPaymentVisible,
        openEditDialog,
        closeEditDialog,
        handleEditPayment
    };
};
