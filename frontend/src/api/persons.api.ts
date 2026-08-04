import {NewPerson, Person} from "../pages/person/person-table/person-table.types.ts";
import {axiosInstance} from "./expenses-template.api.ts";

import {PersonsApi} from "../generated-api/apis/PersonsApi";
import {config} from "./config.api";

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

export const personApi = new PersonsApi(config);
