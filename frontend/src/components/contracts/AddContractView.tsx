import {Calendar} from "primereact/calendar";
import {Dialog} from "primereact/dialog";
import {InputText} from "primereact/inputtext";
import {useFormik} from "formik";
import * as Yup from 'yup';
import {Button} from "primereact/button";
import {dateToString} from "../commons/dateFormatter.ts";
import {NewContract} from "./types.ts";

interface Props {
    isVisible: boolean;
    onHide: () => void;
    onSave: (newContract: NewContract) => void;
}

const AddContractView = ({isVisible, onHide, onSave}: Props) => {
    const formik = useFormik({
        initialValues: {
            personId: '',
            roomId: '',
            dates: [] as Date[],
            amount: ''
        },
        onSubmit: (values) => {
            console.log(values);
            console.log(dateToString(values.dates[0]) + ' - ' + dateToString(values.dates[1]));
            onSave()
            formik.resetForm();
        },
        validationSchema: Yup.object().shape({
            personId: Yup.string().required('Osoba is required'),
            roomId: Yup.string().required('Pokój is required'),
            dates: Yup.array().required('Data is required'),
            amount: Yup.number()
        })
    });
    return (
        <div className="card flex justify-content-center">
            <Dialog header="Dodaj nowy kontrakt"
                    closeOnEscape={true}
                    visible={isVisible}
                    style={{width: '50vw'}} onHide={() => {
                if (!isVisible) return;
                onHide()
            }}>
                <form onSubmit={formik.handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="personId" className="block text-sm font-medium text-gray-700">
                            Person ID
                        </label>
                        <InputText
                            id="personId"
                            name="personId"
                            value={formik.values.personId}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            className={`mt-1 block w-full rounded-md border ${
                                formik.errors.personId && formik.touched.personId ? "border-red-500" : "border-gray-300"
                            } shadow-sm focus:ring-indigo-500 focus:border-indigo-500`}
                        />
                        {formik.errors.personId && formik.touched.personId && (
                            <p className="text-red-500 text-xs mt-1">{formik.errors.personId}</p>
                        )}
                    </div>

                    <div className="mb-4">
                        <label htmlFor="roomId" className="block text-sm font-medium text-gray-700">
                            Room ID
                        </label>
                        <InputText
                            id="roomId"
                            name="roomId"
                            value={formik.values.roomId}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            className={`mt-1 block w-full rounded-md border ${
                                formik.errors.roomId && formik.touched.roomId ? "border-red-500" : "border-gray-300"
                            } shadow-sm focus:ring-indigo-500 focus:border-indigo-500`}
                        />
                        {formik.errors.roomId && formik.touched.roomId && (
                            <p className="text-red-500 text-xs mt-1">{formik.errors.roomId}</p>
                        )}
                    </div>
                    <div className="mb-4">
                        <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                            Daty
                        </label>
                        <Calendar value={formik.values.dates}
                                  id="dates"
                                  name="dates"
                                  onChange={(e) => formik.setFieldValue("dates", e.value as Date[])}
                                  selectionMode="range"
                                  readOnlyInput
                                  dateFormat="dd/mm/yy"
                                  hideOnRangeSelection/>
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
                            onBlur={formik.handleBlur}
                            className={`mt-1 block w-full rounded-md border ${
                                formik.errors.amount && formik.touched.amount ? "border-red-500" : "border-gray-300"
                            } shadow-sm focus:ring-indigo-500 focus:border-indigo-500`}
                        />
                        {formik.errors.amount && formik.touched.amount && (
                            <p className="text-red-500 text-xs mt-1">{formik.errors.amount}</p>
                        )}
                    </div>

                    <div className="mt-4">
                        <Button
                            label="Wyślij"
                            icon="pi pi-check"
                            type="submit"
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded"
                        />
                    </div>
                </form>

            </Dialog>
        </div>
    )
        ;
};

export default AddContractView;
