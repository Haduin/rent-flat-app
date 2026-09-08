import {PersonDTO} from "../../../api/generated";
import {NewContract} from "../../../components/commons/types.ts";

export interface AddContractViewProps {
    isVisible: boolean;
    onHide: () => void;
    onSave: (newContract: NewContract) => void;
    unassignedPersons: PersonDTO[];
}