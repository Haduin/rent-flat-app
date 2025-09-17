import {InputText} from "primereact/inputtext";
import {ContractDto, UpdateContractDetails} from "../../components/commons/types.ts";
import {Dialog} from "primereact/dialog";
import {Calendar} from "primereact/calendar";
import {Button} from "primereact/button";
import * as Yup from 'yup';
import {useFormik} from "formik";

interface UpdateContractModalProps {
    isVisible: boolean;
    onHide: () => void;
    onSave: () => void;
    selectedContract: ContractDto | null;
}

export const UpdateContractModal = ({selectedContract, isVisible, onHide, onSave}: UpdateContractModalProps) => {
    const formik = useFormik({
        initialValues: {
            personId: selectedContract?.person?.id || '',
            roomId: selectedContract?.room?.id || '',
            dates: selectedContract?.startDate && selectedContract?.endDate
                ? [new Date(selectedContract.startDate), new Date(selectedContract.endDate)]
                : [],
            amount: selectedContract?.amount || '',
            deposit: selectedContract?.deposit || '',
            payedDate: selectedContract?.payedDate || ''
        },
        enableReinitialize: true,
        onSubmit: (values) => {
            const updatedContract: UpdateContractDetails = {
                id: selectedContract!.id,
                personId: Number(values.personId),
                roomId: Number(values.roomId),
                amount: Number(values.amount),
                deposit: Number(values.deposit),
                payedTillDayOfMonth: values.payedDate,
                startDate: values.dates?.[0]?.toISOString().split('T')[0],
                endDate: values.dates?.[1]?.toISOString().split('T')[0],
                status: selectedContract!.status, // assuming the status remains unchanged, can be modified here if needed
            };

            formik.resetForm();
        },
        validationSchema: Yup.object().shape({
            personId: Yup.string().required("Osoba musi być wybrana"),
            roomId: Yup.string().required("Pokój musi być wybrany"),
            dates: Yup.array().required("Zakres dat musi zostać podany").min(2, "Zakres dat wymaga dwóch terminów"),
            amount: Yup.number().required("Kwota jest wymagana"),
            deposit: Yup.number().required("Kaucja jest wymagana"),
            payedDate: Yup.string().required("Data płatności jest wymagana")
        })
    });

    return (
        <Dialog
            header="Edytuj Kontrakt"
            visible={isVisible}
            className="card flex justify-content-center"
            style={{width: "50vw"}}
            onHide={() => {
                formik.resetForm();
                onHide();
            }}
        >
            <form onSubmit={formik.handleSubmit}>
                <div className="mb-4">
                    <label htmlFor="personId" className="block text-sm font-medium text-gray-700">
                        Osoba
                    </label>
                    <InputText
                        id="personId"
                        name="personId"
                        value={selectedContract?.person?.firstName + " " + selectedContract?.person?.lastName || ''}
                        disabled
                        className="w-full rounded-md border"
                    />
                </div>

                <div className="mb-4">
                    <label htmlFor="roomId" className="block text-sm font-medium text-gray-700">
                        Pokój
                    </label>
                    {formik.errors.roomId && formik.touched.roomId && (
                        <p className="text-red-500 text-xs mt-1">{formik.errors.roomId}</p>
                    )}
                </div>

                <div className="mb-4">
                    <label htmlFor="dates" className="block text-sm font-medium text-gray-700">
                        Daty kontraktu
                    </label>
                    <Calendar
                        value={formik.values.dates}
                        onChange={(e) => formik.setFieldValue("dates", e.value)}
                        selectionMode="range"
                        readOnlyInput
                        dateFormat="yy-mm-dd"
                        className="w-full rounded-md border"
                    />
                    {formik.errors.dates && formik.touched.dates && (
                        <p className="text-red-500 text-xs mt-1">{formik.errors.dates}</p>
                    )}
                </div>

                <div className="mb-4">
                    <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                        Kwota
                    </label>
                    <InputText
                        id="amount"
                        name="amount"
                        value={formik.values.amount}
                        onChange={formik.handleChange}
                        className="w-full rounded-md border"
                    />
                    {formik.errors.amount && formik.touched.amount && (
                        <p className="text-red-500 text-xs mt-1">{formik.errors.amount}</p>
                    )}
                </div>

                <div className="mb-4">
                    <label htmlFor="deposit" className="block text-sm font-medium text-gray-700">
                        Kaucja
                    </label>
                    <InputText
                        id="deposit"
                        name="deposit"
                        value={formik.values.deposit}
                        onChange={formik.handleChange}
                        className="w-full rounded-md border"
                    />
                    {formik.errors.deposit && formik.touched.deposit && (
                        <p className="text-red-500 text-xs mt-1">{formik.errors.deposit}</p>
                    )}
                </div>

                <div className="mb-4">
                    <label htmlFor="payedDate" className="block text-sm font-medium text-gray-700">
                        Czynsz płatny do
                    </label>
                    <InputText
                        id="payedDate"
                        name="payedDate"
                        value={formik.values.payedDate}
                        onChange={formik.handleChange}
                        className="w-full rounded-md border"
                    />
                    {formik.errors.payedDate && formik.touched.payedDate && (
                        <p className="text-red-500 text-xs mt-1">{formik.errors.payedDate}</p>
                    )}
                </div>

                <div className="mt-4">
                    <Button
                        label="Zapisz"
                        icon="pi pi-check"
                        type="submit"
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded"
                    />
                </div>
            </form>
        </Dialog>
    );
};
;