import {Calendar} from "primereact/calendar";
import {Dialog} from "primereact/dialog";
import {Dropdown} from 'primereact/dropdown';
import {InputText} from "primereact/inputtext";
import {useFormik} from "formik";
import * as Yup from 'yup';
import {Button} from "primereact/button";
import {dateToString} from "../commons/dateFormatter.ts";
import {NewContract, PersonDto} from "../commons/types.ts";

interface Props {
    isVisible: boolean;
    onHide: () => void;
    onSave: (newContract: NewContract) => void;
    unassignedPersons: PersonDto[];
}

const AddContractView = ({isVisible, onHide, onSave, unassignedPersons}: Props) => {
    const formik = useFormik({
        initialValues: {
            personId: '',
            roomId: '',
            dates: [] as Date[],
            amount: '',
            deposit: ''
        },
        onSubmit: (values) => {
            const newContract: NewContract = {
                personId: Number(values.personId),
                roomId: Number(values.roomId),
                startDate: dateToString(values.dates[0]),
                endDate: dateToString(values.dates[1]),
                amount: Number(values.amount),
                deposit: Number(values.amount)
            }
            onSave(newContract)
            formik.resetForm();
        },
        validationSchema: Yup.object().shape({
            personId: Yup.string().required('Osoba is required'),
            roomId: Yup.string().required('Pokój is required'),
            dates: Yup.array().required('Data is required'),
            amount: Yup.number(),
            deposit: Yup.number()
        })
    });
    return (
        <Dialog header="Dodaj nowy kontrakt"
                closeOnEscape={true}
                visible={isVisible}
                className="card flex justify-content-center"
                style={{width: '50vw'}}
                onHide={() => {
                    formik.resetForm();
                    onHide();
                }}>


            <form onSubmit={formik.handleSubmit}>
                <div className="mb-4">
                    <label htmlFor="personId" className="block text-sm font-medium text-gray-700">
                        Osoba
                    </label>
                    <Dropdown id="personId" name="personId" value={formik.values.personId}
                              className="w-full rounded-md border"
                              onChange={(e) => formik.setFieldValue("personId", e.value)}
                              options={unassignedPersons.map((person) => ({
                                  label: `${person.firstName} ${person.lastName}`,
                                  value: person.id
                              }))}>
                        {unassignedPersons.map((person) => (
                            <option key={person.id} label={`${person.firstName} ${person.lastName}`}
                                    value={person.id}/>))}
                    </Dropdown>
                    {formik.errors.personId && formik.touched.personId && (
                        <p className="text-red-500 text-xs mt-1">{formik.errors.personId}</p>
                    )}
                </div>

                <div className="mb-4">
                    <label htmlFor="roomId" className="block text-sm font-medium text-gray-700">
                        Pokój
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
                        Daty kontraktu
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
                <div className="mb-4">
                    <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                        Kaucja
                    </label>
                    <InputText
                        id="deposit"
                        name="deposit"
                        value={formik.values.deposit}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className={`mt-1 block w-full rounded-md border ${
                            formik.errors.amount && formik.touched.amount ? "border-red-500" : "border-gray-300"
                        } shadow-sm focus:ring-indigo-500 focus:border-indigo-500`}
                    />
                    {formik.errors.deposit && formik.touched.deposit && (
                        <p className="text-red-500 text-xs mt-1">{formik.errors.deposit}</p>
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
    )
        ;
};

export default AddContractView;
