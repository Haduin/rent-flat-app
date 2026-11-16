import {SelectButton} from "primereact/selectbutton";

export interface SegmentOption<T> {
    label: string;
    value: T;
}

/** One-of-few choice shown as joined buttons (list filters, form scopes); always has a value selected. */
export const SegmentedControl = <T, >({value, onChange, options, disabled, ariaLabelledBy, className}: {
    value: T;
    onChange: (value: T) => void;
    options: SegmentOption<T>[];
    disabled?: boolean;
    ariaLabelledBy?: string;
    className?: string;
}) => (
    <SelectButton
        value={value}
        onChange={(event) => {
            if (null !== event.value) onChange(event.value as T);
        }}
        options={options}
        optionLabel="label"
        optionValue="value"
        allowEmpty={false}
        disabled={disabled}
        aria-labelledby={ariaLabelledBy}
        className={className}
    />
);
