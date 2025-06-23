import {useEffect, useRef} from "react";

export type UseReturnModalFocusOptions = {
    keepFocus?: boolean;
    returnToLastActive?: boolean;
    isDisabled?: boolean;
};

export const useReturnModalFocus = ({
                                        keepFocus = true,
                                        returnToLastActive = true,
                                        isDisabled = false,
                                    }: UseReturnModalFocusOptions) => {
    const anchorRef = useRef<HTMLElement | null | undefined>(null);

    useEffect(() => {
        if (keepFocus && returnToLastActive && !isDisabled) {
            anchorRef.current = document.activeElement as HTMLElement;
        }

        if (!keepFocus && !isDisabled) {
            anchorRef.current?.focus();
            anchorRef.current = null;
        }
    }, [returnToLastActive, keepFocus, isDisabled]);

    return anchorRef;
};
