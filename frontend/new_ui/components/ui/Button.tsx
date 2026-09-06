import {Button as PButton, ButtonProps as PButtonProps} from "primereact/button";

export type ButtonVariant = "primary" | "secondary" | "danger-outline" | "ghost";

export interface ButtonProps extends Omit<PButtonProps, "severity" | "outlined" | "text"> {
    variant?: ButtonVariant;
}

export const Button = ({variant = "primary", className, ...rest}: ButtonProps) => {
    switch (variant) {
        case "secondary":
            return <PButton {...rest} severity="secondary" className={className}/>;
        case "danger-outline":
            return <PButton {...rest} severity="danger" outlined className={className}/>;
        case "ghost":
            return <PButton {...rest} text className={className}/>;
        default:
            return <PButton {...rest} className={className}/>;
    }
};
