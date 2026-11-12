import {useEffect, useMemo} from "react";
import {useFormik} from "formik";
import * as Yup from "yup";
import {FormDialog} from "../../components/form/FormDialog.tsx";
import {AmountField, IntegerField, SegmentedField, SelectField} from "../../components/form/fields.tsx";
import {dayOfMonth, positiveAmount} from "../../components/form/schemas.ts";
import {getApartments} from "../../../src/pages/apartment/api/apartments.api.ts";
import {addExpensesTemplate, editExpensesTemplate} from "../../../src/pages/expenses-template/api/expenses-template.api.ts";
import {expensesMap, ExpenseScope} from "../../../src/pages/expenses-template/add-edit-expenses-template/add-edit-expenses-template-dialog.types.ts";
import type {ExpenseCategory, OperationalExpenseTemplateResponse} from "../../../src/api/generated";
import {isEqual, isNotNullable, isNull} from "../../../src/utils/typeguards";

const CATEGORY_OPTIONS = (Object.entries(expensesMap) as [ExpenseCategory, string][]).map(([value, label]) => ({label, value}));
const SCOPE_OPTIONS: { label: string; value: ExpenseScope }[] = [
    {label: "Ogólny", value: "general"},
    {label: "Mieszkanie", value: "property"},
    {label: "Pokój", value: "room"},
];

interface TemplateValues {
    category: ExpenseCategory | null;
    amount: number | null;
    dayOfMonth: number | null;
    scope: ExpenseScope;
    apartmentId: number | null;
    roomId: number | null;
}

const schema = Yup.object({
    category: Yup.string().nullable().required("Wybierz kategorię"),
    amount: positiveAmount(),
    dayOfMonth: dayOfMonth("Dzień płatności jest wymagany"),
    apartmentId: Yup.number().nullable().when("scope", {
        is: (scope: ExpenseScope) => "general" !== scope,
        then: (field) => field.required("Wybierz mieszkanie"),
    }),
    roomId: Yup.number().nullable().when("scope", {
        is: (scope: ExpenseScope) => "room" === scope,
        then: (field) => field.required("Wybierz pokój"),
    }),
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
                apartmentId: "general" === values.scope ? null : values.apartmentId,
                roomId: "room" === values.scope ? values.roomId : null,
            };
            if (isNull(template)) addTemplate.mutate({addExpenseTemplateRequest: request});
            else editTemplate.mutate({expenseTemplateId: template.id, updateExpenseTemplate: request});
        },
    });

    const {scope, apartmentId, roomId} = formik.values;
    const roomOptions = useMemo(
        () => apartments.find((apartment) => isEqual(apartmentId, apartment.apartmentId))?.rooms
            ?.map((room) => ({label: room.roomName, value: room.roomId})) ?? [],
        [apartments, apartmentId]
    );

    // switching apartment leaves a room from the old one selected: clear it
    useEffect(() => {
        if (isNotNullable(roomId) && apartments.length > 0 && !roomOptions.some((option) => isEqual(roomId, option.value))) {
            formik.setFieldValue("roomId", null);
        }
    }, [roomOptions]); // eslint-disable-line react-hooks/exhaustive-deps

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
            <SegmentedField formik={formik} name="scope" label="Dotyczy" options={SCOPE_OPTIONS}
                            hint={"general" === scope ? "Koszt całej działalności, np. ZUS albo PIT" : undefined}/>
            {"general" !== scope && (
                <SelectField
                    formik={formik}
                    name="apartmentId"
                    label="Mieszkanie"
                    placeholder="Wybierz mieszkanie"
                    options={apartments.map((apartment) => ({label: apartment.apartmentName, value: apartment.apartmentId}))}
                />
            )}
            {"room" === scope && (
                <SelectField
                    formik={formik}
                    name="roomId"
                    label="Pokój"
                    placeholder={isNull(apartmentId) ? "Najpierw wybierz mieszkanie" : "Wybierz pokój"}
                    disabled={isNull(apartmentId)}
                    emptyMessage="To mieszkanie nie ma pokoi"
                    options={roomOptions}
                />
            )}
        </FormDialog>
    );
};
