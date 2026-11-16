import {useFormik} from "formik";
import * as Yup from "yup";
import {confirmDanger} from "../../components/ui/confirm.ts";
import {FormDialog} from "../../components/form/FormDialog.tsx";
import {InfoDialog} from "../../components/form/InfoDialog.tsx";
import {DetailList, DetailItem} from "../../components/form/DetailList.tsx";
import {AmountField, DateField, SelectField, TextAreaField, TextField} from "../../components/form/fields.tsx";
import {positiveAmount, requiredDate} from "../../components/form/schemas.ts";
import {CostScopeFields} from "../../components/form/CostScopeFields.tsx";
import {costScopeIds, costScopeSchema, CostScopeValues} from "../../components/form/cost-scope.ts";
import {Badge} from "../../components/ui/Badge.tsx";
import {PAYMENT_STATUS_LABEL, PAYMENT_STATUS_TONE} from "../../components/ui/payment-status.ts";
import {formatDatePl, parseIsoDate} from "../../utils/date.ts";
import {expensesMap} from "../../../src/pages/expenses-template/add-edit-expenses-template/add-edit-expenses-template-dialog.types.ts";
import {formatCurrency} from "../../../src/components/commons/currencyFormatter.ts";
import {dateToStringFullYearMouthDay} from "../../../src/components/commons/dateFormatter.ts";
import {PaymentStatus} from "../../../src/api/generated";
import type {ApartmentWithRooms, ExpenseCategory, NewOperationalExpenseDTO, OperationalExpenseDTO, UpdateOperationalExpenseDTO} from "../../../src/api/generated";

const categoryLabel = (expense: OperationalExpenseDTO) => expensesMap[expense.category] ?? expense.category;
const expenseTarget = (expense: OperationalExpenseDTO) =>
    [expense.apartmentDetails?.name, expense.roomDetails?.roomName].filter(Boolean).join(" · ") || "Ogólny";
const expenseTitle = (expense: OperationalExpenseDTO) => `${categoryLabel(expense)} – ${expenseTarget(expense)}`;

const expenseSummary = (expense: OperationalExpenseDTO, extra: DetailItem[] = []): DetailItem[] => [
    {label: "Kwota", value: formatCurrency(expense.amount)},
    {label: "Termin płatności", value: formatDatePl(expense.insertDate)},
    ...extra,
];

export const ConfirmExpenseDialog = ({expense, onConfirm, onHide}: {
    expense: OperationalExpenseDTO;
    onConfirm: (date: Date, expenseId: number, amount: number) => void;
    onHide: () => void;
}) => {
    const formik = useFormik({
        initialValues: {date: new Date() as Date | null, amount: expense.amount as number | null},
        validationSchema: Yup.object({date: requiredDate("Data zapłaty jest wymagana"), amount: positiveAmount()}),
        onSubmit: (values) => onConfirm(values.date!, expense.id, values.amount!),
    });

    return (
        <FormDialog
            visible
            title={`Zapłata – ${expenseTitle(expense)}`}
            onHide={onHide}
            formId="expense-confirm-form"
            onSubmit={formik.handleSubmit}
            submitLabel="Potwierdź zapłatę"
        >
            <DetailList variant="compact" items={expenseSummary(expense, expense.invoiceNumber ? [{label: "Nr faktury", value: expense.invoiceNumber}] : [])}/>
            <DateField formik={formik} name="date" label="Data zapłaty"/>
            <AmountField formik={formik} name="amount" label="Zapłacona kwota"/>
        </FormDialog>
    );
};

export const ExpenseDetailsDialog = ({expense, onHide}: { expense: OperationalExpenseDTO; onHide: () => void }) => (
    <InfoDialog visible title={expenseTitle(expense)} onHide={onHide}>
        <DetailList items={[
            {label: "Status", value: <Badge tone={PAYMENT_STATUS_TONE[expense.status]}>{PAYMENT_STATUS_LABEL[expense.status]}</Badge>},
            ...expenseSummary(expense),
            {label: "Data zapłaty", value: formatDatePl(expense.paidDate)},
            {label: "Nr faktury", value: expense.invoiceNumber || "—"},
            {label: "Źródło", value: expense.templateId ? "Z szablonu" : "Dodany ręcznie"},
            ...(expense.description ? [{label: "Opis", value: expense.description}] : []),
        ]}/>
    </InfoDialog>
);

const CATEGORY_OPTIONS = (Object.entries(expensesMap) as [ExpenseCategory, string][]).map(([value, label]) => ({label, value}));

export const EditExpenseDialog = ({expense, saving, onSave, onHide}: {
    expense: OperationalExpenseDTO;
    saving: boolean;
    onSave: (dto: UpdateOperationalExpenseDTO) => void;
    onHide: () => void;
}) => {
    const formik = useFormik({
        initialValues: {
            category: expense.category as ExpenseCategory | null,
            amount: expense.amount as number | null,
            insertDate: parseIsoDate(expense.insertDate),
            invoiceNumber: expense.invoiceNumber ?? "",
            description: expense.description ?? "",
        },
        validationSchema: Yup.object({
            category: Yup.string().nullable().required("Wybierz kategorię"),
            amount: positiveAmount(),
            insertDate: requiredDate("Termin płatności jest wymagany"),
            invoiceNumber: Yup.string().max(255, "Maksymalnie 255 znaków"),
        }),
        onSubmit: (values) => onSave({
            id: expense.id,
            category: values.category,
            amount: values.amount,
            insertDate: dateToStringFullYearMouthDay(values.insertDate!),
            invoiceNumber: values.invoiceNumber.trim() || null,
            description: values.description.trim() || null,
        }),
    });

    return (
        <FormDialog
            visible
            title={`Edytuj koszt – ${expenseTarget(expense)}`}
            onHide={onHide}
            formId="expense-edit-form"
            onSubmit={formik.handleSubmit}
            submitLabel="Zapisz zmiany"
            saving={saving}
        >
            <SelectField formik={formik} name="category" label="Kategoria" options={CATEGORY_OPTIONS}/>
            <AmountField formik={formik} name="amount" label="Kwota"/>
            <DateField formik={formik} name="insertDate" label="Termin płatności" hint="Zmiana miesiąca przeniesie koszt do tego miesiąca"/>
            <TextField formik={formik} name="invoiceNumber" label="Nr faktury (opcjonalnie)"/>
            <TextAreaField formik={formik} name="description" label="Opis (opcjonalnie)"/>
        </FormDialog>
    );
};

interface NewExpenseValues extends CostScopeValues {
    category: ExpenseCategory | null;
    amount: number | null;
    insertDate: Date | null;
    invoiceNumber: string;
    description: string;
}

/** A one-off cost outside any template; it starts unpaid and is confirmed like a generated one. */
export const AddExpenseDialog = ({defaultDate, apartments, saving, onSave, onHide}: {
    defaultDate: Date;
    apartments: ApartmentWithRooms[];
    saving: boolean;
    onSave: (dto: NewOperationalExpenseDTO) => void;
    onHide: () => void;
}) => {
    const formik = useFormik<NewExpenseValues>({
        initialValues: {
            category: null,
            amount: null,
            insertDate: defaultDate,
            scope: "general",
            apartmentId: null,
            roomId: null,
            invoiceNumber: "",
            description: "",
        },
        validationSchema: Yup.object({
            category: Yup.string().nullable().required("Wybierz kategorię"),
            amount: positiveAmount(),
            insertDate: requiredDate("Termin płatności jest wymagany"),
            invoiceNumber: Yup.string().max(255, "Maksymalnie 255 znaków"),
            ...costScopeSchema,
        }),
        onSubmit: (values) => onSave({
            category: values.category!,
            amount: values.amount!,
            insertDate: dateToStringFullYearMouthDay(values.insertDate!),
            status: PaymentStatus.Pending,
            ...costScopeIds(values),
            invoiceNumber: values.invoiceNumber.trim() || null,
            description: values.description.trim() || null,
        }),
    });

    return (
        <FormDialog
            visible
            title="Nowy koszt"
            onHide={onHide}
            formId="expense-add-form"
            onSubmit={formik.handleSubmit}
            submitLabel="Dodaj koszt"
            saving={saving}
        >
            <SelectField formik={formik} name="category" label="Kategoria" placeholder="Wybierz kategorię" options={CATEGORY_OPTIONS}/>
            <div className="ku-form-row">
                <AmountField formik={formik} name="amount" label="Kwota"/>
                <DateField formik={formik} name="insertDate" label="Termin płatności" hint="Koszt trafi do miesiąca tego terminu"/>
            </div>
            <CostScopeFields formik={formik} apartments={apartments}/>
            <TextField formik={formik} name="invoiceNumber" label="Nr faktury (opcjonalnie)"/>
            <TextAreaField formik={formik} name="description" label="Opis (opcjonalnie)"/>
        </FormDialog>
    );
};

export const confirmDeleteExpense = (expense: OperationalExpenseDTO, onDelete: () => void) =>
    confirmDanger({
        title: `Usunąć koszt ${expenseTitle(expense)}?`,
        message: `${formatCurrency(expense.amount)}, termin ${formatDatePl(expense.insertDate)}. Usunięcia nie można cofnąć.`,
        confirmLabel: "Usuń koszt",
        onConfirm: onDelete,
    });
