export const dateToString = (date: Date): string => {
    const day = date.getDate();
    const month = date.getMonth() + 1; // months are 0-based, so add 1 to get 1-based month number
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
}