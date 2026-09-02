import {useState} from "react";
import {dateToStringFullYearMouthDay} from "../../../../components/commons/dateFormatter.ts";
import {EditPayment} from "../../../../components/commons/types.ts";
import {useModal} from "../../../../hooks/use-modal";
import {PaymentSortableField} from "./income-payments.model.ts";
import {DataTableStateEvent} from "primereact/datatable";
import {
    useConfirmPayment,
    useEditPayment,
    useGenerateNewMonthPayments,
    usePaymentsQuery,
    useSplitPayment
} from "../api/income-payments-view.api.ts";
import {PaymentHistoryWithPersonDTO, PaymentStatus} from "../../../../api/generated";
import {SortOrder} from "primereact/api";

export const fieldMapping: Record<string, PaymentSortableField> = {
    'id': PaymentSortableField.ID,
    'payerName': PaymentSortableField.PERSON,
    'flat': PaymentSortableField.FLAT,
    'amount': PaymentSortableField.AMOUNT,
    'date': PaymentSortableField.DATE,
    'status': PaymentSortableField.STATUS
};

export const usePaymentsView = () => {
    const [dateSelected, setDateSelected] = useState<Date>();
    const [selectedPayment, setSelectedPayment] = useState<PaymentHistoryWithPersonDTO | null>(null);
    const [isConfirmationDialogVisible, setIsConfirmationDialogVisible] = useState<boolean>(false);
    const [isSplitDialogVisible, setIsSplitDialogVisible] = useState<boolean>(false);
    const {isOpen: isEditPaymentVisible, setOpen: setIsEditPaymentVisible} = useModal()

    const [sortState, setSortState] = useState<{
        field?: PaymentSortableField,
        order?: SortOrder
    }>({
        field: undefined,
        order: undefined
    });


    const handleTableSort = (event: DataTableStateEvent) => {
        const {sortField, sortOrder} = event;


        const mappedSortField = fieldMapping[sortField] || undefined;

        if (mappedSortField) {
            setSortState({
                field: mappedSortField,
                order: sortOrder as SortOrder,
            });
        }


    };

    const {
        data: payments,
        isLoading: loading,
    } = usePaymentsQuery(dateSelected, sortState.field, sortState.order)

    const handleDateSelectAndFetchPayments = (date: Date) => {
        setDateSelected(date);
    };

    const handleGenerateNewMonthPayments = useGenerateNewMonthPayments(dateSelected)
    const confirmPayment = useConfirmPayment()
    const editPayment = useEditPayment()
    const splitPayment = useSplitPayment()

    const closeConfirmationDialog = () => {
        setIsConfirmationDialogVisible(false);
        setSelectedPayment(null);
    };

    const openConfirmationDialog = (payment: PaymentHistoryWithPersonDTO) => {
        setIsConfirmationDialogVisible(true);
        setSelectedPayment(payment);
    };

    const closeSplitDialog = () => {
        setIsSplitDialogVisible(false);
        setSelectedPayment(null);
    };

    const openSplitDialog = (payment: PaymentHistoryWithPersonDTO) => {
        setIsSplitDialogVisible(true);
        setSelectedPayment(payment);
    };

    const openEditDialog = (payment: PaymentHistoryWithPersonDTO) => {
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

    const handleSplitPayment = async (date: Date, paymentId: number, amount: number) => {
        closeSplitDialog()
        splitPayment.mutate({
            paymentId: paymentId,
            paymentDate: dateToStringFullYearMouthDay(date),
            amount: amount
        })
    }

    const handleEditPayment = async (payment: EditPayment) => {
        editPayment.mutate({
            paymentId: payment.paymentId,
            amount: payment.amount,
            payedDate: payment.payedDate,
            status: payment.status as PaymentStatus
        })
        closeEditDialog()
    }

    return {
        payments,
        loading: loading || handleGenerateNewMonthPayments.isPending || confirmPayment.isPending || splitPayment.isPending,
        dateSelected,
        selectedPayment,
        isConfirmationDialogVisible,
        handleDateSelectAndFetchPayments,
        openConfirmationDialog,
        closeConfirmationDialog,
        handleConfirmPayment,
        isSplitDialogVisible,
        openSplitDialog,
        closeSplitDialog,
        handleSplitPayment,
        handleGenerateNewMonthPayments,
        isEditPaymentVisible,
        openEditDialog,
        closeEditDialog,
        handleEditPayment,
        handleTableSort,
        sortState
    };
};
