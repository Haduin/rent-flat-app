import {IconField} from "primereact/iconfield";
import {InputIcon} from "primereact/inputicon";
import {InputText} from "primereact/inputtext";

/** List filter box: magnifier icon, full width of its slot (capped by .ku-search-input). */
export const SearchInput = ({value, onChange, placeholder, ariaLabel}: {
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
    /** Spoken label; the placeholder disappears once the user types. */
    ariaLabel: string;
}) => (
    <IconField iconPosition="left" className="ku-search-input">
        <InputIcon className="pi pi-search"/>
        <InputText
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder={placeholder}
            aria-label={ariaLabel}
            className="ku-search-input-field"
        />
    </IconField>
);
