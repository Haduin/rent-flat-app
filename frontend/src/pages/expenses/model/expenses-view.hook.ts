import {useToast} from "../../../components/commons/ToastProvider.tsx";
import {useQuery} from "@tanstack/react-query";
import {api} from "../../../api/api.ts";

export const useExpensesView = () => {
    const {showToast} = useToast();

    const {} = useQuery({
        queryKey: ["expenses"],
        queryFn: () => {
            api.expensesApi.fetchExpenses()
        }
    })

    return {}
}