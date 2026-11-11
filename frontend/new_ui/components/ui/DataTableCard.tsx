import {ReactNode} from "react";
import {DataTable} from "primereact/datatable";
import {Column} from "primereact/column";
import {Card} from "./Card.tsx";

export interface DataTableColumn<T> {
    header: string;
    /** Row property shown as-is when there is no `body`; also the sort key (dot paths like "person.lastName" work). */
    field?: string;
    body?: (row: T) => ReactNode;
    sortable?: boolean;
    /** Low-priority column: hidden on mid-size table layouts (1025–1439px), still shown in the stacked card view and on wide screens. */
    optional?: boolean;
}

export interface DataTableCardProps<T> {
    value: T[] | undefined;
    columns: DataTableColumn<T>[];
    /** Row buttons; always rendered as the last, right-aligned, content-width column. */
    rowActions?: (row: T) => ReactNode;
    loading?: boolean;
    emptyMessage: string;
}

/**
 * The only way new_ui renders a list table: Card + paginator + stacked card layout
 * below 1024px (see the matching @media blocks in tokens.css), with the actions
 * and optional-column conventions built in so every page behaves the same.
 */
export const DataTableCard = <T, >({value, columns, rowActions, loading, emptyMessage}: DataTableCardProps<T>) => (
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
            // keep in sync with the stacked-layout @media block in tokens.css
            breakpoint="1024px"
            emptyMessage={emptyMessage}
        >
            {columns.map((column) => (
                <Column
                    key={column.header}
                    header={column.header}
                    field={column.field}
                    body={column.body}
                    sortable={column.sortable}
                    headerClassName={column.optional ? "ku-col-optional" : undefined}
                    bodyClassName={column.optional ? "ku-col-optional" : undefined}
                />
            ))}
            {rowActions && (
                <Column
                    header=""
                    headerClassName="ku-col-actions"
                    bodyClassName="ku-col-actions"
                    body={(row: T) => <div className="ku-row-actions">{rowActions(row)}</div>}
                />
            )}
        </DataTable>
    </Card>
);
