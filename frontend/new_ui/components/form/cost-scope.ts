import * as Yup from "yup";

export type CostScope = "general" | "property" | "room";

export interface CostScopeValues {
    scope: CostScope;
    apartmentId: number | null;
    roomId: number | null;
}

export const costScopeSchema = {
    apartmentId: Yup.number().nullable().when("scope", {
        is: (scope: CostScope) => "general" !== scope,
        then: (field) => field.required("Wybierz mieszkanie"),
    }),
    roomId: Yup.number().nullable().when("scope", {
        is: (scope: CostScope) => "room" === scope,
        then: (field) => field.required("Wybierz pokój"),
    }),
};

/** The ids to send: a narrower scope drops the ids its wider choice left selected. */
export const costScopeIds = ({scope, apartmentId, roomId}: CostScopeValues) => ({
    apartmentId: "general" === scope ? null : apartmentId,
    roomId: "room" === scope ? roomId : null,
});
