import {ReactNode, useId} from "react";
import {FormikProps} from "formik";
import {InputText} from "primereact/inputtext";
import {InputNumber} from "primereact/inputnumber";
import {InputTextarea} from "primereact/inputtextarea";
import {Calendar} from "primereact/calendar";
import {Dropdown} from "primereact/dropdown";
import {Checkbox} from "primereact/checkbox";
import {SelectButton} from "primereact/selectbutton";

interface BaseFieldProps<V> {
    formik: FormikProps<V>;
    name: keyof V & string;
    label: string;
    hint?: string;
    disabled?: boolean;
}

export interface FieldOption<T> {
    label: string;
    value: T;
}

const useFieldState = <V, >({formik, name}: Pick<BaseFieldProps<V>, "formik" | "name">) => {
    const id = useId();
    const touched = Boolean(formik.touched[name]);
    const rawError = formik.errors[name];
    const error = touched && rawError ? String(rawError) : undefined;
    const describedBy = [error ? `${id}-error` : null].filter(Boolean).join(" ") || undefined;
    return {
        id,
        error,
        a11y: {"aria-invalid": Boolean(error), "aria-describedby": describedBy},
        touch: () => formik.setFieldTouched(name, true),
        set: (value: unknown) => formik.setFieldValue(name, value),
    };
};

const FieldShell = ({id, label, hint, error, children}: {
    id: string;
    label: string;
    hint?: string;
    error?: string;
    children: ReactNode;
}) => (
    <div className="ku-field">
        <label htmlFor={id} className="ku-field-label">{label}</label>
        {children}
        {hint && !error && <small className="ku-field-hint">{hint}</small>}
        {error && <small id={`${id}-error`} className="ku-field-error">{error}</small>}
    </div>
);

export const TextField = <V, >(props: BaseFieldProps<V> & { autoComplete?: string }) => {
    const {formik, name, label, hint, disabled, autoComplete = "off"} = props;
    const {id, error, a11y, touch, set} = useFieldState(props);
    return (
        <FieldShell id={id} label={label} hint={hint} error={error}>
            <InputText
                id={id}
                value={String(formik.values[name] ?? "")}
                onChange={(event) => set(event.target.value)}
                onBlur={touch}
                disabled={disabled}
                invalid={Boolean(error)}
                autoComplete={autoComplete}
                {...a11y}
            />
        </FieldShell>
    );
};

export const TextAreaField = <V, >(props: BaseFieldProps<V>) => {
    const {formik, name, label, hint, disabled} = props;
    const {id, error, a11y, touch, set} = useFieldState(props);
    return (
        <FieldShell id={id} label={label} hint={hint} error={error}>
            <InputTextarea
                id={id}
                value={String(formik.values[name] ?? "")}
                onChange={(event) => set(event.target.value)}
                onBlur={touch}
                disabled={disabled}
                invalid={Boolean(error)}
                autoResize
                rows={2}
                {...a11y}
            />
        </FieldShell>
    );
};

/** Money in złoty: Polish decimal comma, numeric keyboard on phones. Value is a number or null. */
export const AmountField = <V, >(props: BaseFieldProps<V>) => {
    const {formik, name, label, hint, disabled} = props;
    const {id, error, a11y, touch, set} = useFieldState(props);
    return (
        <FieldShell id={id} label={label} hint={hint} error={error}>
            <InputNumber
                inputId={id}
                value={formik.values[name] as number | null}
                onValueChange={(event) => set(event.value ?? null)}
                onBlur={touch}
                disabled={disabled}
                invalid={Boolean(error)}
                mode="decimal"
                locale="pl-PL"
                minFractionDigits={2}
                maxFractionDigits={2}
                suffix=" zł"
                inputMode="decimal"
                {...a11y}
            />
        </FieldShell>
    );
};

export const IntegerField = <V, >(props: BaseFieldProps<V> & { min?: number; max?: number; suffix?: string }) => {
    const {formik, name, label, hint, disabled, min, max, suffix} = props;
    const {id, error, a11y, touch, set} = useFieldState(props);
    return (
        <FieldShell id={id} label={label} hint={hint} error={error}>
            <InputNumber
                inputId={id}
                value={formik.values[name] as number | null}
                onValueChange={(event) => set(event.value ?? null)}
                onBlur={touch}
                disabled={disabled}
                invalid={Boolean(error)}
                useGrouping={false}
                min={min}
                max={max}
                suffix={suffix}
                inputMode="numeric"
                {...a11y}
            />
        </FieldShell>
    );
};

export const DateField = <V, >(props: BaseFieldProps<V>) => {
    const {formik, name, label, hint, disabled} = props;
    const {id, error, a11y, touch, set} = useFieldState(props);
    return (
        <FieldShell id={id} label={label} hint={hint} error={error}>
            <Calendar
                inputId={id}
                value={formik.values[name] as Date | null}
                onChange={(event) => set(event.value ?? null)}
                onHide={touch}
                onBlur={touch}
                disabled={disabled}
                invalid={Boolean(error)}
                locale="pl"
                dateFormat="dd.mm.yy"
                showButtonBar
                showOnFocus={false}
                showIcon
                iconPos="right"
                appendTo={document.body}
                {...a11y}
            />
        </FieldShell>
    );
};

export const SelectField = <V, T>(props: BaseFieldProps<V> & {
    options: FieldOption<T>[];
    placeholder?: string;
    emptyMessage?: string;
}) => {
    const {formik, name, label, hint, disabled, options, placeholder, emptyMessage = "Brak opcji do wyboru"} = props;
    const {id, error, a11y, touch, set} = useFieldState(props);
    return (
        <FieldShell id={id} label={label} hint={hint} error={error}>
            <Dropdown
                inputId={id}
                value={formik.values[name]}
                onChange={(event) => set(event.value)}
                onBlur={touch}
                onHide={touch}
                options={options}
                optionLabel="label"
                optionValue="value"
                placeholder={placeholder}
                emptyMessage={emptyMessage}
                disabled={disabled}
                invalid={Boolean(error)}
                filter={options.length > 8}
                appendTo={document.body}
                {...a11y}
            />
        </FieldShell>
    );
};

export const SegmentedField = <V, T>(props: BaseFieldProps<V> & { options: FieldOption<T>[] }) => {
    const {formik, name, label, hint, disabled, options} = props;
    const {id, error, set} = useFieldState(props);
    return (
        <div className="ku-field" role="group" aria-labelledby={`${id}-label`}>
            <span id={`${id}-label`} className="ku-field-label">{label}</span>
            <SelectButton
                value={formik.values[name]}
                onChange={(event) => {
                    if (event.value !== null) set(event.value);
                }}
                options={options}
                optionLabel="label"
                optionValue="value"
                allowEmpty={false}
                disabled={disabled}
            />
            {hint && !error && <small className="ku-field-hint">{hint}</small>}
            {error && <small className="ku-field-error">{error}</small>}
        </div>
    );
};

export const CheckboxField = <V, >(props: BaseFieldProps<V>) => {
    const {formik, name, label, hint, disabled} = props;
    const {id, set} = useFieldState(props);
    return (
        <div className="ku-field ku-field-checkbox">
            <Checkbox
                inputId={id}
                checked={Boolean(formik.values[name])}
                onChange={(event) => set(Boolean(event.checked))}
                disabled={disabled}
            />
            <label htmlFor={id}>{label}</label>
            {hint && <small className="ku-field-hint">{hint}</small>}
        </div>
    );
};
