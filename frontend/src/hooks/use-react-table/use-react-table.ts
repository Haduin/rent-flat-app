import {useEffect} from "react";
import {
    PaginationState,
    RowData,
    TableOptions,
    TableState,
    useReactTable as useTanstackTable,
} from "@tanstack/react-table";
import {isNonEmpty} from "../../utils/is-non-empty";

export const DEFAULT_PAGINATION: PaginationState = {pageIndex: 0, pageSize: 10};

type UseReactTableProps<TData extends RowData> = Omit<TableOptions<TData>, "state"> & {
    state?: Partial<TableState>;
};

export const noDataCommunicate = {
    header: "Brak danych",
    description: undefined,
    hideIcon: true,
    className: "p-0",
};

export const useReactTable = <TData extends RowData>(
    props: UseReactTableProps<TData>,
) => {
    const {data, onPaginationChange, enableSorting, rowCount} = props;
    const handleEnableSorting = isNonEmpty<TData[]>(data) ? enableSorting : false;
    const canGlobalFilter = !!data.length;

    useEffect(() => {
        const shouldResetPagination = onPaginationChange && rowCount && !data.length;
        if (shouldResetPagination) {
            onPaginationChange((prev) => ({
                ...prev,
                pageIndex: DEFAULT_PAGINATION.pageIndex,
            }));
        }
    }, [rowCount, data.length, onPaginationChange]);

    return useTanstackTable({
        ...props,
        enableSorting: handleEnableSorting,
        getColumnCanGlobalFilter: () => canGlobalFilter,
    });
};
