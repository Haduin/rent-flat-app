import {useState} from 'react';
import {ConfirmDialog} from "primereact/confirmdialog";
import {Button} from "primereact/button";


const YesNoDialog = () => {
    const [visible, setVisible] = useState(false);

    const showConfirm = () => {
        setVisible(true);
    };

    const accept = () => {
        console.log('Zaakceptowano!');
        setVisible(false);
    };

    const reject = () => {
        console.log('Odrzucono!');
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


export default YesNoDialog;
