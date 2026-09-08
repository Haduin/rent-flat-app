import {useMutation, useQuery} from "@tanstack/react-query";
import {queryClient} from "../../../../main.tsx";
import {client} from "../../../../api/client.ts";
import {PaymentConfirmationDTO, PaymentSplitDTO, type PaymentEdit} from "../../../../api/generated";
import {PAYMENTS_MUTATIONS_KEYS} from "../../../../api/keys/payments.ts";
import {useToast} from "../../../../components/commons/ToastProvider.tsx";
import {dateToStringWithYearMonth} from "../../../../components/commons/dateFormatter.ts";
import {PaymentSortableField} from "../income-payments-view/income-payments.model.ts";
import {SortOrder} from "primereact/api";
import {SortOrder as SortOrderEnum} from "../../../../api/generated/models/SortOrder.ts";


export const useConfirmPayment = () => {
    const {showToast} = useToast();

    return useMutation({
            mutationFn: async (request: PaymentConfirmationDTO) =>
                client.paymentsApi.confirmPayment({paymentConfirmationDTO: request}),
            onSuccess: async () => {
                await queryClient.invalidateQueries({
                    queryKey: [PAYMENTS_MUTATIONS_KEYS.PAYMENTS]
                })
                showToast('success', 'Pomyślnie potwierdzono płatność');
            },
            onError: (error: Error) => {
                showToast('error', `Nie udało sie potwierdzić płatności: ${error.message}`);
            }
        }
    )
}


export const usePaymentsQuery = (
    dateSelected?: Date,
    sortField?: PaymentSortableField,
    sortOrder?: SortOrder
) => {
    return useQuery({
        queryKey: [
            PAYMENTS_MUTATIONS_KEYS.PAYMENTS,
            dateSelected ? dateToStringWithYearMonth(dateSelected) : null,
            sortField ?? null,
            sortOrder ?? null,
        ],
        queryFn: async () => {
            if (!dateSelected) return [];

            const newSortOrder = SortOrder.ASC === sortOrder ? SortOrderEnum.Asc : SortOrderEnum.Desc;

            return client.paymentsApi.getPaymentsForMonth({
                mouth: dateToStringWithYearMonth(dateSelected),
                sortField: sortField,
                sortOrder: newSortOrder,
            });
        },
        enabled: !!dateSelected,
    });
};

export const useGenerateNewMonthPayments = (dateSelected?: Date) => {
    const {showToast} = useToast();

    return useMutation({
        mutationFn: () => {
            if (!dateSelected) throw new Error("Nie wybrano miesiąca");
            return client.contractsApi.generateMonthlyPayments({
                month: dateToStringWithYearMonth(dateSelected)
            });
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: [PAYMENTS_MUTATIONS_KEYS.PAYMENTS],
                refetchType: 'active'
            });
            showToast('success', 'Pomyślnie wygenerowano płatności');
        },
        onError: (error) => {
            showToast('error', `Nie udało się wygenerować płatności ${error.message}`);
        }
    });
}

export const useSplitPayment = () => {
    const {showToast} = useToast();

    return useMutation({
            mutationFn: async (request: PaymentSplitDTO) =>
                client.paymentsApi.splitPayment({paymentSplitDTO: request}),
            onSuccess: async () => {
                await queryClient.invalidateQueries({
                    queryKey: [PAYMENTS_MUTATIONS_KEYS.PAYMENTS]
                })
                await queryClient.invalidateQueries({
                    queryKey: [PAYMENTS_MUTATIONS_KEYS.PAYMENT_SPLITS]
                })
                showToast('success', 'Pomyślnie zapisano częściową wpłatę');
            },
            onError: (error: Error) => {
                showToast('error', `Nie udało się zapisać częściowej wpłaty: ${error.message}`);
            }
        }
    )
}

export const useGetPaymentSplits = (paymentId?: number) => {
    return useQuery({
        queryKey: [PAYMENTS_MUTATIONS_KEYS.PAYMENT_SPLITS, paymentId ?? null],
        queryFn: () => client.paymentsApi.getPaymentSplits({id: paymentId!}),
        enabled: !!paymentId,
    });
};

export const useEditPayment = () => {
    const {showToast} = useToast();
    return useMutation({
        mutationFn: (paymentEdit: PaymentEdit) => client.paymentsApi.editPayment({paymentEdit}),
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: [PAYMENTS_MUTATIONS_KEYS.PAYMENTS],
            })
            showToast('success', 'Pomyślnie zaktualizowano płatność')
        },
        onError: () => {
            showToast('error', 'Nie udało sie zakutalizować płatności')
        }
    })
}