import {UseMutationResult} from "@tanstack/react-query";
import {Person} from "../person-table/person-table.types.ts";

export interface EditPersonDialogProps {
    person: Person | null;
    visible: boolean;
    onSave: UseMutationResult<void, Error, Person, unknown>,
    onHide: () => void;
}