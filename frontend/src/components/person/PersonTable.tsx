import React, {useCallback} from 'react';
import {DataTable} from 'primereact/datatable';
import {Column} from 'primereact/column';
import {ProgressSpinner} from 'primereact/progressspinner';
import {Button} from "primereact/button";
import usePersonTable from "./PersonTable.hook.tsx";
import {Person} from "./PersonTable.types.ts";
import AddNewPersonDialog from "./AddNewPersonDialog.tsx";
import EditPersonDialog from "./EditPersonDialog.tsx";
import {Checkbox} from "primereact/checkbox";

const PersonTable: React.FC = () => {

    const {
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
    } = usePersonTable();

    const showPeople = useCallback(() => {
        return showOnlyActivePeople ? persons.filter((person) => person.status === 'RESIDENT') : persons
    }, [showOnlyActivePeople, persons]);

    return (
        <div className="rounded overflow-hidden shadow-lg card bg-light">
            <div className="flex flex-wrap justify-content-center gap-3">
                <div className="flex align-items-center">
                    <Button label="Dodaj najemce" severity="secondary" onClick={handleAddNewPerson} rounded/>
                    <Checkbox checked={showOnlyActivePeople}
                              onChange={() => setShowOnlyActivePeople(!showOnlyActivePeople)}/>
                    <label htmlFor="ingredient1" className="ml-2">Pokaż tylko aktualnych</label>
                </div>
            </div>


            {loading ? (
                <div className="flex justify-content-center">
                    <ProgressSpinner/>
                </div>
            ) : (
                <DataTable value={showPeople()} paginator rows={10} stripedRows>
                    <Column field="id" header="ID" sortable style={{width: '5%'}}></Column>
                    <Column field="firstName" header="Imię" sortable style={{width: '25%'}}></Column>
                    <Column field="lastName" header="Nazwisko" sortable style={{width: '25%'}}></Column>
                    <Column field="documentNumber" header="Numer Dokumentu" sortable
                            style={{width: '25%'}}></Column>
                    <Column field="nationality" header="Narodowość" sortable style={{width: '20%'}}></Column>
                    <Column
                        header="Akcje"
                        body={(rowData: Person) => (
                            <div className="flex justify-content-center ">
                                <Button
                                    label="Edytuj"
                                    icon="pi pi-pencil"
                                    className="p-button-rounded p-button-sm"
                                    onClick={() => openEditDialog(rowData)}
                                />
                                <Button
                                    label="Usuń"
                                    severity="danger"
                                    icon="pi pi-pencil"
                                    className="p-button-rounded p-button-sm"
                                    onClick={() => handleDeletePerson(rowData)}
                                />
                            </div>

                        )}
                        style={{width: '15%'}}
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