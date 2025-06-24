import {Calendar, CalendarSelectionMode} from "primereact/calendar";
import {FormikProps} from "formik";
import {addLocale} from "primereact/api";
import React from "react";

addLocale('pl', {
    firstDayOfWeek: 1,
    dayNames: ['Niedziela', 'Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota'],
    dayNamesShort: ['Ndz', 'Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob'],
    dayNamesMin: ['N', 'Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'Sb'],
    monthNames: ['Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec', 'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'],
    monthNamesShort: ['Sty', 'Lut', 'Mar', 'Kwi', 'Maj', 'Cze', 'Lip', 'Sie', 'Wrz', 'Paź', 'Lis', 'Gru'],
    today: 'Dzisiaj',
    dateFormat: 'yy-mm-dd',
    clear: 'Wyczyść'
});

interface DateSelectorProps {
    name: string;
    label: string;
    formik: FormikProps<any>;
    disabled?: boolean;
    selectionMode?: CalendarSelectionMode;
    onChange?: (e: any) => void;
    hideOnRangeSelection?: boolean;
}

export const DateSelector: React.FC<DateSelectorProps> = ({
                                                              name,
                                                              label,
                                                              formik,
                                                              disabled,
                                                              onChange,
                                                              selectionMode = "single",
                                                              hideOnRangeSelection = false
                                                          }) => {
    return (
        <div className="mb-4 mt-4">
            <label className="block text-sm font-medium mb-2" htmlFor={name}>
                {label}
            </label>
            <Calendar
                id={name}
                name={name}
                value={formik.values[name]}
                onChange={onChange}
                onBlur={formik.handleBlur}
                className={`w-full rounded-md ${formik.touched[name] && formik.errors[name] ? 'p-invalid' : ''}`}
                disabled={disabled}
                locale="pl"
                dateFormat="yy-mm-dd"
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
