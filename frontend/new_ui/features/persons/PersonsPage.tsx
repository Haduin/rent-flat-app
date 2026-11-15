import {useMemo, useState} from "react";
import usePersonTable from "../../../src/pages/person/person-table/person-table.hook.tsx";
import {PersonDialog} from "./PersonDialog.tsx";
import type {Person} from "../../../src/pages/person/person-table/person-table.types.ts";
import type {PersonDTO} from "../../../src/api/generated";
import {Page} from "../../components/layout/Page.tsx";
import {FilterBar} from "../../components/ui/FilterBar.tsx";
import {SearchInput} from "../../components/ui/SearchInput.tsx";
import {ToggleCheckbox} from "../../components/ui/ToggleCheckbox.tsx";
import {DataTableCard, DataTableColumn} from "../../components/ui/DataTableCard.tsx";
import {Button} from "../../components/ui/Button.tsx";
import {Badge} from "../../components/ui/Badge.tsx";
import {IconPlus} from "../../components/ui/icons.tsx";

const PersonsPage = () => {
    const {
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
        showOnlyActivePeople,
        setShowOnlyActivePeople,
        showPeople,
    } = usePersonTable();

    const [search, setSearch] = useState("");

    const people = useMemo(() => {
        const list = showPeople() ?? [];
        if (!search.trim()) return list;
        const needle = search.trim().toLowerCase();
        return list.filter(
            (person: PersonDTO) =>
                `${person.firstName} ${person.lastName}`.toLowerCase().includes(needle) ||
                person.documentNumber?.toLowerCase().includes(needle)
        );
    }, [showPeople, search]);

    const statusBody = (person: PersonDTO) => (
        <Badge tone={"RESIDENT" === person.status ? "success" : "neutral"}>
            {"RESIDENT" === person.status ? "Aktualny" : "Bez aktywnej umowy"}
        </Badge>
    );

    const rowActions = (person: PersonDTO) => (
        <>
            <Button variant="secondary" size="small" icon="pi pi-pencil" aria-label={`Edytuj ${person.firstName} ${person.lastName}`} onClick={() => openEditDialog(person as Person)}/>
            <Button variant="danger-outline" size="small" icon="pi pi-trash" aria-label="Usuwanie osób jest niedostępne" disabled onClick={() => handleDeletePerson(person as Person)}/>
        </>
    );

    const columns: DataTableColumn<PersonDTO>[] = [
        {header: "Imię", field: "firstName", sortable: true},
        {header: "Nazwisko", field: "lastName", sortable: true},
        {header: "Numer dokumentu", field: "documentNumber", sortable: true},
        {header: "Narodowość", field: "nationality", sortable: true},
        {header: "Status", body: statusBody, sortable: true, field: "status"},
    ];

    return (
        <Page
            title="Osoby"
            actions={
                <Button variant="primary" icon={<IconPlus size={15}/>} onClick={handleAddNewPerson}>
                    Dodaj najemcę
                </Button>
            }
        >
            <FilterBar>
                <SearchInput
                    value={search}
                    onChange={setSearch}
                    placeholder="Szukaj osoby lub dokumentu…"
                    ariaLabel="Szukaj po imieniu, nazwisku lub numerze dokumentu"
                />
                <ToggleCheckbox
                    checked={showOnlyActivePeople}
                    onChange={setShowOnlyActivePeople}
                    label="Tylko z aktywną umową"
                />
            </FilterBar>

            <DataTableCard
                value={people}
                columns={columns}
                rowActions={rowActions}
                loading={loading}
                emptyMessage={search.trim() ? "Nikt nie pasuje do wyszukiwania" : "Brak osób w tym widoku"}
            />

            {isNewPersonDialogVisible && (
                <PersonDialog
                    person={null}
                    saving={handleAddPerson.isPending}
                    onSave={(values) => handleAddPerson.mutate(values, {onSuccess: () => setIsNewPersonDialogVisible(false)})}
                    onHide={() => setIsNewPersonDialogVisible(false)}
                />
            )}
            {selectedPerson && isEditDialogVisible && (
                <PersonDialog
                    person={selectedPerson}
                    saving={handleEditPerson.isPending}
                    onSave={(values) => handleEditPerson.mutate({...selectedPerson, ...values}, {onSuccess: () => setEditDialogVisible(false)})}
                    onHide={() => setEditDialogVisible(false)}
                />
            )}
        </Page>
    );
};

export default PersonsPage;
