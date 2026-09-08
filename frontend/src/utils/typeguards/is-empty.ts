import {isNonEmpty} from "./is-non-empty.ts";

export const isEmpty = (value: unknown): boolean => !isNonEmpty(value);
