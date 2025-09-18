import React from 'react';
import {InputText} from "primereact/inputtext";
import {FormikProps} from "formik";


export type InputType = 'text' | 'number';

interface TextFieldProps {
    name: string;
    label: string;
    disabled?: boolean;
    inputType?: InputType;
    formik: FormikProps<any>; //todo poprawienie tego typu na jakiś generyk z komponentu przekazanego, np validationSchema??
}

export const TextField: React.FC<TextFieldProps> = ({
                                                        name, label, disabled, formik, inputType = 'text'
                                                    }) => {


    return (
        <div className="my-4 flex flex-col">
            <label className="mr-2" htmlFor={label}>{label}</label>
            <InputText
                disabled={disabled}
                id={name}
                name={name}
                value={formik.values[name]}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                type={inputType}
                className={formik.touched[name] && formik.errors[name] ? 'p-invalid' : 'w-full'}
            />
            {formik.touched[name] && formik.errors[name] && (
                //@ts-ignore
                <small className="p-error">{formik.errors[name]}</small>
            )}
        </div>
    );
};