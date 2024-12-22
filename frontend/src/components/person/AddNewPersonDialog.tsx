import React, {useState} from 'react';
import {NewPerson} from "./PersonTable.types.ts";
import {Dialog} from "primereact/dialog";
import {Button} from "primereact/button";
import {InputText} from "primereact/inputtext";


interface AddPersonDialogProps {
    visible: boolean; // Czy dialog jest widoczny
    onSave: (person: NewPerson) => void; // Co zrobić po zapisaniu nowej osoby
    onHide: () => void; // Zamknięcie dialogu
}

const AddNewPersonDialog: React.FC<AddPersonDialogProps> = ({visible, onSave, onHide}) => {
    const [newPerson, setNewPerson] = useState<NewPerson>({
        firstName: '',
        lastName: '',
        documentNumber: '',
        nationality: '',
    });

    // Obsługa zmian w polu formularza
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        setNewPerson((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // Obsługa zapisywania osoby
    const handleSave = () => {
        onSave(newPerson);
        setNewPerson({firstName: '', lastName: '', documentNumber: '', nationality: ''}); // Wyczyść formularz
    };

    return (
        <Dialog
            visible={visible}
            header="Dodaj nowego najemcę"
            modal
            onHide={onHide}
            footer={
                <div>
                    <Button label="Anuluj" icon="pi pi-times" className="p-button-text" onClick={onHide}/>
                    <Button label="Zapisz" icon="pi pi-check" className="p-button-text" onClick={handleSave}/>
                </div>
            }
        >
            <div className="p-fluid">
                <div className="field">
                    <label htmlFor="firstName">Imię</label>
                    <InputText
                        id="firstName"
                        name="firstName"
                        value={newPerson.firstName}
                        onChange={handleInputChange}
                    />
                </div>
                <div className="field">
                    <label htmlFor="lastName">Nazwisko</label>
                    <InputText
                        id="lastName"
                        name="lastName"
                        value={newPerson.lastName}
                        onChange={handleInputChange}
                    />
                </div>
                <div className="field">
                    <label htmlFor="documentNumber">Numer Dokumentu</label>
                    <InputText
                        id="documentNumber"
                        name="documentNumber"
                        value={newPerson.documentNumber}
                        onChange={handleInputChange}
                    />
                </div>
                <div className="field">
                    <label htmlFor="nationality">Narodowość</label>
                    <InputText
                        id="nationality"
                        name="nationality"
                        value={newPerson.nationality}
                        onChange={handleInputChange}
                    />
                </div>
            </div>
        </Dialog>
    );
};

export default AddNewPersonDialog;