import {useEffect} from "react";
import {usePaymentsView} from "../../../src/pages/payments/income/income-payments-view/income-payments-view.hook.ts";
import {ConfirmIncomeDialog, EditIncomeDialog, SplitIncomeDialog} from "./IncomePaymentDialogs.tsx";
import {formatCurrency} from "../../../src/components/commons/currencyFormatter.ts";
import {Page} from "../../components/layout/Page.tsx";
import {Text} from "../../components/ui/Text.tsx";
import {DataTableCard, DataTableColumn} from "../../components/ui/DataTableCard.tsx";
import {Badge} from "../../components/ui/Badge.tsx";
import {PAYMENT_STATUS_LABEL, PAYMENT_STATUS_TONE} from "../../components/ui/payment-status.ts";
import {Button} from "../../components/ui/Button.tsx";
import {MonthSettlementSummary} from "../../components/ui/MonthSettlementSummary.tsx";
import {formatDatePl} from "../../utils/date.ts";
import {PaymentHistoryWithPersonDTO, PaymentStatus} from "../../../src/api/generated";
import {isNotEqual} from "../../../src/utils/typeguards";
import {formatMonthLabel, useCurrentMonth} from "../../components/layout/CurrentMonth.ts";

const STATUS_URGENCY: PaymentStatus[] = [
    PaymentStatus.Late,
    PaymentStatus.PartiallyPaid,
    PaymentStatus.Pending,
    PaymentStatus.Paid,
    PaymentStatus.Cancelled,
];

const IncomePaymentsPage = () => {
    const {
        payments,
        loading,
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
    } = usePaymentsView();
    const {month} = useCurrentMonth();

    // usePaymentsView (shared with the legacy UI) owns its month state; mirror the shell's month into it.
    useEffect(() => handleDateSelectAndFetchPayments(month), [month, handleDateSelectAndFetchPayments]);

    // who still owes comes first: late, partial, pending, then paid and cancelled
    const sortedPayments = [...(payments ?? [])].sort(
        (a, b) => STATUS_URGENCY.indexOf(a.status) - STATUS_URGENCY.indexOf(b.status)
    );

    const payerBody = (payment: PaymentHistoryWithPersonDTO) => (
        <Text weight="semibold">
            {payment.person?.firstName} {payment.person?.lastName}
        </Text>
    );

    const amountBody = (payment: PaymentHistoryWithPersonDTO) => (
        <Text
            weight="semibold"
            tone={PaymentStatus.Cancelled === payment.status ? "muted" : "default"}
            strike={PaymentStatus.Cancelled === payment.status}
        >
            {formatCurrency(payment.amount)}
        </Text>
    );

    const statusBody = (payment: PaymentHistoryWithPersonDTO) => (
        <Badge tone={PAYMENT_STATUS_TONE[payment.status]}>{PAYMENT_STATUS_LABEL[payment.status]}</Badge>
    );

    const rowActions = (payment: PaymentHistoryWithPersonDTO) => {
        const canConfirm = isNotEqual(PaymentStatus.Paid, payment.status) && isNotEqual(PaymentStatus.Cancelled, payment.status);
        return canConfirm ? (
            <>
                <Button variant="primary" size="small" onClick={() => openConfirmationDialog(payment)}>
                    Potwierdź
                </Button>
                <Button variant="secondary" size="small" icon="pi pi-percentage" onClick={() => openSplitDialog(payment)}>
                    Podziel
                </Button>
            </>
        ) : (
            <Button variant="secondary" size="small" icon="pi pi-pencil" onClick={() => openEditDialog(payment)}>
                Edytuj
            </Button>
        );
    };

    const columns: DataTableColumn<PaymentHistoryWithPersonDTO>[] = [
        {header: "Płatnik", body: payerBody},
        {header: "Mieszkanie", body: (row) => row.room?.apartment},
        {header: "Kwota", body: amountBody},
        {header: "Data wpłaty", body: (row) => formatDatePl(row.payedDate)},
        {header: "Status", body: statusBody},
    ];

    return (
        <Page
            title="Wpłaty najemców"
            subtitle="Historia i rozliczanie czynszu"
            actions={
                <Button
                    variant={(payments?.length ?? 0) > 0 ? "secondary" : "primary"}
                    loading={handleGenerateNewMonthPayments.isPending}
                    onClick={() => handleGenerateNewMonthPayments.mutate()}
                >
                    Wygeneruj płatności za {formatMonthLabel(month)}
                </Button>
            }
        >
            <MonthSettlementSummary items={payments ?? []} settledLabel="Wpłacono" outstandingLabel="Do zebrania"/>

            <DataTableCard
                value={sortedPayments}
                columns={columns}
                rowActions={rowActions}
                loading={loading}
                emptyMessage="Brak płatności w tym miesiącu"
            />

            {selectedPayment && isConfirmationDialogVisible && (
                <ConfirmIncomeDialog payment={selectedPayment} onConfirm={handleConfirmPayment} onHide={closeConfirmationDialog}/>
            )}
            {selectedPayment && isSplitDialogVisible && (
                <SplitIncomeDialog payment={selectedPayment} onConfirm={handleSplitPayment} onHide={closeSplitDialog}/>
            )}
            {selectedPayment && isEditPaymentVisible && (
                <EditIncomeDialog payment={selectedPayment} onConfirm={handleEditPayment} onHide={closeEditDialog}/>
            )}
        </Page>
    );
};

export default IncomePaymentsPage;
