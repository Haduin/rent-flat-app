import {FormikProps} from "formik";
import {PaymentStatus} from "../../api/generated";

export type StatusSelectFieldOption = {
    label: string;
    value: number | string;
    status: PaymentStatus;
}

export type StatusSelectFieldProps = {
    label: string;
    name: string;
    options: StatusSelectFieldOption[];
    formik: FormikProps<any>;
    placeholder?: string;
}
