import {isEqual, isNonEmpty, isNullable} from "./typeguards/index.ts";

export interface ApiErrorBody {
    code: string;
    message: string;
    details: string[];
}

export const isApiErrorBody = (value: unknown): value is ApiErrorBody => {
    if (isNullable(value) || "object" !== typeof value) {
        return false;
    }
    const {code, message, details} = value as Record<string, unknown>;
    return "string" === typeof code
        && "string" === typeof message
        && (isNullable(details) || Array.isArray(details));
};

export const readApiError = async (error: unknown): Promise<ApiErrorBody | undefined> => {
    const response = (error as { response?: unknown } | null)?.response;
    if (!(response instanceof Response)) {
        return undefined;
    }
    try {
        // clone: the body can be read only once, and StrictMode / QueryError re-renders read it again
        const body: unknown = await response.clone().json();
        return isApiErrorBody(body) ? {...body, details: body.details ?? []} : undefined;
    } catch {
        return undefined;
    }
};

export const apiErrorMessage = async (
    error: unknown,
    fallback = "Wystąpił nieoczekiwany błąd. Spróbuj ponownie.",
): Promise<string> => {
    const body = await readApiError(error);
    if (isNullable(body)) {
        return fallback;
    }
    if (isEqual("VALIDATION_FAILED", body.code) && isNonEmpty(body.details)) {
        return `${body.message}: ${body.details.join("; ")}`;
    }
    return body.message;
};
