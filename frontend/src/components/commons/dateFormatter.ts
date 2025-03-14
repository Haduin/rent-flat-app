export const dateToStringFullYearMouthDay = (date: Date): string => {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    let dayString;
    if (day < 10) {
        if (month < 10) {
            dayString = `${year}-0${month}-0${day}`;
        } else {
            dayString = `${year}-${month}-0${day}`;
        }
    } else {
        if (month < 10) {
            dayString = `${year}-0${month}-${day}`;
        } else {
            dayString = `${year}-${month}-${day}`;
        }
    }
    return dayString;
}
export const dateToStringWithYearMonth = (date: Date): string => {
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    let dayString;

    if (month < 10) {
        dayString = `${year}-0${month}`;
    } else {
        dayString = `${year}-${month}`;
    }
    return dayString;
}

