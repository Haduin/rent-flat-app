import {useMemo, useState} from "react";
import {Column} from "primereact/column";
import {InputText} from "primereact/inputtext";
import {IconField} from "primereact/iconfield";
import {InputIcon} from "primereact/inputicon";
import {Checkbox} from "primereact/checkbox";
import usePersonTable from "../../../src/pages/person/person-table/person-table.hook.tsx";
import AddNewPersonDialog from "../../../src/pages/person/add-new-person-dialog/add-new-person-dialog.tsx";
import EditPersonDialog from "../../../src/pages/person/edit-person-dialog/edit-person-dialog.tsx";
import type {Person} from "../../../src/pages/person/person-table/person-table.types.ts";
import type {PersonDTO} from "../../../src/api/generated";
import {PageHeader} from "../../components/ui/PageHeader.tsx";
import {Card} from "../../components/ui/Card.tsx";
import {DataTableCard} from "../../components/ui/DataTableCard.tsx";
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
            {"RESIDENT" === person.status ? "Aktualny" : person.status}
        </Badge>
    );

    const actionsBody = (person: PersonDTO) => (
        <div style={{display: "flex", gap: 6, justifyContent: "flex-end"}}>
            <Button variant="secondary" size="small" icon="pi pi-pencil" onClick={() => openEditDialog(person as Person)}/>
            <Button variant="danger-outline" size="small" icon="pi pi-trash" disabled onClick={() => handleDeletePerson(person as Person)}/>
        </div>
    );

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

            <Card padding={20} style={{display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12}}>
                <IconField iconPosition="left" className="ku-search-input">
                    <InputIcon className="pi pi-search"/>
                    <InputText
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Szukaj po imieniu, nazwisku, dokumencie..."
                        style={{width: "100%"}}
                    />
                </IconField>
                <label style={{display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 500, cursor: "pointer"}}>
                    <Checkbox checked={showOnlyActivePeople} onChange={() => setShowOnlyActivePeople(!showOnlyActivePeople)}/>
                    Pokaż tylko aktualnych
                </label>
            </Card>

            <DataTableCard value={people} loading={loading} emptyMessage="Brak danych do wyświetlenia">
                <Column field="firstName" header="Imię" sortable/>
                <Column field="lastName" header="Nazwisko" sortable/>
                <Column field="documentNumber" header="Numer dokumentu" sortable/>
                <Column field="nationality" header="Narodowość" sortable/>
                <Column header="Status" body={statusBody} sortable field="status"/>
                <Column header="" body={actionsBody} style={{width: 110}}/>
            </DataTableCard>

            <AddNewPersonDialog
                visible={isNewPersonDialogVisible}
                onSave={handleAddPerson}
                onHide={() => setIsNewPersonDialogVisible(false)}
            />
            {selectedPerson && (
                <EditPersonDialog
                    person={selectedPerson}
                    visible={isEditDialogVisible}
                    onSave={handleEditPerson}
                    onHide={() => setEditDialogVisible(false)}
                />
            )}
        </div>
    );
};

export default PersonsPage;
