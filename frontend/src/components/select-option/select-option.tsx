import {Dropdown} from "primereact/dropdown";
import StatusTag from "../commons/status-tag/status-tag.tsx";
import {StatusSelectFieldOption, StatusSelectFieldProps} from "./select-option.types.ts";
import {useEffect, useState} from "react";

export const StatusSelectField = ({
                                      name,
                                      label,
                                      formik,
                                      options,
                                      placeholder = "Wybierz status"
                                  }: StatusSelectFieldProps) => {

    const [selectedOption, setSelectedOption] = useState<StatusSelectFieldOption | null>(null);

    useEffect(() => {
        const currentValue = formik.values[name];
        const option = options.find(opt => opt.value === currentValue);
        setSelectedOption(option || null);
    }, [options, name]);

    const optionTemplate = (option: StatusSelectFieldOption) => {
        return <StatusTag status={option.status}/>;
    };

    const valueTemplate = () => {
        if (selectedOption) {
            return <StatusTag className="ml-6" status={selectedOption.status}/>;
        }
        return <span style={{color: '#6b7280'}}>{placeholder}</span>;
    };

    const handleChange = (e: any) => {
        formik.setFieldValue(name, e.value);
    };

    return (
        <div className="mb-4">
            <label htmlFor={name} className="block text-sm font-medium text-gray-700">
                {label}
            </label>
            <Dropdown
                id={name}
                name={name}
                className="w-full rounded-md border"
                onBlur={formik.handleBlur}
                value={formik.values[name]}
                onChange={handleChange}
                options={options}
                optionLabel="label"
                optionValue="value"
                itemTemplate={optionTemplate}
                valueTemplate={valueTemplate}
                placeholder={placeholder}
            />
            {formik.touched[name] && formik.errors[name] && (
                // @ts-ignore
                <small className="p-error">{formik.errors[name]}</small>
            )}
        </div>
    );
};
