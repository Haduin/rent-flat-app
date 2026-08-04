import * as Yup from 'yup';

export const updateContractValidationSchema = Yup.object().shape({
    dates: Yup.array()
        .required('Zakres dat musi zostać podany')
        .min(2, 'Zakres dat wymaga dwóch terminów'),
    amount: Yup.number().required('Kwota jest wymagana'),
    deposit: Yup.number().required('Kaucja jest wymagana'),
    payedTillDayOfMonth: Yup.string().required(
        'Data przewidywanej płatności jest wymagana'
    ),
});