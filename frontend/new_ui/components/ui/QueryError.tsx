import {useEffect, useState} from "react";
import {Card} from "./Card.tsx";
import {Button} from "./Button.tsx";
import {apiErrorMessage} from "../../../src/utils/api-error.ts";
import {isNullable} from "../../../src/utils/typeguards";

export interface QueryErrorProps {
    message: string;
    onRetry: () => void;
    /** When given, its `ApiError` message replaces `message` once read. */
    error?: unknown;
}

/** What a page shows instead of an endless spinner when its data didn't load. */
export const QueryError = ({message, onRetry, error}: QueryErrorProps) => {
    const [shownMessage, setShownMessage] = useState(message);

    useEffect(() => {
        setShownMessage(message);
        if (isNullable(error)) {
            return;
        }
        let active = true;
        apiErrorMessage(error, message).then((resolved) => {
            if (active) {
                setShownMessage(resolved);
            }
        });
        return () => {
            active = false;
        };
    }, [error, message]);

    return (
        <Card padding="lg" contentStyle={{display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "var(--ku-space-3)"}}>
            <p role="alert" style={{margin: 0, fontWeight: 500}}>{shownMessage}</p>
            <Button variant="secondary" icon="pi pi-refresh" onClick={onRetry}>Spróbuj ponownie</Button>
        </Card>
    );
};
