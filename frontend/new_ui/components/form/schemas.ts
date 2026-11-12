import * as Yup from "yup";

export const requiredDate = (message: string) => Yup.date().nullable().required(message);

export const dateNotBefore = (startField: string, message: string) =>
    Yup.date().nullable().required("Data zakończenia jest wymagana").min(Yup.ref(startField), message);

export const positiveAmount = (requiredMessage = "Kwota jest wymagana") =>
    Yup.number().nullable().required(requiredMessage).moreThan(0, "Kwota musi być większa od zera");

export const nonNegativeAmount = (requiredMessage: string) =>
    Yup.number().nullable().required(requiredMessage).min(0, "Kwota nie może być ujemna");

export const dayOfMonth = (requiredMessage = "Dzień jest wymagany") =>
    Yup.number().nullable().required(requiredMessage).integer("Podaj pełny dzień").min(1, "Dzień od 1 do 31").max(31, "Dzień od 1 do 31");
