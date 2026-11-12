import {Card} from "./Card.tsx";
import {Button} from "./Button.tsx";

export interface QueryErrorProps {
    message: string;
    onRetry: () => void;
}

/** What a page shows instead of an endless spinner when its data didn't load. */
export const QueryError = ({message, onRetry}: QueryErrorProps) => (
    <Card padding={24} contentStyle={{display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12}}>
        <p role="alert" style={{margin: 0, fontWeight: 500}}>{message}</p>
        <Button variant="secondary" icon="pi pi-refresh" onClick={onRetry}>Spróbuj ponownie</Button>
    </Card>
);
