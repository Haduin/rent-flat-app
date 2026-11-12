import type {ContractDTO} from "../../../src/api/generated";
import type {BadgeTone} from "../../components/ui/Badge.tsx";
import {isNotEqual} from "../../../src/utils/typeguards";

/** One status per contract: an active one past its end date is "Po terminie", not "Aktywna" + "Już się skończył". */
export const contractStatus = (contract: ContractDTO): { label: string; tone: BadgeTone; urgency: number } => {
    if (isNotEqual("ACTIVE", contract.status)) return {label: "Zakończona", tone: "ended", urgency: 3};
    if (contract.alreadyExpired) return {label: "Po terminie", tone: "danger", urgency: 0};
    if (contract.expiringSoon) return {label: "Kończy się wkrótce", tone: "warning", urgency: 1};
    return {label: "Aktywna", tone: "success", urgency: 2};
};

export const tenantName = (contract: ContractDTO | null | undefined) =>
    [contract?.person?.firstName, contract?.person?.lastName].filter(Boolean).join(" ") || "—";

export const roomLabel = (room: { apartment: string; number: string } | null | undefined) =>
    room ? `${room.apartment} · ${room.number}` : "—";
