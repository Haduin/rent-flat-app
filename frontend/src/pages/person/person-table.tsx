import React, {useState} from 'react';
import {DataTable} from 'primereact/datatable';
import {Column} from 'primereact/column';
import {ProgressSpinner} from 'primereact/progressspinner';
import {Button} from "primereact/button";
import {Checkbox} from "primereact/checkbox";
import {InputText} from "primereact/inputtext";
import {Person} from "./person-table.types.ts";
import usePersonTable from "./person-table.hook.tsx";
import AddNewPersonDialog from "./add-new-person-dialog.tsx";
import EditPersonDialog from "./edit-person-dialog.tsx";

const PersonTable: React.FC = () => {
    const [globalFilterValue, setGlobalFilterValue] = useState<string>('');

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
        showOnlyActivePeople, setShowOnlyActivePeople,
        showPeople,
    } = usePersonTable();

    const renderHeader = () => {
        return (
            <div className="flex flex-wrap justify-content-between align-items-center">
                <div className="flex align-items-center gap-2">
                    <Button
                        label="Dodaj najemce"
                        severity="secondary"
                        onClick={handleAddNewPerson}
                        rounded
                        icon="pi pi-plus"
                        className="p-button-raised p-button-sm"
                    />
                    <div className="flex align-items-center ml-2">
                        <Checkbox
                            checked={showOnlyActivePeople}
                            onChange={() => setShowOnlyActivePeople(!showOnlyActivePeople)}
                            className="mr-1 p-checkbox-smaller"
                        />
                        <label className="ml-1 font-medium text-sm">Pokaż tylko aktualnych</label>
                    </div>
                </div>
                <div className="p-input-icon-left">
                    <i className="pi pi-search"/>
                    <InputText
                        value={globalFilterValue}
                        onChange={(e) => setGlobalFilterValue(e.target.value)}
                        placeholder="Wyszukaj..."
                    />
                </div>
            </div>
        );
    };

    return (
        <div className="rounded overflow-hidden shadow-lg card bg-light">
            {loading ? (
                <div className="flex justify-content-center p-5">
                    <ProgressSpinner/>
                </div>
            ) : (
                <DataTable
                    value={showPeople()}
                    paginator
                    rowsPerPageOptions={[5, 10, 20, 50]}
                    rows={10}
                    stripedRows
                    breakpoint="960px"
                    emptyMessage="Brak danych do wyświetlenia"
                    className="pt-2 rounded"
                    globalFilter={globalFilterValue}
                    header={renderHeader()}
                    scrollable
                    scrollHeight="calc(100vh - 220px)"
                    resizableColumns
                    columnResizeMode="fit"
                >
                    <Column field="id" header="ID" sortable headerClassName="bg-primary text-white"></Column>
                    <Column field="firstName" header="Imię" sortable headerClassName="bg-primary text-white"></Column>
                    <Column field="lastName" header="Nazwisko" sortable
                            headerClassName="bg-primary text-white"></Column>
                    <Column field="documentNumber" header="Numer Dokumentu" sortable
                            headerClassName="bg-primary text-white"></Column>
                    <Column field="nationality" header="Narodowość" sortable
                            headerClassName="bg-primary text-white"></Column>
                    <Column
                        header="Akcje"
                        headerClassName="bg-primary text-white"
                        body={(rowData: Person) => (
                            <div className="flex justify-content-center gap-2">
                                <Button
                                    icon="pi pi-pencil"
                                    className="p-button-rounded p-button-info p-button-outlined"
                                    tooltip="Edytuj"
                                    tooltipOptions={{position: 'top'}}
                                    onClick={() => openEditDialog(rowData)}
                                />
                                <Button
                                    disabled
                                    icon="pi pi-trash"
                                    severity="danger"
                                    className="p-button-rounded p-button-outlined"
                                    tooltip="Usuń"
                                    tooltipOptions={{position: 'top'}}
                                    onClick={() => handleDeletePerson(rowData)}
                                />
                            </div>
                        )}
                    ></Column>
                </DataTable>
            )}

            <AddNewPersonDialog
                visible={isNewPersonDialogVisible}
                onSave={handleAddPerson}
                onHide={() => setIsNewPersonDialogVisible(false)}
            />
            {selectedPerson && <EditPersonDialog
                person={selectedPerson}
                visible={isEditDialogVisible}
                onSave={handleEditPerson}
                onHide={() => setEditDialogVisible(false)}
            />}

        </div>
    );
};

export default PersonTable;
