import {Modal} from "../../../components/modal/modal.tsx";
import {useFormik} from "formik";
import {SelectField} from "../../../components/select/select-field.tsx";
import {TextField} from "../../../components/text-field/text-field.tsx";
import {useEffect, useMemo, useRef} from "react";
import {SelectButton} from "primereact/selectbutton";
import {expenseOptions} from "../enum/expenses.enum.ts";
import {ModalFooter} from "../../../components/modal/footer/modal-footer.tsx";
import {AddEditExpensesDialogProps} from "./add-edit-expenses-template-dialog.props.ts";
import {AddExpenseTemplateRequest, ExpenseCategory, UpdateExpenseTemplate} from "../../../api/generated";
import {getApartments} from "../../apartment/api/apartments.api.ts";
import {addExpensesTemplate, editExpensesTemplate} from "../api/expenses-template.api.ts";
import {categoryOptions, mapSelectedToModel, useDefaultValues} from "./add-edit-expenses-template-dialog.utils.ts";
import {ViewMode} from "../../../commons/view-mode.ts";
import {FormValues, schema} from "./add-edit-expenses-template-dialog.validation-schema.ts";

export const AddEditExpensesTemplateDialog = ({
                                                  isVisible,
                                                  onHide,
                                                  selectedExpense,
                                                  mode
                                              }: AddEditExpensesDialogProps) => {

    const defaultValues = useMemo<FormValues>(() => {
        if (ViewMode.CREATE === mode || !selectedExpense)
            return useDefaultValues()
        else
            return mapSelectedToModel(selectedExpense)
    }, [mode, selectedExpense])

    const addExpense = addExpensesTemplate({
        onSuccess: () => {
            onHide();
            formik.resetForm();
        }
    })

    const editExpense = editExpensesTemplate({
        onSuccess: () => {
            onHide();
            formik.resetForm();
        }
    })

    const formik = useFormik<FormValues>({
        initialValues: defaultValues,
        enableReinitialize: true,
        onSubmit: async (values) => {
            switch (mode) {
                case ViewMode.CREATE: {
                    const expense = {
                        category: values.category ? (values.category as ExpenseCategory) : ExpenseCategory.Other,
                        expenseDate: values.expenseDate,
                        amount: Number(values.amount),
                        apartmentId: values.apartmentId ? Number(values.apartmentId) : null,
                        roomId: values.roomId ? Number(values.roomId) : null,
                    } as AddExpenseTemplateRequest

                    addExpense.mutate({addExpenseTemplateRequest: expense})
                    break;
                }
                case ViewMode.UPDATE: {
                    if (!selectedExpense) break;

                    const updateExpenseTemplate: UpdateExpenseTemplate = {
                        category: values.category ? (values.category as ExpenseCategory) : ExpenseCategory.Other,
                        expenseDate: values.expenseDate,
                        amount: Number(values.amount),
                        apartmentId: values.apartmentId ? Number(values.apartmentId) : null,
                        roomId: values.roomId ? Number(values.roomId) : null,
                    }

                    editExpense.mutate({
                        expenseTemplateId: selectedExpense.id,
                        updateExpenseTemplate
                    })
                    break;
                }
            }
        },
        validationSchema: schema,
    });

    useEffect(() => {
        if (!isVisible) {
            formik.resetForm();
        }
    }, [isVisible]);

    const {data: apartmentsWithRooms} = getApartments({enabled: isVisible})

    // Kolejne dwa efekty pilnują, aby zmiana zakresu/mieszkania resetowała zależne
    // pola, ale nie robiły tego przy hydratacji formularza danymi z selectedExpense.
    const skipExpenseTypeResetRef = useRef(true);
    const skipApartmentResetRef = useRef(true);

    useEffect(() => {
        if (isVisible) {
            skipExpenseTypeResetRef.current = true;
            skipApartmentResetRef.current = true;
        }
    }, [isVisible, defaultValues]);

    useEffect(() => {
        if (skipExpenseTypeResetRef.current) {
            skipExpenseTypeResetRef.current = false;
            return;
        }
        if (formik.values.expenseType === 'general') {
            formik.setFieldValue('apartmentId', '');
            formik.setFieldValue('roomId', '');
        } else if (formik.values.expenseType === 'property') {
            formik.setFieldValue('roomId', '');
        }
    }, [formik.values.expenseType]);

    useEffect(() => {
        if (skipApartmentResetRef.current) {
            skipApartmentResetRef.current = false;
            return;
        }
        formik.setFieldValue('roomId', '');
    }, [formik.values.apartmentId]);

    const apartmentOptions = useMemo(() => {
        return apartmentsWithRooms?.map(a => ({
            label: a.apartmentName,
            value: String(a.apartmentId)
        })) || [];
    }, [apartmentsWithRooms]);

    const roomOptions = useMemo(() => {
        if (!formik.values.apartmentId || !apartmentsWithRooms) return [];
        const selectedApartment = apartmentsWithRooms.find(a => String(a.apartmentId) === formik.values.apartmentId);
        return selectedApartment?.rooms?.map(r => ({
            label: r.roomName,
            value: String(r.roomId)
        })) || [];
    }, [apartmentsWithRooms, formik.values.apartmentId]);

    if (!isVisible || mode == null)
        return null

    return (
        <Modal isOpen={isVisible}
               title={mode === ViewMode.CREATE ? "Dodaj wydatek" : "Edytuj wydatek"}
               onClose={onHide}
               content={
                   <form onSubmit={formik.handleSubmit}>
                       <h4>Podstawowe dane</h4>
                       <div className="flex flex-column gap-3">
                           <SelectField label="Kategoria wydatku"
                                        name='category'
                                        options={categoryOptions}
                                        formik={formik}
                           />
                           <TextField name="expenseDate"
                                      label="Data wpływu"
                                      formik={formik}/>

                           <TextField name="amount"
                                      label="Kwota"
                                      formik={formik}
                                      inputType="number"/>

                       </div>
                       <div>
                           <div>
                               <h4>Zakres płatności</h4>
                               <SelectButton
                                   value={formik.values.expenseType}
                                   options={expenseOptions}
                                   onChange={(e) => formik.setFieldValue('expenseType', e.value)}
                               />
                           </div>
                           {(formik.values.expenseType === 'property' || formik.values.expenseType === 'room') && (
                               <SelectField
                                   label="Mieszkanie"
                                   name="apartmentId"
                                   options={apartmentOptions}
                                   formik={formik}
                               />
                           )}

                           {formik.values.expenseType === 'room' && (
                               <SelectField
                                   label="Pokój"
                                   name="roomId"
                                   options={roomOptions}
                                   formik={formik}
                                   disabled={!formik.values.apartmentId}
                               />
                           )}

                       </div>
                   </form>
               }
               footer={
                   <ModalFooter cancelLabel="Anuluj"
                                confirmLabel={mode === ViewMode.CREATE ? "Dodaj wydatek" : "Zapisz zmiany"}
                                onConfirm={formik.handleSubmit}
                                onCancel={onHide}/>
               }
        />
    );
};

