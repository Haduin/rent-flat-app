import {ContractDto, UpdateContractDetails} from "../../components/commons/types.ts";
import * as Yup from 'yup';
import {useFormik} from "formik";
import {Modal} from "../../components/modal/modal.tsx";
import {TextField} from "../../components/text-field/text-field.tsx";
import {DateSelector} from "../../components/date-selector/date-selector.tsx";
import {ModalFooter} from "../../components/modal/footer/modal-footer.tsx";
import {UseMutationResult} from "@tanstack/react-query";

interface UpdateContractModalProps {
    isVisible: boolean;
    onHide: () => void;
    onSave: UseMutationResult<void, Error, {
        contract: UpdateContractDetails;
    }, unknown>
    selectedContract: ContractDto | null;
}

export const UpdateContractModal = ({selectedContract, isVisible, onHide, onSave}: UpdateContractModalProps) => {
    const formik = useFormik({
        initialValues: {
            personId: selectedContract?.person?.firstName + " " + selectedContract?.person?.lastName || '',
            roomId: selectedContract?.room?.id || '',
            dates: selectedContract?.startDate && selectedContract?.endDate
                ? [new Date(selectedContract.startDate), new Date(selectedContract.endDate)]
                : [],
            amount: Number(selectedContract?.amount),
            deposit: selectedContract?.deposit + "" || null,
            payedTillDayOfMonth: Number(selectedContract?.payedTillDayOfMonth)

        },
        enableReinitialize: true,
        onSubmit: (values) => {
            const updatedContract: UpdateContractDetails = {
                contractId: selectedContract!.id,
                amount: Number(values.amount),
                deposit: Number(values.deposit),
                payedTillDayOfMonth: values.payedTillDayOfMonth + "",
                startDate: values.dates?.[0]?.toISOString().split('T')[0],
                endDate: values.dates?.[1]?.toISOString().split('T')[0],
            };
            console.log(updatedContract);
            onSave.mutate({contract: updatedContract});
            formik.resetForm();
        },
        validationSchema: Yup.object().shape({
            dates: Yup.array().required("Zakres dat musi zostać podany").min(2, "Zakres dat wymaga dwóch terminów"),
            amount: Yup.number().required("Kwota jest wymagana"),
            deposit: Yup.number().required("Kaucja jest wymagana"),
            payedTillDayOfMonth: Yup.string().required("Data przewidywanej płatności jest wymagana")
        })
    });

    return (
        <Modal
            title="Edytuj Kontrakt"
            isOpen={isVisible}
            onClose={() => {
                formik.resetForm();
                onHide();
            }}
            content={
                <form onSubmit={formik.handleSubmit}>
                    <TextField
                        formik={formik}
                        label="Osoba"
                        name="personId"
                        inputType="text"
                        disabled
                    />
                    <DateSelector
                        formik={formik}
                        name="dates"
                        label="Daty kontraktu"
                        selectionMode="range"
                    />
                    <TextField
                        formik={formik}
                        label="kwota"
                        name="amount"
                        inputType="number"
                    />
                    <TextField
                        formik={formik}
                        label="Kaucja"
                        name="deposit"
                        inputType="number"
                    />

                    <TextField
                        formik={formik}
                        label="Czynsz płatny do"
                        name="payedTillDayOfMonth"
                        inputType="number"
                    />
                </form>
            }
            footer={
                <ModalFooter
                    cancelLabel="Anuluj"
                    confirmLabel="Edytuj"
                    onConfirm={formik.handleSubmit}
                    onCancel={onHide}
                />
            }
        />
    );
};