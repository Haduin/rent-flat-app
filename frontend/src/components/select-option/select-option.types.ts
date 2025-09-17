import {Status} from "../commons/types.ts";
import {FormikProps} from "formik";

export type StatusSelectFieldOption = {
    label: string;
    value: number | string;
    status: Status;
}

export type StatusSelectFieldProps = {
    label: string;
    name: string;
    options: StatusSelectFieldOption[];
    formik: FormikProps<any>;
    placeholder?: string;
}
