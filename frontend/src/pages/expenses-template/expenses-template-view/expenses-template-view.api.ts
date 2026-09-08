import {useMutation} from "@tanstack/react-query"
import {useToast} from "../../../components/commons/ToastProvider.tsx";
import {client} from "../../../api/client.ts";

export const useDeleteTemplate = () => {
    const {showToast} = useToast();
    return useMutation({
        mutationFn: async () => {
            client.expenseTemplatesApi.
        },
        onSuccess: () => {
        },
        onError: () => {
        },
    })

}