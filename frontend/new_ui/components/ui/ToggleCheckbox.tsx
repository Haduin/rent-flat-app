import {useId} from "react";
import {Checkbox} from "primereact/checkbox";

/** Stand-alone on/off filter with its label as the click target (form fields use CheckboxField). */
export const ToggleCheckbox = ({checked, onChange, label}: {
    checked: boolean;
    onChange: (checked: boolean) => void;
    label: string;
}) => {
    const id = useId();
    return (
        <span className="ku-toggle-checkbox">
            <Checkbox inputId={id} checked={checked} onChange={(event) => onChange(Boolean(event.checked))}/>
            <label htmlFor={id}>{label}</label>
        </span>
    );
};
