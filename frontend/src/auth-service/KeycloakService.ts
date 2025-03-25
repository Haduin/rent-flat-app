// import Keycloak from "keycloak-js";
//
// // const initOptiosn = {
// //     realm: import.meta.env.VITE_KEYCLOAK_REALM,
// //     url: import.meta.env.VITE_KEYCLOAK_URL,
// //     clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID,
// //     "ssl-required": "external",
// //     "resource": "bookBox",
// //     "public-client": true,
// //     "confidential-port": 0
// // };
//
// const keycloak = new Keycloak({
//     "url": "https://keycloak.chodan.fun",
//     "realm": "mieszkania_realm",
//     "clientId": "mieszkanie_client_id",
// });
//
//
// const initKeycloak = (onAuthenticatedCallback: () => void) => {
//     keycloak.init({
//         onLoad: "check-sso",
//         silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
//         checkLoginIframe: false,
//         pkceMethod: "S256",
//
//     })
//         .then(() => {
//             setupTokenRefresh();
//             onAuthenticatedCallback()
//         });
// }
//
// const setupTokenRefresh = () => {
//     setInterval(async () => {
//         try {
//             const refreshed = await keycloak.updateToken(10);
//             if (refreshed) {
//                 console.log("Token refreshed");
//             } else {
//                 console.warn("Token not refreshed");
//             }
//         } catch (error) {
//             console.error("Failed to refresh token", error);
//         }
//     }, 60000);
// };
//
// const doLogin = keycloak.login;
//
// const doLogout = keycloak.logout;
//
// const getToken = () => keycloak.token;
//
// const getTokenParsed = () => keycloak.tokenParsed;
//
// const isLoggedIn = () => !!keycloak.token;
//
// const updateToken = (successCallback: () => {}) =>
//     keycloak.updateToken(5)
//         .then((refreshed) => {
//             if (refreshed) {
//                 successCallback();
//             }
//         })
//         .catch(doLogin);
//
// const getUsername = () => keycloak.tokenParsed?.preferred_username;
//
//
// export const KeycloakService = {
//     initKeycloak,
//     doLogin,
//     doLogout,
//     getToken,
//     getTokenParsed,
//     isLoggedIn,
//     getUsername,
//     updateToken
// }
