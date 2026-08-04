import {useFormik} from "formik";
import * as Yup from 'yup';
import {dateToStringFullYearMouthDay} from "../../../components/commons/dateFormatter.ts";
import {NewContract} from "../../../components/commons/types.ts";
import {Modal} from "../../../components/modal/modal.tsx";
import {SelectField} from "../../../components/select/select-field.tsx";
import {DateSelector} from "../../../components/date-selector/date-selector.tsx";
import {TextField} from "../../../components/text-field/text-field.tsx";
import {ModalFooter} from "../../../components/modal/footer/modal-footer.tsx";
import {useUnassignedRooms} from "../api/contracts.api.ts";
import {AddContractViewProps} from "./add-contract-view.props.ts";


const AddContractView = ({
                             isVisible,
                             onHide,
                             onSave,
                             unassignedPersons,
                         }: AddContractViewProps) => {

    const formik = useFormik({
        initialValues: {
            personId: '',
            roomId: '',
            dates: [] as Date[],
            amount: '',
            deposit: '',
            payedDate: ''
        },
        onSubmit: (values) => {
            const newContract: NewContract = {
                personId: Number(values.personId),
                roomId: Number(values.roomId),
                startDate: dateToStringFullYearMouthDay(values.dates[0]),
                endDate: dateToStringFullYearMouthDay(values.dates[1]),
                amount: Number(values.amount),
                deposit: Number(values.amount),
                payedDate: Number(values.payedDate),
            }
            onSave(newContract)
            formik.resetForm();
        },
        validationSchema: Yup.object().shape({
            personId: Yup.string().required('Osoba musi być wymagana'),
            roomId: Yup.string().required('Pokój jest wymagany'),
            dates: Yup.array().required('Data kontraktu jest wymagana'),
            amount: Yup.number().required('Kwota jest wymagana'),
            deposit: Yup.number().required('Kaucja jest wymagana'),
            payedDate: Yup.string().required('Data płatności jest wymagana'),
        })
    });


    const {data: unassignedRooms, isLoading: roomsLoading} = useUnassignedRooms({
        startDate: dateToStringFullYearMouthDay(formik.values.dates[0]),
        endDate: dateToStringFullYearMouthDay(formik.values.dates[1]),
    })

    if (!isVisible)
        return null;

    return (
        <Modal title="Dodaj nowy kontrakt"
               isOpen={isVisible}
               onClose={() => {
                   formik.resetForm();
                   onHide();
               }}
               content={
                   <form onSubmit={formik.handleSubmit}>

                       <SelectField label="Osoba"
                                    name="personId"
                                    formik={formik}
                                    options={unassignedPersons.map((person) => ({
                                        label: `${person.firstName} ${person.lastName}`,
                                        value: person.id
                                    }))}
                       />

                       <SelectField
                           label="Pokój" name="roomId"
                           options={formik.values.dates && unassignedRooms ? unassignedRooms.map((room) => ({
                               label: `${room.apartment} ${room.number}`,
                               value: room.id
                           })) : []}
                           disabled={unassignedRooms?.length === 0 || roomsLoading}
                           formik={formik}/>

                       <DateSelector
                           label="Data kontraktu"
                           name="dates"
                           selectionMode="range"
                           formik={formik}
                       />
                       <TextField
                           formik={formik}
                           label="Data płatności"
                           name="payedDate"
                           inputType="number"
                       />

                       <TextField
                           formik={formik}
                           label="Kwota"
                           name="amount"
                           inputType="number"
                       />

                       <TextField
                           formik={formik}
                           label="Kaucja"
                           name="deposit"
                           inputType="number"
                       />
                   </form>
               }
               footer={
                   <ModalFooter cancelLabel="Anuluj"
                                confirmLabel="Dodaj"
                                onConfirm={formik.handleSubmit}
                                onCancel={onHide}/>
               }
        />
    )
};

export default AddContractView;
