import {Dialog} from "primereact/dialog";
import {useFormik} from "formik";
import * as Yup from 'yup';
import {TextField} from "../../components/text-field/text-field.tsx";
import {CheckboxField} from "../../components/checkbox/checkbox.tsx";
import {DateSelector} from "../../components/date-selector/date-selector.tsx";
import {Button} from "primereact/button";
import {dateToStringFullYearMouthDay} from "../../components/commons/dateFormatter.ts";
import {DeleteContractFormikValues, DisableContractModalProps} from "./contract.types.ts";


const DeleteContractModal = ({isVisible, onHide, selectedContract, onConfirm}: DisableContractModalProps) => {

    const formik = useFormik<DeleteContractFormikValues>({
        initialValues: {
            description: '',
            terminationDate: new Date(),
            depositReturned: false,
            positiveCancel: false,
        },
        validationSchema: Yup.object().shape({
            description: Yup.string(),
            terminationDate: Yup.date(),
            depositReturned: Yup.boolean(),
            positiveCancel: Yup.boolean(),
        }),
        onSubmit: (values) => {
            onConfirm.mutate({
                details: {
                    contractId: selectedContract?.id!!,
                    depositReturned: values.depositReturned,
                    terminationDate: dateToStringFullYearMouthDay(values.terminationDate),
                    description: values.description,
                    positiveCancel: values.positiveCancel
                }
            });
        }
    })

    return <Dialog header="Czy chcesz zakończyć kontrakt?"
                   closeOnEscape={true}
                   visible={isVisible}
                   className="card flex justify-content-center"
                   style={{width: '50vw'}}
                   onHide={onHide}
    >
        <form onSubmit={formik.handleSubmit}>
            <div className="m-4">
                <DateSelector name="terminationDate" label="Data zakończenia kontraktu" formik={formik}/>
                <TextField name="description" label="Opis" formik={formik}/>
                <div className="flex justify-content-between">
                    <CheckboxField name="depositReturned" label="Kaucja zwrócona" formik={formik}/>
                    <CheckboxField name="positiveCancel" label="Zakończono polubownie" formik={formik}/>
                </div>
            </div>
            <div className="mt-4">
                <Button
                    label="Zatwierdz"
                    icon="pi pi-check"
                    type="submit"
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded"
                />
            </div>
        </form>
    </Dialog>

};

export default DeleteContractModal;
