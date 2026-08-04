import {UpdateContractDetails} from "../../../api/generated";

export const getInitialUpdateContractValues = (
    selectedContract: UpdateContractDetails | null | undefined
) => {
    return {
        personName:
            selectedContract?.person?.firstName +
            " " +
            selectedContract?.person?.lastName ||
            "",
        roomId: Number(selectedContract?.room?.id),
        dates:
            selectedContract?.startDate && selectedContract?.endDate
                ? [
                    new Date(selectedContract.startDate),
                    new Date(selectedContract.endDate),
                ]
                : [],
        amount: Number(selectedContract?.amount),
        deposit: (selectedContract?.deposit ?? "") + "",
        payedTillDayOfMonth: Number(selectedContract?.payedTillDayOfMonth),
    };
};