import {Dialog} from "primereact/dialog";
import {Contract} from "./types.ts";

interface Props {
    isVisible: boolean;
    selectedContract: Contract | null
    onHide: () => void;
}

const ContractDetailsDialog = ({isVisible, selectedContract, onHide}: Props) => {


    return (
        <div className="card flex justify-content-center">
            <Dialog header="Header" visible={isVisible} style={{width: '50vw'}} onHide={() => {
                if (!isVisible) return;
                onHide()
            }}>
                <p className="m-0">
                    {selectedContract?.id}
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore
                    et dolore magna aliqua.
                    Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
                    consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat
                    nulla pariatur.
                    Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id
                    est laborum.
                </p>
            </Dialog>
        </div>
    )
}

export default ContractDetailsDialog;