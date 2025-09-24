import {FormikProps} from "formik";

export type SelectFieldProps = {
    label: string;
    name: string;
    options: SelectFieldOption[];
    formik: FormikProps<any>;
    disabled?: boolean;
}
export type SelectFieldOption = {
    label: string;
    value: number | string;
}