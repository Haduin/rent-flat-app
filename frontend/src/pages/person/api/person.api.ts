import {useMutation, useQuery} from "@tanstack/react-query";
import {client} from "../../../api/client.ts";
import {PERSONS_QUERY_KEYS} from "../../../api/keys/persons.ts";
import {useToast} from "../../../components/commons/ToastProvider.tsx";
import {NewPerson, Person} from "../person-table/person-table.types.ts";
import {queryClient} from "../../../main.tsx";
import {UseCreatePersonProps} from "./person.api.props.ts";

export const useGetPersons = () => {
    return useQuery({
        queryKey: [PERSONS_QUERY_KEYS.ALL_PERSONS],
        queryFn: async () => client.personApi.getAllPersons()
    })
}


export const useCreatePerson = ({onSuccess}: UseCreatePersonProps) => {
    const {showToast} = useToast();

    return useMutation({
        mutationFn: async (person: NewPerson) => client.personApi.createPerson({
            createdPersonDTO: {
                ...person
            }
        }),
        onSuccess: async () => {
            showToast('success', 'Pomyślnie dodano nową osobę');
            await queryClient.invalidateQueries({queryKey: [PERSONS_QUERY_KEYS.ALL_PERSONS]});
            onSuccess()
        },
        onError: () => {
            console.error("Błąd podczas dodawania nowej osoby");
            showToast('error', 'Nie udało się dodać nowej osoby');
        }
    })
}

export const useEditPerson = () => {
    const {showToast} = useToast();
    return useMutation({
        mutationFn: async (person: Person) => client.personApi.updatePerson({
            id: person.id,
            updatePersonDTO: {...person}
        }),
        onSuccess: async () => {
            showToast('success', 'Pomyślnie zaktualizowano dane');
            await queryClient.invalidateQueries({queryKey: [PERSONS_QUERY_KEYS.ALL_PERSONS]})
        },
        onError: () => {
            showToast('error', 'Nie udało się zaktualizować danych');
        }
    })
}
export const useDeletePerson = () => {
    const {showToast} = useToast();
    return useMutation({
        mutationFn: (personId: number) => client.personApi.deletePerson({id: personId}),
        onSuccess: async () => {
            showToast('success', 'Pomyślnie usunięto rekord');
            await queryClient.invalidateQueries({queryKey: [PERSONS_QUERY_KEYS.ALL_PERSONS]})
        },
        onError: (error: any) => {
            showToast('error', 'Nie udało się usunąć rekordu', error.message);
        }
    })
}