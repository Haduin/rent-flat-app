import {oidcSpa} from "oidc-spa/react-spa";
import {z} from "zod";
import {oidcEarlyInit} from "oidc-spa/core";

// Call this only if you don't use oidc-spa's Vite plugin.
oidcEarlyInit({BASE_URL: import.meta.env.VITE_FRONTEND_URL});

export const {
    bootstrapOidc,
    useOidc,
    getOidc,
    enforceLogin,
    // Wrap your whole application inside this component in src/main.tsx
    // Non blocking rendering is possible, see: https://docs.oidc-spa.dev/v/v10/features/non-blocking-rendering#react-spas
    OidcInitializationGate
} = oidcSpa
    .withExpectedDecodedIdTokenShape({
        // Describe the expected shape of the ID Token.
        // Think of `decodedIdToken` as your “user” object.
        // If you’re unsure what fields are available, open the console:
        // oidc-spa will log the decoded token for you.
        decodedIdTokenSchema: z.object({
            sub: z.string(),
            name: z.string(),
            picture: z.string().optional(),
            email: z.string().email().optional(),
            preferred_username: z.string().optional(),
            realm_access: z.object({roles: z.array(z.string())}).optional()
        }),
    })
    // See: https://docs.oidc-spa.dev/v/v10/features/auto-login#react-spa
    // .withAutoLogin()
    .createUtils();

/**
 * This can be called immediately or after you've fetched some remote params.
 * If you call this more than once the subsequent calls will be ignored.
 */
await bootstrapOidc(
    {
        implementation: "real",
        issuerUri: import.meta.env.VITE_KEYCLOAK_URL,
        clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID,
        idleSessionLifetimeInSeconds: 600,
        scopes: import.meta.env.VITE_OIDC_SCOPE
            ? import.meta.env.VITE_OIDC_SCOPE.split(" ")
            : ["openid", "profile", "email"],
        // Enable for detailed initialization and token lifecycle logs.
        debugLogs: true,
    }
);
