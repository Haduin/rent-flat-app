export const dateToString = (date: Date): string => {
    const day = date.getDate();
    const month = date.getMonth() + 1; // months are 0-based, so add 1 to get 1-based month number
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
    console.log(dayString);
    return dayString;
}