import {useEffect, useMemo} from "react";
import {FormikProps} from "formik";
import {SegmentedField, SelectField} from "./fields.tsx";
import {CostScope, CostScopeValues} from "./cost-scope.ts";
import type {ApartmentWithRooms} from "../../../src/api/generated";
import {isEqual, isNotNullable, isNull} from "../../../src/utils/typeguards";

const SCOPE_OPTIONS: { label: string; value: CostScope }[] = [
    {label: "Ogólny", value: "general"},
    {label: "Mieszkanie", value: "property"},
    {label: "Pokój", value: "room"},
];

export const CostScopeFields = <V extends CostScopeValues>({formik, apartments}: {
    formik: FormikProps<V>;
    apartments: ApartmentWithRooms[];
}) => {
    const {scope, apartmentId, roomId} = formik.values;
    const roomOptions = useMemo(
        () => apartments.find((apartment) => isEqual(apartmentId, apartment.apartmentId))?.rooms
            ?.map((room) => ({label: room.roomName, value: room.roomId})) ?? [],
        [apartments, apartmentId]
    );

    // switching apartment leaves a room from the old one selected: clear it
    useEffect(() => {
        if (isNotNullable(roomId) && apartments.length > 0 && !roomOptions.some((option) => isEqual(roomId, option.value))) {
            formik.setFieldValue("roomId", null);
        }
    }, [roomOptions]);

    return (
        <>
            <SegmentedField formik={formik} name="scope" label="Dotyczy" options={SCOPE_OPTIONS}
                            hint={"general" === scope ? "Koszt całej działalności, np. ZUS albo PIT" : undefined}/>
            {"general" !== scope && (
                <SelectField
                    formik={formik}
                    name="apartmentId"
                    label="Mieszkanie"
                    placeholder="Wybierz mieszkanie"
                    options={apartments.map((apartment) => ({label: apartment.apartmentName, value: apartment.apartmentId}))}
                />
            )}
            {"room" === scope && (
                <SelectField
                    formik={formik}
                    name="roomId"
                    label="Pokój"
                    placeholder={isNull(apartmentId) ? "Najpierw wybierz mieszkanie" : "Wybierz pokój"}
                    disabled={isNull(apartmentId)}
                    emptyMessage="To mieszkanie nie ma pokoi"
                    options={roomOptions}
                />
            )}
        </>
    );
};
