import React from 'react';
import {Checkbox} from 'primereact/checkbox';
import {FormikProps} from "formik";

interface CheckboxFieldProps {
    name: string;
    label: string;
    disabled?: boolean;
    formik: FormikProps<any>;
}

export const CheckboxField: React.FC<CheckboxFieldProps> = ({name, label, disabled, formik}) => {
    return (
        <div className="">
            <label className="mr-2" htmlFor={name}>{label}</label>
            <Checkbox
                disabled={disabled}
                id={name}
                name={name}
                checked={formik.values[name]}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={formik.touched[name] && formik.errors[name] ? 'p-invalid' : ''}
            />
            {formik.touched[name] && formik.errors[name] && (
                //@ts-ignore
                <small className="p-error">{formik.errors[name]}</small>
            )}
        </div>
    );
};
