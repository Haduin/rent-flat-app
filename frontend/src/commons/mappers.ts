export const mapContractStatus = (status: string) => {
    switch (status) {
        case "TERMINATED":
            return "ZAKOŃCZONO"
        case "ACTIVE":
            return "AKTYWNY"
    }
}