import {Dropdown} from "primereact/dropdown";
import {SelectFieldProps} from "./select-field.types.ts";


export const SelectField = ({
                                name,
                                label,
                                formik,
                                disabled,
                                options,
                            }: SelectFieldProps) => {
    return (
        <div className="">
            <label htmlFor={name} className="block text-sm font-medium">
                {label}
            </label>
            <Dropdown id={name}
                      disabled={disabled}
                      name={name}
                      className="w-full rounded-md border"
                      onBlur={formik.handleBlur}
                      value={formik.values[name]}
                      onChange={(e) => formik.setFieldValue(name, e.value)}
                      options={options}
                      emptyMessage="Brak opcji do wyboru"
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