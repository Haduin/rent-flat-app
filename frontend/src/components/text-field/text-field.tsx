import React from 'react';
import {InputText} from "primereact/inputtext";
import {FormikProps} from "formik";

interface TextFieldProps {
    name: string;
    label: string;
    disabled?: boolean;
    formik: FormikProps<any>; //todo poprawienie tego typu na jakiś generyk z komponentu przekazanego, np validationSchema??
}

export const TextField: React.FC<TextFieldProps> = ({name, label, disabled, formik}) => {
    return (
        <div className="field">
            <label htmlFor={label}>{label}</label>
            <InputText
                disabled={disabled}
                id={name}
                name={name}
                value={formik.values[name]}
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