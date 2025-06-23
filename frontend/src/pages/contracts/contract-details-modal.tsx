import {Dialog} from "primereact/dialog";
import {Button} from "primereact/button";
import {ContractDto} from "../../components/commons/types.ts";
import {mapContractStatus} from "../../commons/mappers.ts";

interface ContractDetailsModalProps {
    visible: boolean;
    onHide: () => void;
    selectedContract: ContractDto | null;
}

const ContractDetailsModal = ({
                                  visible,
                                  onHide,
                                  selectedContract,
                              }: ContractDetailsModalProps) => {

    return (
        <Dialog header="Szczegóły kontraktu"
                closeOnEscape={true}
                visible={visible}
                className="card flex justify-content-center"
                style={{width: '50vw'}}
                onHide={onHide}>

            {selectedContract && (

                <div className="p-4">
                    <div className="mb-4">
                        <div className="mt-2 border-t border-gray-200">
                            <dl className="divide-y divide-gray-200">
                                <div className="py-3 grid grid-cols-3">
                                    <dt className="text-sm font-medium text-gray-500">ID</dt>
                                    <dd className="text-sm text-gray-900 col-span-2">{selectedContract.id}</dd>
                                </div>
                                <div className="py-3 grid grid-cols-3">
                                    <dt className="text-sm font-medium text-gray-500">Osoba</dt>
                                    <dd className="text-sm text-gray-900 col-span-2">
                                        {selectedContract.person ?
                                            `${selectedContract.person.firstName} ${selectedContract.person.lastName}` :
                                            'Brak danych'}
                                    </dd>
                                </div>
                                <div className="py-3 grid grid-cols-3">
                                    <dt className="text-sm font-medium text-gray-500">Mieszkanie | Pokój</dt>
                                    <dd className="text-sm text-gray-900 col-span-2">
                                        {selectedContract.room ?
                                            `${selectedContract.room.apartment} ${selectedContract.room.number}` :
                                            'Brak danych'}
                                    </dd>
                                </div>
                                <div className="py-3 grid grid-cols-3">
                                    <dt className="text-sm font-medium text-gray-500">Data rozpoczęcia</dt>
                                    <dd className="text-sm text-gray-900 col-span-2">{selectedContract.startDate}</dd>
                                </div>
                                <div className="py-3 grid grid-cols-3">
                                    <dt className="text-sm font-medium text-gray-500">Data zakończenia</dt>
                                    <dd className="text-sm text-gray-900 col-span-2">{selectedContract.endDate}</dd>
                                </div>
                                <div className="py-3 grid grid-cols-3">
                                    <dt className="text-sm font-medium text-gray-500">Kwota</dt>
                                    <dd className="text-sm text-gray-900 col-span-2">{selectedContract.amount} zł</dd>
                                </div>
                                <div className="py-3 grid grid-cols-3">
                                    <dt className="text-sm font-medium text-gray-500">Kaucja</dt>
                                    <dd className="text-sm text-gray-900 col-span-2">{selectedContract.deposit} zł</dd>
                                </div>
                                <div className="py-3 grid grid-cols-3">
                                    <dt className="text-sm font-medium text-gray-500">Status</dt>
                                    <dd className="text-sm text-gray-900 col-span-2">
                                        {mapContractStatus(selectedContract.status) || 'Brak danych'}
                                    </dd>
                                </div>
                                <div className="py-3 grid grid-cols-3">
                                    <dt className="text-sm font-medium text-gray-500">Data zakończenia umowy</dt>
                                    <dd className="text-sm text-gray-900 col-span-2">
                                        {selectedContract.terminationDate || 'Brak danych'}
                                    </dd>
                                </div>
                                <div className="py-3 grid grid-cols-3">
                                    <dt className="text-sm font-medium text-gray-500">Data wpłaty</dt>
                                    <dd className="text-sm text-gray-900 col-span-2">
                                        {selectedContract.payedDate || 'Brak danych'}
                                    </dd>
                                </div>
                                <div className="py-3 grid grid-cols-3">
                                    <dt className="text-sm font-medium text-gray-500">Opis</dt>
                                    <dd className="text-sm text-gray-900 col-span-2">
                                        {selectedContract.description || 'Brak danych'}
                                    </dd>
                                </div>

                            </dl>
                        </div>
                    </div>
                    <div className="mt-4 flex justify-end">
                        <Button
                            label="Zamknij"
                            icon="pi pi-times"
                            onClick={onHide}
                            className="p-button-outlined"
                        />
                    </div>
                </div>
            )}
        </Dialog>
    );
};

export default ContractDetailsModal;
