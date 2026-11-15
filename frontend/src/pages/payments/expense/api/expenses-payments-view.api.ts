import {queryClient} from "../../../../main.tsx";
import {client} from "../../../../api/client.ts";
import {ExpenseConfirmationDTO, NewOperationalExpenseDTO, OperationalExpenseDTO, UpdateOperationalExpenseDTO} from "../../../../api/generated";
import {useMutation, useQuery} from "@tanstack/react-query";
import {dateToStringWithYearMonth} from "../../../../components/commons/dateFormatter.ts";
import {useMemo} from "react";
import {useToast} from "../../../../components/commons/ToastProvider.tsx";
import {apiErrorMessage} from "../../../../utils/api-error.ts";
import {PAYMENTS_MUTATIONS_KEYS, PAYMENTS_QUERY_KEYS} from "../../../../api/keys/payments.ts";

export function useExpensesBySelectedMonth(dateSelected?: Date) {
    const enabled = !!dateSelected;

    const queryKey = useMemo(
        () => [PAYMENTS_QUERY_KEYS.EXPENSES_BY_MONTH_QUERY_KEY, dateSelected],
        [dateSelected],
    );

    const {data = [], isLoading} = useQuery<OperationalExpenseDTO[]>({
        queryKey,
        queryFn: () =>
            client.expensesApi.getExpenses({
                yearMonth: dateToStringWithYearMonth(dateSelected as Date),
            }),
        enabled,
    });

    return {expenses: data, isLoading};
}

export function useRemoveExpense() {
    const {showToast} = useToast();

    return useMutation({
        mutationFn: (expensesId: number) =>
            client.expensesApi.deleteExpense({id: expensesId}),
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: [PAYMENTS_QUERY_KEYS.EXPENSES_BY_MONTH_QUERY_KEY],
                refetchType: "active",
            });
            showToast("success", "Usunięcie wydatku zakończone pomyślnie");
        },
        onError: async (error) => {
            showToast("error", "Wystąpił błąd podczas usuwania wydatku", await apiErrorMessage(error));
        },
        mutationKey: [PAYMENTS_MUTATIONS_KEYS.REMOVE_EXPENSE],
    });
}

export function useUpdateExpense() {
    const {showToast} = useToast();

    return useMutation({
        mutationFn: (updateOperationalExpenseDTO: UpdateOperationalExpenseDTO) =>
            client.expensesApi.updateExpense({updateOperationalExpenseDTO}),
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: [PAYMENTS_QUERY_KEYS.EXPENSES_BY_MONTH_QUERY_KEY],
                refetchType: "active",
            });
            showToast("success", "Edycja wydatku zakończona pomyślnie");
        },
        onError: async (error) => {
            showToast("error", "Wystąpił błąd podczas edycji wydatku", await apiErrorMessage(error));
        },
    });
}

export function useConfirmExpense() {
    const {showToast} = useToast();

    return useMutation({
        mutationFn: (request: ExpenseConfirmationDTO) =>
            client.expensesApi.confirmExpense({expenseConfirmationDTO: request}),
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: [PAYMENTS_QUERY_KEYS.EXPENSES_BY_MONTH_QUERY_KEY],
                refetchType: "active",
            });
            showToast("success", "Pomyślnie potwierdzono koszt");
        },
        onError: async (error) => {
            showToast("error", "Nie udało się potwierdzić kosztu", await apiErrorMessage(error));
        },
    });
}

export function useGenerateExpensesFromTemplates(dateSelected?: Date) {
    const {showToast} = useToast();

    return useMutation({
        mutationFn: () => {
            if (!dateSelected) {
                throw new Error("dateSelected is required");
            }

            return client.expensesApi.generateExpensesFromTemplates({
                yearMonth: dateToStringWithYearMonth(dateSelected),
            });
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: [PAYMENTS_QUERY_KEYS.EXPENSES_BY_MONTH_QUERY_KEY],
                refetchType: "active",
            });
            showToast("success", "Generowanie wydatków zakończone pomyślnie");
        },
        onError: async (error) => {
            showToast("error", "Wystąpił błąd podczas generowania wydatków", await apiErrorMessage(error));
        },
    });
}

export function useAddExpense() {
    const {showToast} = useToast();

    return useMutation({
        mutationFn: (newOperationalExpenseDTO: NewOperationalExpenseDTO) =>
            client.expensesApi.createExpense({newOperationalExpenseDTO}),
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: [PAYMENTS_QUERY_KEYS.EXPENSES_BY_MONTH_QUERY_KEY],
                refetchType: "active",
            });
            showToast("success", "Dodano koszt");
        },
        onError: async (error) => {
            showToast("error", "Nie udało się dodać kosztu", await apiErrorMessage(error));
        },
    });
}
