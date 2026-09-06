import {DataTable} from "primereact/datatable";
import {Column} from "primereact/column";
import {Calendar} from "primereact/calendar";
import {usePaymentsView} from "../../../src/pages/payments/income/income-payments-view/income-payments-view.hook.ts";
import {IncomeEditPaymentDialog} from "../../../src/pages/payments/income/income-edit-payment-dialog/income-edit-payment-dialog.tsx";
import {IncomeConfirmPaymentDialog} from "../../../src/pages/payments/income/income-confirm-payment-dialog/income-confirm-payment-dialog.tsx";
import {IncomeSplitPaymentDialog} from "../../../src/pages/payments/income/income-split-payment-dialog/income-split-payment-dialog.tsx";
import {dateToStringWithYearMonth} from "../../../src/components/commons/dateFormatter.ts";
import {formatCurrency} from "../../../src/components/commons/currencyFormatter.ts";
import {PageHeader} from "../../components/ui/PageHeader.tsx";
import {Card} from "../../components/ui/Card.tsx";
import {Badge, BadgeTone} from "../../components/ui/Badge.tsx";
import {Button} from "../../components/ui/Button.tsx";
import {PaymentHistoryWithPersonDTO, PaymentStatus} from "../../../src/api/generated";

const STATUS_LABEL: Record<string, string> = {
    [PaymentStatus.Pending]: "Oczekuje",
    [PaymentStatus.Paid]: "Opłacone",
    [PaymentStatus.Late]: "Zaległe",
    [PaymentStatus.Cancelled]: "Anulowane",
    [PaymentStatus.PartiallyPaid]: "Częściowo",
};

const STATUS_TONE: Record<string, BadgeTone> = {
    [PaymentStatus.Pending]: "neutral",
    [PaymentStatus.Paid]: "success",
    [PaymentStatus.Late]: "danger",
    [PaymentStatus.Cancelled]: "neutral",
    [PaymentStatus.PartiallyPaid]: "warning",
};

const IncomePaymentsPage = () => {
    const {
        payments,
        loading,
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
    } = usePaymentsView();

    const payerBody = (payment: PaymentHistoryWithPersonDTO) => (
        <span style={{fontWeight: 600}}>
            {payment.person?.firstName} {payment.person?.lastName}
        </span>
    );

    const amountBody = (payment: PaymentHistoryWithPersonDTO) => (
        <span
            style={{
                fontWeight: 600,
                textDecoration: payment.status === PaymentStatus.Cancelled ? "line-through" : "none",
                color: payment.status === PaymentStatus.Cancelled ? "var(--ku-text-muted)" : "inherit",
            }}
        >
            {formatCurrency(payment.amount)}
        </span>
    );

    const statusBody = (payment: PaymentHistoryWithPersonDTO) => (
        <Badge tone={STATUS_TONE[payment.status] ?? "neutral"}>{STATUS_LABEL[payment.status] ?? payment.status}</Badge>
    );

    const actionsBody = (payment: PaymentHistoryWithPersonDTO) => {
        const canConfirm = payment.status !== PaymentStatus.Paid && payment.status !== PaymentStatus.Cancelled;
        return canConfirm ? (
            <div style={{display: "flex", flexWrap: "nowrap", gap: 8, justifyContent: "flex-end"}}>
                <Button
                    variant="primary"
                    size="small"
                    style={{flexShrink: 0, whiteSpace: "nowrap"}}
                    onClick={() => openConfirmationDialog(payment)}
                >
                    Potwierdź
                </Button>
                <Button
                    variant="secondary"
                    size="small"
                    icon="pi pi-percentage"
                    style={{flexShrink: 0, whiteSpace: "nowrap"}}
                    onClick={() => openSplitDialog(payment)}
                >
                    Podziel
                </Button>
            </div>
        ) : (
            <div style={{textAlign: "right"}}>
                <Button
                    variant="secondary"
                    size="small"
                    icon="pi pi-pencil"
                    style={{whiteSpace: "nowrap"}}
                    onClick={() => openEditDialog(payment)}
                >
                    Edytuj
                </Button>
            </div>
        );
    };

    return (
        <div style={{display: "flex", flexDirection: "column", gap: 20}}>
            <PageHeader title="Wpłaty najemców" subtitle="Historia i rozliczanie czynszu"/>

            <Card padding={20} style={{display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap"}}>
                <Calendar
                    value={dateSelected}
                    onChange={(event) => handleDateSelectAndFetchPayments(event.value as Date)}
                    view="month"
                    locale="pl"
                    dateFormat="yy-mm"
                    placeholder="Wybierz miesiąc"
                />
                {dateSelected && (
                    <Button variant="primary" onClick={() => handleGenerateNewMonthPayments.mutate()}>
                        Wygeneruj płatności za {dateToStringWithYearMonth(dateSelected)}
                    </Button>
                )}
            </Card>

            <Card padding={0} style={{overflow: "hidden"}}>
                <DataTable
                    value={payments ?? []}
                    loading={loading}
                    paginator
                    rows={10}
                    rowsPerPageOptions={[10, 20, 50]}
                    stripedRows
                    responsiveLayout="stack"
                    breakpoint="860px"
                    emptyMessage="Wybierz miesiąc, aby zobaczyć płatności"
                >
                    <Column header="Płatnik" body={payerBody}/>
                    <Column header="Mieszkanie" body={(row: PaymentHistoryWithPersonDTO) => row.room?.apartment}/>
                    <Column header="Kwota" body={amountBody}/>
                    <Column header="Data" body={(row: PaymentHistoryWithPersonDTO) => row.payedDate ?? "—"}/>
                    <Column header="Status" body={statusBody}/>
                    <Column header="" body={actionsBody} style={{width: 260}}/>
                </DataTable>
            </Card>

            <IncomeConfirmPaymentDialog
                isVisible={isConfirmationDialogVisible}
                onHide={closeConfirmationDialog}
                onConfirm={handleConfirmPayment}
                selectedPayment={selectedPayment}
            />
            <IncomeSplitPaymentDialog
                isVisible={isSplitDialogVisible}
                onHide={closeSplitDialog}
                onConfirm={handleSplitPayment}
                selectedPayment={selectedPayment}
            />
            <IncomeEditPaymentDialog
                onHide={closeEditDialog}
                selectedPayment={selectedPayment}
                isVisible={isEditPaymentVisible}
                onConfirm={handleEditPayment}
            />
        </div>
    );
};

export default IncomePaymentsPage;
