import {useMutation, useQuery} from "@tanstack/react-query";
import {EXPENSES_TEMPLATE_MUTATIONS, EXPENSES_TEMPLATE_QUERIES} from "../../../api/keys/expenses-template.ts";
import {client} from "../../../api/client.ts";
import {
    CreateExpenseTemplateRequest,
    OperationalExpenseTemplateResponse,
    UpdateExpenseTemplateRequest
} from "../../../api/generated";
import {AddExpenseTemplateProps, EditExpenseTemplateProps} from "./expenses-template.api.props.ts";
import {useToast} from "../../../components/commons/ToastProvider.tsx";
import {queryClient} from "../../../main.tsx";

export const getExpensesTemplate = () => {
    return useQuery<OperationalExpenseTemplateResponse[]>({
        queryKey: [EXPENSES_TEMPLATE_QUERIES.ALL_EXPENSES_TEMPLATE],
        queryFn: () => client.expenseTemplatesApi.getExpenseTemplates(),
    })
}


export const addExpensesTemplate = ({
                                        onSuccess,
                                    }: AddExpenseTemplateProps) => {
    const {showToast} = useToast();
    return useMutation({
        mutationKey: [
            EXPENSES_TEMPLATE_MUTATIONS.ADD_EXPENSE_TEMPLATE,
            EXPENSES_TEMPLATE_QUERIES.ALL_EXPENSES_TEMPLATE
        ],
        mutationFn: (
            createExpenseTemplateRequest: CreateExpenseTemplateRequest
        ) => client.expenseTemplatesApi.createExpenseTemplate(createExpenseTemplateRequest),
        onSuccess: async () => {
            await queryClient.invalidateQueries({queryKey: [EXPENSES_TEMPLATE_QUERIES.ALL_EXPENSES_TEMPLATE]});
            showToast('success', 'Poprawnie dodano szablon')
            onSuccess();
        },
        onError: () => {
            showToast('error', 'Nie udalo dodać szablonu wydatku')
        },
    })
}


export const editExpensesTemplate = (
    {onSuccess}: EditExpenseTemplateProps
) => {
    const {showToast} = useToast();
    return useMutation({
        mutationKey: [
            EXPENSES_TEMPLATE_MUTATIONS.EDIT_EXPENSE_TEMPLATE,
            EXPENSES_TEMPLATE_QUERIES.ALL_EXPENSES_TEMPLATE
        ],
        mutationFn: (updateRequest: UpdateExpenseTemplateRequest) => client.expenseTemplatesApi.updateExpenseTemplate({
            expenseTemplateId: updateRequest.expenseTemplateId,
            updateExpenseTemplate: updateRequest.updateExpenseTemplate
        }),
        onSuccess: async () => {
            await queryClient.invalidateQueries({queryKey: [EXPENSES_TEMPLATE_QUERIES.ALL_EXPENSES_TEMPLATE]});
            showToast('success', 'Poprawnie zaktualizowano szablon')
            onSuccess();
        },
        onError: () => showToast('error', 'Wystąpił błąd podczas edycji szablonu wydatku')
    })
}