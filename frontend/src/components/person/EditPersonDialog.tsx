import React, {useState} from 'react';
import {Button} from "primereact/button";
import {InputText} from "primereact/inputtext";
import {Dialog} from "primereact/dialog";
import {Person} from "./PersonTable.types.ts";

interface EditPersonDialogProps {
    person: Person | null;
    visible: boolean;
    onSave: (person: Person) => void;
    onHide: () => void;
}

const EditPersonDialog: React.FC<EditPersonDialogProps> = ({person, visible, onSave, onHide}) => {
    const [currentPerson, setCurrentPerson] = useState<Person | null>(person);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        setCurrentPerson((prev) => {
            if (!prev) return null;
            return {
                ...prev,
                [name]: value,
            };
        });
    };

    const handleSave = () => {
        if (currentPerson) {
            onSave(currentPerson);
        }
    };

    return (
        <Dialog
            visible={visible}
            header="Edytuj najemcę"
            modal
            onHide={onHide}
            footer={
                <div>
                    <Button label="Anuluj" icon="pi pi-times" className="p-button-text" onClick={onHide}/>
                    <Button label="Zapisz" icon="pi pi-check" className="p-button-text" onClick={handleSave}/>
                </div>
            }
        >
            {currentPerson && (
                <div className="p-fluid">
                    <div className="field">
                        <label htmlFor="firstName">Imię</label>
                        <InputText
                            id="firstName"
                            name="firstName"
                            value={currentPerson.firstName}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="field">
                        <label htmlFor="lastName">Nazwisko</label>
                        <InputText
                            id="lastName"
                            name="lastName"
                            value={currentPerson.lastName}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="field">
                        <label htmlFor="documentNumber">Numer Dokumentu</label>
                        <InputText
                            id="documentNumber"
                            name="documentNumber"
                            value={currentPerson.documentNumber}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="field">
                        <label htmlFor="nationality">Narodowość</label>
                        <InputText
                            id="nationality"
                            name="nationality"
                            value={currentPerson.nationality}
                            onChange={handleInputChange}
                        />
                    </div>
                </div>
            )}
        </Dialog>
    );
};

export default EditPersonDialog;