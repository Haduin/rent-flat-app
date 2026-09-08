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
            startDate: undefined as Date | undefined,
            endDate: undefined as Date | undefined,
            amount: '',
            deposit: '',
            payedDate: ''
        },
        onSubmit: (values) => {
            const newContract: NewContract = {
                personId: Number(values.personId),
                roomId: Number(values.roomId),
                startDate: dateToStringFullYearMouthDay(values.startDate!),
                endDate: dateToStringFullYearMouthDay(values.endDate!),
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
            startDate: Yup.date().required('Data rozpoczęcia jest wymagana'),
            endDate: Yup.date()
                .required('Data zakończenia jest wymagana')
                .min(Yup.ref('startDate'), 'Data zakończenia musi być późniejsza niż data rozpoczęcia'),
            amount: Yup.number().required('Kwota jest wymagana'),
            deposit: Yup.number().required('Kaucja jest wymagana'),
            payedDate: Yup.string().required('Data płatności jest wymagana'),
        })
    });


    const {data: unassignedRooms, isLoading: roomsLoading} = useUnassignedRooms({
        startDate: formik.values.startDate ? dateToStringFullYearMouthDay(formik.values.startDate) : '',
        endDate: formik.values.endDate ? dateToStringFullYearMouthDay(formik.values.endDate) : '',
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
                           options={formik.values.startDate && formik.values.endDate && unassignedRooms ? unassignedRooms.map((room) => ({
                               label: `${room.apartment} ${room.number}`,
                               value: room.id
                           })) : []}
                           disabled={unassignedRooms?.length === 0 || roomsLoading}
                           formik={formik}/>

                       <div className="flex gap-3">
                           <div className="flex-1">
                               <DateSelector
                                   formik={formik}
                                   name="startDate"
                                   label="Data rozpoczęcia"
                                   selectionMode="single"
                               />
                           </div>
                           <div className="flex-1">
                               <DateSelector
                                   formik={formik}
                                   name="endDate"
                                   label="Data zakończenia"
                                   selectionMode="single"
                               />
                           </div>
                       </div>
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
