import {Dropdown} from "primereact/dropdown";
import {SelectFieldProps} from "./select-field.types.ts";


export const SelectField = ({
                                name,
                                label,
                                formik,
                                options,
                            }: SelectFieldProps) => {
    return (
        <div className="mb-4">
            <label htmlFor={name} className="block text-sm font-medium text-gray-700">
                {label}
            </label>
            <Dropdown id={name}
                      name={name}
                      className="w-full rounded-md border"
                      onBlur={formik.handleBlur}
                      value={formik.values[name]}
                      onChange={(e) => formik.setFieldValue(name, e.value)}
                      options={options}
            >
                {options.map((opt, index) => (
                    <option key={index} label={opt.label}
                            value={opt.value}/>))}
            </Dropdown>
            {formik.touched[name] && formik.errors[name] && (
                // @ts-ignore
                <small className="p-error">{formik.errors[name]}</small>
            )}
        </div>
    );
};