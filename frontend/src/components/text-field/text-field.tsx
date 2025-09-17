import React from 'react';
import {InputText} from "primereact/inputtext";
import {FormikProps} from "formik";


export type InputType = 'text' | 'number' | 'mixed';

interface TextFieldProps {
    name: string;
    label: string;
    disabled?: boolean;
    inputType?: InputType;
    formik: FormikProps<any>; //todo poprawienie tego typu na jakiś generyk z komponentu przekazanego, np validationSchema??
}

export const TextField: React.FC<TextFieldProps> = ({name, label, disabled, formik,   inputType = 'mixed',
                                                    }) => {

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {

    const specialKeys = [
      'Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
      'Tab', 'Enter', 'Escape', 'Home', 'End', 'Control', 'Alt', 'Shift'
    ];

    if (specialKeys.includes(e.key) || e.ctrlKey || e.altKey || e.metaKey) {
      return;
    }

    if (inputType === 'number' && !/^[0-9.,]$/.test(e.key)) {
      e.preventDefault();
    } else if (inputType === 'text' && /[0-9]/.test(e.key)) {
      e.preventDefault();
    }
  };



  return (
        <div className="field">
            <label className="mr-2" htmlFor={label}>{label}</label>
            <InputText
                disabled={disabled}
                id={name}
                name={name}
                value={formik.values[name]}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                onKeyDown={handleKeyDown}
                className={formik.touched[name] && formik.errors[name] ? 'p-invalid' : 'w-full'}
            />
            {formik.touched[name] && formik.errors[name] && (
                //@ts-ignore
                <small className="p-error">{formik.errors[name]}</small>
            )}
        </div>
    );
};