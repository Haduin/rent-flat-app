import * as Yup from 'yup';

export const updateContractValidationSchema = Yup.object().shape({
    startDate: Yup.date().required('Data rozpoczęcia jest wymagana'),
    endDate: Yup.date()
        .required('Data zakończenia jest wymagana')
        .min(Yup.ref('startDate'), 'Data zakończenia musi być późniejsza niż data rozpoczęcia'),
    amount: Yup.number().required('Kwota jest wymagana'),
    deposit: Yup.number().required('Kaucja jest wymagana'),
    payedTillDayOfMonth: Yup.string().required(
        'Data przewidywanej płatności jest wymagana'
    ),
});