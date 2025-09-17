import {FormikProps} from "formik";

export type SelectFieldProps = {
    label: string;
    name: string;
    options: SelectFieldOption[];
    formik: FormikProps<any>;
}
export type SelectFieldOption = {
    label: string;
    value: number | string;
}