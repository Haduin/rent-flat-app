import {useEffect, useState} from 'react';
import {apiClient} from "../../config/apiClient.ts";
import {NewPerson, Person} from "./PersonTable.types.ts";
import {confirmDialog} from "primereact/confirmdialog";
import {useToast} from "../commons/ToastProvider.tsx";

const usePersonTable = () => {
    const {showToast} = useToast()

    const [persons, setPersons] = useState<Person[]>([]);

    const [loading, setLoading] = useState<boolean>(true);
    const [showOnlyActivePeople, setShowOnlyActivePeople] = useState<boolean>(true)

    const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);

    const [isEditDialogVisible, setEditDialogVisible] = useState<boolean>(false);
    const [isNewPersonDialogVisible, setIsNewPersonDialogVisible] = useState<boolean>(false);

    const fetchPersons = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get<Person[]>('/persons');
            setPersons(response.data);
        } catch (error) {
            console.error("Wystąpił błąd podczas pobierania danych osób:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPersons();
    }, []);


    const openEditDialog = (person: Person) => {
        setSelectedPerson(person);
        setEditDialogVisible(true);
    };

    const handleEditPerson = async (peronToUpdate: Person) => {
        if (peronToUpdate) {
            try {
                console.log(selectedPerson);
                await apiClient.put(`/persons/${peronToUpdate.id}`, peronToUpdate)
                showToast('success', 'Pomyślnie zaktualizowano dane osoby.')
                await fetchPersons()
            } catch (error) {
                console.error("Błąd podczas zapisywania zmian:", error);
                showToast('error', 'nie pyko')
            } finally {
                setEditDialogVisible(false);
                setSelectedPerson(null);
            }
        }
    };

    const handleAddNewPerson = () => {
        setIsNewPersonDialogVisible(true);
    };

    const handleAddPerson = (person: NewPerson) => {
        if (person) {
            try {
                console.log(person);
                apiClient.post('/persons', person)
                    .then(() => fetchPersons())
            } catch (error) {
                console.error("Błąd podczas dodawania nowej osoby:", error);
            } finally {
                setIsNewPersonDialogVisible(false);
            }
        }
    };

    const deletePerson = (person: Person) => {
        try {
            apiClient.delete(`/persons/${person.id}`)
                .then(() => fetchPersons())
                .then(() => showToast('success', 'Pomyślnie usunięto rekord.'))

        } catch (error: any) {
            showToast('error', 'Nie udało sie usunać rekordu.', error.message)
        } finally {
            setIsNewPersonDialogVisible(false);
        }
    }

    const handleDeletePerson = (person: Person) => {
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
                deletePerson(person)
            }
        })

    }

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
