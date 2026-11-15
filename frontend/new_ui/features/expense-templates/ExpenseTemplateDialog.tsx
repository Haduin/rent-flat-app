import {useFormik} from "formik";
import * as Yup from "yup";
import {FormDialog} from "../../components/form/FormDialog.tsx";
import {AmountField, IntegerField, SelectField} from "../../components/form/fields.tsx";
import {dayOfMonth, positiveAmount} from "../../components/form/schemas.ts";
import {CostScopeFields} from "../../components/form/CostScopeFields.tsx";
import {costScopeIds, costScopeSchema, CostScopeValues} from "../../components/form/cost-scope.ts";
import {getApartments} from "../../../src/pages/apartment/api/apartments.api.ts";
import {addExpensesTemplate, editExpensesTemplate} from "../../../src/pages/expenses-template/api/expenses-template.api.ts";
import {expensesMap} from "../../../src/pages/expenses-template/add-edit-expenses-template/add-edit-expenses-template-dialog.types.ts";
import type {ExpenseCategory, OperationalExpenseTemplateResponse} from "../../../src/api/generated";
import {isNull} from "../../../src/utils/typeguards";

const CATEGORY_OPTIONS = (Object.entries(expensesMap) as [ExpenseCategory, string][]).map(([value, label]) => ({label, value}));

interface TemplateValues extends CostScopeValues {
    category: ExpenseCategory | null;
    amount: number | null;
    dayOfMonth: number | null;
}

const schema = Yup.object({
    category: Yup.string().nullable().required("Wybierz kategorię"),
    amount: positiveAmount(),
    dayOfMonth: dayOfMonth("Dzień płatności jest wymagany"),
    ...costScopeSchema,
});

const toValues = (template: OperationalExpenseTemplateResponse | null): TemplateValues => ({
    category: template?.category ?? null,
    amount: template?.amount ?? null,
    dayOfMonth: template?.dayOfMonth ?? 10,
    scope: template?.room ? "room" : template?.apartment ? "property" : "general",
    apartmentId: template?.apartment?.id ?? null,
    roomId: template?.room?.id ?? null,
});

/** `template` null → new template. */
export const ExpenseTemplateDialog = ({template, onHide}: {
    template: OperationalExpenseTemplateResponse | null;
    onHide: () => void;
}) => {
    const addTemplate = addExpensesTemplate({onSuccess: onHide});
    const editTemplate = editExpensesTemplate({onSuccess: onHide});
    const {data: apartments = []} = getApartments({enabled: true});

    const formik = useFormik<TemplateValues>({
        initialValues: toValues(template),
        validationSchema: schema,
        onSubmit: (values) => {
            const request = {
                category: values.category!,
                amount: values.amount!,
                expenseDate: String(values.dayOfMonth),
                ...costScopeIds(values),
            };
            if (isNull(template)) addTemplate.mutate({addExpenseTemplateRequest: request});
            else editTemplate.mutate({expenseTemplateId: template.id, updateExpenseTemplate: request});
        },
    });

    return (
        <FormDialog
            visible
            title={isNull(template) ? "Nowy szablon kosztu" : "Edytuj szablon kosztu"}
            onHide={onHide}
            formId="expense-template-form"
            onSubmit={formik.handleSubmit}
            submitLabel={isNull(template) ? "Dodaj szablon" : "Zapisz zmiany"}
            saving={addTemplate.isPending || editTemplate.isPending}
        >
            <SelectField formik={formik} name="category" label="Kategoria" placeholder="Wybierz kategorię" options={CATEGORY_OPTIONS}/>
            <div className="ku-form-row">
                <AmountField formik={formik} name="amount" label="Kwota miesięczna"/>
                <IntegerField formik={formik} name="dayOfMonth" label="Dzień płatności" min={1} max={31}/>
            </div>
            <CostScopeFields formik={formik} apartments={apartments}/>
        </FormDialog>
    );
};
