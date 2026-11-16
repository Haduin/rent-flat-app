import {useEffect} from "react";

/** While `active`, remember what had focus; put it back once the dialog closes or unmounts. */
export const useReturnFocus = (active: boolean) => {
    useEffect(() => {
        if (!active) return;
        const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        return () => {
            requestAnimationFrame(() => {
                if (opener?.isConnected) opener.focus();
            });
        };
    }, [active]);
};
