import {useFormik} from "formik";
import {Modal} from "../../../components/modal/modal.tsx";
import {TextField} from "../../../components/text-field/text-field.tsx";
import {DateSelector} from "../../../components/date-selector/date-selector.tsx";
import {ModalFooter} from "../../../components/modal/footer/modal-footer.tsx";
import {SelectField} from "../../../components/select/select-field.tsx";
import {UpdateContractModalProps} from "./update-contract-modal.props.ts";
import {useFetchRooms} from "../api/contracts.api.ts";
import {updateContractValidationSchema} from "./update-contract-modal.validation-schema.ts";
import {UpdateContractDetails} from "../../../api/generated";

export const UpdateContractModal = ({selectedContract, isVisible, onHide, onSave}: UpdateContractModalProps) => {

    const {data: rooms} = useFetchRooms()

    const formik = useFormik({
        initialValues: {
            personName: selectedContract?.person?.firstName + " " + selectedContract?.person?.lastName || '',
            roomId: Number(selectedContract?.room?.id),
            dates: selectedContract?.startDate && selectedContract?.endDate
                ? [new Date(selectedContract.startDate), new Date(selectedContract.endDate)]
                : [],
            amount: Number(selectedContract?.amount),
            deposit: selectedContract?.deposit + "" || null,
            payedTillDayOfMonth: Number(selectedContract?.payedTillDayOfMonth),

        },
        enableReinitialize: true,
        onSubmit: (values) => {
            const updatedContract: UpdateContractDetails = {
                contractId: selectedContract!.id,
                amount: Number(values.amount),
                deposit: Number(values.deposit),
                roomId: values.roomId,
                payedTillDayOfMonth: values.payedTillDayOfMonth + "",
                startDate: values.dates?.[0]?.toISOString().split('T')[0],
                endDate: values.dates?.[1]?.toISOString().split('T')[0],
            };
            onSave.mutate({...updatedContract});
            formik.resetForm();
        },
        validationSchema: updateContractValidationSchema,
    });

    const mappedRooms = rooms?.map(room => ({label: `${room.apartment} ${room.number}`, value: room.id})) || [];

    if (!isVisible)
        return null;

    return (
        <Modal
            title="Edytuj Kontrakt"
            isOpen={isVisible}
            onClose={() => {
                formik.resetForm();
                onHide();
            }}
            content={
                <>
                    <TextField
                        formik={formik}
                        label="Osoba"
                        name="personName"
                        inputType="text"
                        disabled
                    />
                    <SelectField
                        label="Mieszkanie | Pokój"
                        options={mappedRooms}
                        name="roomId"
                        formik={formik}/>
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
                </>
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