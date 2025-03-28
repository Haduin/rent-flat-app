import {useState} from 'react';
import {ConfirmDialog} from "primereact/confirmdialog";
import {Button} from "primereact/button";


export const YesNoDialog = () => {
    const [visible, setVisible] = useState(false);

    const showConfirm = () => {
        setVisible(true);
    };

    const accept = () => {
        setVisible(false);
    };

    const reject = () => {
        setVisible(false);
    };

    return (
        <div>
            <ConfirmDialog
                visible={visible}
                onHide={() => setVisible(false)}
                message="Czy na pewno chcesz kontynuować?"
                header="Potwierdzenie"
                icon="pi pi-exclamation-triangle"
                accept={accept}
                reject={reject}
            />

            <Button label="Pokaż dialog" icon="pi pi-check" onClick={showConfirm}/>
        </div>
    );
};


