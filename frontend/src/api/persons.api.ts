import {NewPerson, Person} from "../pages/person/person-table.types.ts";
import {axiosInstance} from "./api.ts";

export const personsApi: PersonsApi = {
    getPersons: () => axiosInstance.get("/persons").then(response => response.data),
    editPersonById: (personToUpdate: Person) => axiosInstance.put(`/persons/${personToUpdate.id}`, personToUpdate),
    addPerson: (person: NewPerson) => axiosInstance.post('/persons', person),
    deletePerson: (id: number) => axiosInstance.delete(`/persons/${id}`)
}

type PersonsApi = {
    getPersons: () => Promise<Person[]>,
    editPersonById: (personToUpdate: Person) => Promise<Person>,
    addPerson: (person: NewPerson) => Promise<void>,
    deletePerson: (id: number) => Promise<void>,
}