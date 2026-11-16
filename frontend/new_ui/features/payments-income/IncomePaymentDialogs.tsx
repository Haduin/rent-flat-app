import {useMemo} from "react";
import {useFormik} from "formik";
import * as Yup from "yup";
import {FormDialog} from "../../components/form/FormDialog.tsx";
import {DetailList, DetailItem} from "../../components/form/DetailList.tsx";
import {AmountField, DateField} from "../../components/form/fields.tsx";
import {positiveAmount, requiredDate} from "../../components/form/schemas.ts";
import {formatDatePl, parseIsoDate} from "../../utils/date.ts";
import {useGetPaymentSplits} from "../../../src/pages/payments/income/api/income-payments-view.api.ts";
import {formatCurrency} from "../../../src/components/commons/currencyFormatter.ts";
import {dateToStringFullYearMouthDay} from "../../../src/components/commons/dateFormatter.ts";
import type {EditPayment} from "../../../src/components/commons/types.ts";
import {PaymentHistoryWithPersonDTO} from "../../../src/api/generated";
import {isNullable} from "../../../src/utils/typeguards";

/** Today when the payment's month ("YYYY-MM") is the current one; otherwise the 1st of that month, so catching up on old months doesn't stamp today's date. */
const defaultPaymentDate = (scopeDate?: string | null) => {
    const today = new Date();
    if (isNullable(scopeDate)) return today;
    const [year, month] = scopeDate.split("-").map(Number);
    const isCurrentMonth = year === today.getFullYear() && month === today.getMonth() + 1;
    return isCurrentMonth ? today : new Date(year, month - 1, 1);
};

const scopeMonthLabel = (scopeDate?: string | null) => {
    if (isNullable(scopeDate)) return "";
    const [year, month] = scopeDate.split("-").map(Number);
    return new Date(year, month - 1, 1).toLocaleDateString("pl-PL", {month: "long", year: "numeric"});
};

const payerName = (payment: PaymentHistoryWithPersonDTO) =>
    [payment.person?.firstName, payment.person?.lastName].filter(Boolean).join(" ") || "—";

const paymentSummary = (payment: PaymentHistoryWithPersonDTO, extra: DetailItem[] = []): DetailItem[] => [
    {label: "Pokój", value: payment.room ? `${payment.room.apartment} · ${payment.room.number}` : "—"},
    {label: "Należność", value: formatCurrency(payment.amount)},
    ...extra,
];

const usePaidSoFar = (paymentId: number) => {
    const {data: splits = [], isLoading} = useGetPaymentSplits(paymentId);
    const paid = splits.reduce((sum, split) => sum + split.amount, 0);
    return {splits, paid, isLoading};
};

const SplitHistory = ({splits}: { splits: { id: number; paymentDate: string; amount: number }[] }) =>
    splits.length > 0 ? (
        <DetailList variant="compact" items={splits.map((split, index) => ({
            label: `Wpłata ${index + 1} · ${formatDatePl(split.paymentDate)}`,
            value: formatCurrency(split.amount),
        }))}/>
    ) : null;

const toIso = (date: Date | null) => dateToStringFullYearMouthDay(date!);

export const ConfirmIncomeDialog = ({payment, onConfirm, onHide}: {
    payment: PaymentHistoryWithPersonDTO;
    onConfirm: (date: Date, paymentId: number, amount: number) => void;
    onHide: () => void;
}) => {
    const formik = useFormik({
        initialValues: {date: defaultPaymentDate(payment.scopeDate) as Date | null, amount: payment.amount as number | null},
        validationSchema: Yup.object({date: requiredDate("Data wpłaty jest wymagana"), amount: positiveAmount()}),
        onSubmit: (values) => onConfirm(values.date!, payment.id, values.amount!),
    });

    return (
        <FormDialog
            visible
            title={`Wpłata za ${scopeMonthLabel(payment.scopeDate)} – ${payerName(payment)}`}
            onHide={onHide}
            formId="income-confirm-form"
            onSubmit={formik.handleSubmit}
            submitLabel="Potwierdź wpłatę"
        >
            <DetailList variant="compact" items={paymentSummary(payment)}/>
            <DateField formik={formik} name="date" label="Data wpłaty"/>
            <AmountField formik={formik} name="amount" label="Wpłacona kwota" hint="Jeśli wpłynęła tylko część, użyj „Podziel”"/>
        </FormDialog>
    );
};

export const SplitIncomeDialog = ({payment, onConfirm, onHide}: {
    payment: PaymentHistoryWithPersonDTO;
    onConfirm: (date: Date, paymentId: number, amount: number) => void;
    onHide: () => void;
}) => {
    const {splits, paid, isLoading} = usePaidSoFar(payment.id);
    const remaining = Math.max(0, payment.amount - paid);

    const initialValues = useMemo(
        () => ({date: defaultPaymentDate(payment.scopeDate) as Date | null, amount: (isLoading ? null : remaining) as number | null}),
        [payment.scopeDate, isLoading, remaining]
    );
    const formik = useFormik({
        initialValues,
        enableReinitialize: true,
        validationSchema: Yup.object({
            date: requiredDate("Data wpłaty jest wymagana"),
            amount: positiveAmount().max(remaining, `Pozostało tylko ${formatCurrency(remaining)}`),
        }),
        onSubmit: (values) => onConfirm(values.date!, payment.id, values.amount!),
    });

    return (
        <FormDialog
            visible
            title={`Wpłata częściowa – ${payerName(payment)}`}
            onHide={onHide}
            formId="income-split-form"
            onSubmit={formik.handleSubmit}
            submitLabel="Zapisz wpłatę"
        >
            <DetailList variant="compact" items={paymentSummary(payment, [
                {label: "Wpłacono", value: formatCurrency(paid)},
                {label: "Pozostało", value: <strong>{formatCurrency(remaining)}</strong>},
            ])}/>
            <SplitHistory splits={splits}/>
            <DateField formik={formik} name="date" label="Data wpłaty"/>
            <AmountField formik={formik} name="amount" label="Kwota tej wpłaty"/>
        </FormDialog>
    );
};


export const EditIncomeDialog = ({payment, onConfirm, onHide}: {
    payment: PaymentHistoryWithPersonDTO;
    onConfirm: (payment: EditPayment) => void;
    onHide: () => void;
}) => {
    const {splits, paid} = usePaidSoFar(payment.id);
    const formik = useFormik({
        initialValues: {
            payedDate: (parseIsoDate(payment.payedDate) ?? defaultPaymentDate(payment.scopeDate)) as Date | null,
            amount: payment.amount as number | null,
        },
        // the status follows from confirm/split; here only the date and the amount (instalments ≤ amount ≤ contract rent)
        validationSchema: Yup.object({
            payedDate: requiredDate("Data wpłaty jest wymagana"),
            amount: positiveAmount("Należność jest wymagana")
                .max(payment.contractAmount, `Nie więcej niż czynsz z umowy: ${formatCurrency(payment.contractAmount)}`)
                .min(paid, `Nie mniej niż suma wpłaconych rat: ${formatCurrency(paid)}`),
        }),
        onSubmit: (values) => onConfirm({
            paymentId: payment.id,
            payedDate: toIso(values.payedDate),
            amount: values.amount!,
        }),
    });

    return (
        <FormDialog
            visible
            title={`Edytuj wpłatę za ${scopeMonthLabel(payment.scopeDate)} – ${payerName(payment)}`}
            onHide={onHide}
            formId="income-edit-form"
            onSubmit={formik.handleSubmit}
            submitLabel="Zapisz zmiany"
        >
            {splits.length > 0 && (
                <>
                    <SplitHistory splits={splits}/>
                    <p className="ku-form-note">Wpłacono łącznie {formatCurrency(paid)} z {formatCurrency(payment.amount)}.</p>
                </>
            )}
            <DateField formik={formik} name="payedDate" label="Data wpłaty"/>
            <AmountField formik={formik} name="amount" label="Należność"/>
        </FormDialog>
    );
};
