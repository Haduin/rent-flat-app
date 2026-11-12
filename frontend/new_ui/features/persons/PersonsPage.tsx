import {useMemo, useState} from "react";
import {InputText} from "primereact/inputtext";
import {IconField} from "primereact/iconfield";
import {InputIcon} from "primereact/inputicon";
import {Checkbox} from "primereact/checkbox";
import usePersonTable from "../../../src/pages/person/person-table/person-table.hook.tsx";
import {PersonDialog} from "./PersonDialog.tsx";
import type {Person} from "../../../src/pages/person/person-table/person-table.types.ts";
import type {PersonDTO} from "../../../src/api/generated";
import {PageHeader} from "../../components/ui/PageHeader.tsx";
import {Card} from "../../components/ui/Card.tsx";
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
        <div style={{display: "flex", flexDirection: "column", gap: 20}}>
            <PageHeader
                title="Osoby"
                actions={
                    <Button variant="primary" icon={<IconPlus size={15}/>} onClick={handleAddNewPerson}>
                        Dodaj najemcę
                    </Button>
                }
            />

            <Card padding={20} contentStyle={{display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12}}>
                <IconField iconPosition="left" className="ku-search-input">
                    <InputIcon className="pi pi-search"/>
                    <InputText
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Szukaj osoby lub dokumentu…"
                        aria-label="Szukaj po imieniu, nazwisku lub numerze dokumentu"
                        style={{width: "100%"}}
                    />
                </IconField>
                <label style={{display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 500, cursor: "pointer"}}>
                    <Checkbox checked={showOnlyActivePeople} onChange={() => setShowOnlyActivePeople(!showOnlyActivePeople)}/>
                    Tylko z aktywną umową
                </label>
            </Card>

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
        </div>
    );
};

export default PersonsPage;
