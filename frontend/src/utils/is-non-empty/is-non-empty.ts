import {isNullable} from "../typeguards/is-nullable.ts";

export const isNonEmpty = <Value>(
    value: Value | undefined | null | unknown,
): value is Value => {
    if (isNullable(value)) {
        return false;
    }

    if (typeof value === "number") {
        return !Number.isNaN(value);
    }

    if (Array.isArray(value)) {
        return !!value.length;
    }

    if (value instanceof Set) {
        return value.size > 0;
    }

    if (typeof value === "boolean") {
        return true;
    }

    if (value instanceof Date) {
        return true;
    }

    if (value !== null && typeof value === "object") {
        return !!Object.keys(value).length;
    }

    return false;
};
