import {Dialog} from "primereact/dialog";
import {Contract} from "../../components/commons/types.ts";
import {Button} from "primereact/button";

interface DeleteContractDialogProps {
    isVisible: boolean;
    onHide: () => void;
    onConfirm: (contractId: number) => void;
    selectedContract: Contract | null;
}

const DeleteContractDialog = ({isVisible, onHide, selectedContract, onConfirm}: DeleteContractDialogProps) => {
    return (
        <Dialog header="Potwierdź usunięcie kontraktu"
                visible={isVisible}
                style={{width: '40vw'}}
                className="card flex justify-content-center"
                onHide={() => {
                    if (!isVisible) return;
                    onHide();
                }}>
            <div className="m-0 text-center">
                <div className="mb-4">
                    <p className="text-lg font-medium">Czy na pewno chcesz usunąć ten kontrakt?</p>
                </div>
                {selectedContract && (
                    <>
                        <div className="mb-4">
                            <p className="text-sm font-medium text-gray-700">
                                Najemca: {selectedContract.person?.firstName} {selectedContract.person?.lastName}
                            </p>
                        </div>
                        <div className="mb-4">
                            <p className="text-sm font-medium text-gray-700">
                                Mieszkanie/Pokój: {selectedContract.room?.apartment} {selectedContract.room?.number}
                            </p>
                        </div>
                        <div className="mb-4">
                            <p className="text-sm font-medium text-gray-700">
                                Okres: {selectedContract.startDate} - {selectedContract.endDate}
                            </p>
                        </div>
                        <div className="mb-4">
                            <p className="text-sm font-medium text-gray-700">
                                Kwota: {selectedContract.amount}
                            </p>
                        </div>
                    </>
                )}
                <div className="flex justify-content-center gap-2 mt-4">
                    <Button
                        label="Anuluj"
                        icon="pi pi-times"
                        className="p-button-outlined p-button-secondary"
                        onClick={onHide}
                    />
                    <Button
                        label="Usuń"
                        icon="pi pi-trash"
                        severity="danger"
                        onClick={() => selectedContract && onConfirm(selectedContract.id)}
                    />
                </div>
            </div>
        </Dialog>
    );
};

export default DeleteContractDialog;