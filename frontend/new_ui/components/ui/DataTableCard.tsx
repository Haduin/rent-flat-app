import {ReactNode} from "react";
import {DataTable} from "primereact/datatable";
import {Card} from "./Card.tsx";

export interface DataTableCardProps<T> {
    value: T[] | undefined;
    loading?: boolean;
    emptyMessage: string;
    children: ReactNode;
}

/**
 * Every new_ui list page (contracts, persons, expenses, expense templates,
 * income/expense payments) wraps its DataTable in the exact same Card +
 * paginator/stripe/responsive config - this is that shared shape, so a
 * style fix (e.g. header wrapping) lands once instead of drifting per page.
 * overflowX: "auto" (not "hidden") lets a table with many columns scroll
 * horizontally on narrow viewports instead of its header cells being
 * crushed below their content width - see .p-datatable-thead th in
 * tokens.css for the matching white-space: nowrap.
 */
export const DataTableCard = <T, >({value, loading, emptyMessage, children}: DataTableCardProps<T>) => (
    <Card padding={0} style={{overflowX: "auto"}}>
        <DataTable
            // PrimeReact's DataTable requires its generic value type to extend an internal,
            // unexported Record<string, any> shape it doesn't expose for reuse here - this
            // wrapper stays generic over T for callers, so the cast is contained to this one spot.
            value={value as Record<string, unknown>[] | undefined}
            loading={loading}
            paginator
            rows={10}
            rowsPerPageOptions={[10, 20, 50]}
            stripedRows
            responsiveLayout="stack"
            breakpoint="860px"
            emptyMessage={emptyMessage}
        >
            {children}
        </DataTable>
    </Card>
);
