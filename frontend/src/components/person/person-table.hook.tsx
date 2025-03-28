import {useCallback, useState} from 'react';
import {NewPerson, Person} from "./person-table.types.ts";
import {confirmDialog} from "primereact/confirmdialog";
import {useToast} from "../commons/ToastProvider.tsx";
import {api} from "../../api/api.ts";
import {useMutation, useQuery} from "@tanstack/react-query";
import {queryClient} from "../../main.tsx";

const usePersonTable = () => {
    const {showToast} = useToast()

    const [showOnlyActivePeople, setShowOnlyActivePeople] = useState<boolean>(true)
    const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
    const [isEditDialogVisible, setEditDialogVisible] = useState<boolean>(false);
    const [isNewPersonDialogVisible, setIsNewPersonDialogVisible] = useState<boolean>(false);

    const {data: persons, isLoading: loading} = useQuery({
        queryKey: ["persons"],
        queryFn: api.personsApi.getPersons,
    })

    const handleEditPerson = useMutation({
        mutationFn: (person: Person) => api.personsApi.editPersonById(person),
        onSuccess: async () => {
            showToast('success', 'Pomyślnie zaktualizowano dane');
            await queryClient.invalidateQueries({queryKey: ["persons"]})
        },
        onError: () => {
            showToast('error', 'Nie udało się zaktualizować danych');
        }

    })

    const openEditDialog = (person: Person) => {
        setSelectedPerson(person);
        setEditDialogVisible(true);
    };

    const handleAddNewPerson = () => {
        setIsNewPersonDialogVisible(true);
    };

    const handleAddPerson = useMutation({
        mutationFn: (person: NewPerson) => api.personsApi.addPerson(person),
        onSuccess: async () => {
            showToast('success', 'Pomyślnie dodano nową osobę');
            await queryClient.invalidateQueries({queryKey: ["persons"]});
            setIsNewPersonDialogVisible(false);
        },
        onError: (error) => {
            console.error("Błąd podczas dodawania nowej osoby:", error);
            showToast('error', 'Nie udało się dodać nowej osoby');
        }
    });

    const deletePerson = useMutation({
        mutationFn: (person: Person) => api.personsApi.deletePerson(person.id),
        onSuccess: async () => {
            showToast('success', 'Pomyślnie usunięto rekord');
            await queryClient.invalidateQueries({queryKey: ["persons"]});
        },
        onError: (error: any) => {
            showToast('error', 'Nie udało się usunąć rekordu', error.message);
        }
    });

    const handleDeletePerson = useCallback((person: Person) => {

        confirmDialog({
            message: <>
                Czy na pewno chcesz usunąć ten rekord?
                {person.firstName} {person.lastName}
            </>,
            header: 'Potwierdzenie usunięcia',
            icon: 'pi pi-info-circle',
            defaultFocus: 'reject',
            acceptClassName: 'p-button-danger',
            accept() {
                deletePerson.mutate(person);
            }
        });
    }, [deletePerson]);


    return {
        persons,
        loading,
        selectedPerson,
        isEditDialogVisible,
        openEditDialog,
        handleEditPerson,
        isNewPersonDialogVisible,
        handleAddNewPerson,
        handleAddPerson,
        setIsNewPersonDialogVisible,
        setEditDialogVisible,
        handleDeletePerson,
        showOnlyActivePeople, setShowOnlyActivePeople
    }
};

export default usePersonTable;
