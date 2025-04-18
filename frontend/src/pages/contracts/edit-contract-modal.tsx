import {Dialog} from "primereact/dialog";
import {Contract} from "../../components/commons/types.ts";

interface Props {
    visible: boolean;
    selectedContract?: Contract;
    onHide: () => void;
    onSave: () => void;
}

const EditContractModal = ({visible, onHide}: Props) => {
    return (
        <Dialog
            onHide={onHide}
            header={`Edycja kontraktu nr`}
            visible={visible}
            closeOnEscape={true}
            style={{width: '50vw'}}
        >
            <form>
                <div className="mb-4">
                    <label htmlFor="personId" className="block text-sm font-medium text-gray-700">
                        Tu bedzie edytowanie kontraktu
                    </label>
                </div>
            </form>
        </Dialog>
    );
};

export default EditContractModal;
