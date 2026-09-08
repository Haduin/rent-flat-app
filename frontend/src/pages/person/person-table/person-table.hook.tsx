import {useCallback, useState} from 'react';
import {Person} from "./person-table.types.ts";
import {confirmDialog} from "primereact/confirmdialog";
import {useCreatePerson, useDeletePerson, useEditPerson, useGetPersons} from "../api/person.api.ts";

const usePersonTable = () => {

    const [showOnlyActivePeople, setShowOnlyActivePeople] = useState<boolean>(true)
    const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
    const [isEditDialogVisible, setEditDialogVisible] = useState<boolean>(false);
    const [isNewPersonDialogVisible, setIsNewPersonDialogVisible] = useState<boolean>(false);

    const {data: persons, isLoading: loading} = useGetPersons()

    const handleEditPerson = useEditPerson()

    const openEditDialog = (person: Person) => {
        setSelectedPerson(person);
        setEditDialogVisible(true);
    };

    const handleAddNewPerson = () => {
        setIsNewPersonDialogVisible(true);
    };

    const handleAddPerson = useCreatePerson({
        onSuccess: () => {
            setIsNewPersonDialogVisible(false);
        }
    })

    const deletePerson = useDeletePerson()

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
                deletePerson.mutate(person.id);
            }
        });
    }, [deletePerson]);


    const showPeople = useCallback(() => {
        return showOnlyActivePeople ? persons?.filter((person) => 'RESIDENT' === person.status) : persons
    }, [showOnlyActivePeople, persons]);

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
        showOnlyActivePeople, setShowOnlyActivePeople,
        showPeople,
    }
};

export default usePersonTable;
