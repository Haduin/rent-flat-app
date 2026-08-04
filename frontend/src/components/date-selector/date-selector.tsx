import {Calendar, CalendarSelectionMode} from "primereact/calendar";
import {FormikProps} from "formik";
import React from "react";

interface DateSelectorProps {
    name: string;
    label: string;
    formik: FormikProps<any>;
    disabled?: boolean;
    selectionMode?: CalendarSelectionMode;
    hideOnRangeSelection?: boolean;
    dateFormat?: string;
}

export const DateSelector: React.FC<DateSelectorProps> = ({
                                                              name,
                                                              label,
                                                              formik,
                                                              disabled,
                                                              selectionMode = "single",
                                                              hideOnRangeSelection = false,
                                                              dateFormat = "yy-mm-dd"
                                                          }) => {

    return (
        <div className="">
            <label className="block text-sm font-medium mb-2" htmlFor={name}>
                {label}
            </label>
            <Calendar
                id={name}
                name={name}
                value={formik.values[name]}
                onChange={(e) => formik.setFieldValue(name, e.value)}
                onBlur={formik.handleBlur}
                className={`w-full rounded-md ${formik.touched[name] && formik.errors[name] ? 'p-invalid' : ''}`}
                disabled={disabled}
                locale="pl"
                dateFormat={dateFormat}
                readOnlyInput
                selectionMode={selectionMode}
                hideOnRangeSelection={hideOnRangeSelection}
            />
            {formik.touched[name] && formik.errors[name] && (
                // @ts-ignore
                <small className="p-error">{formik.errors[name]}</small>
            )}
        </div>
    );
};
