import {ReactNode} from "react";
import {KeycloakService} from "./KeycloakService.ts";

export const RenderOnAuthenticated = ({children}: ReactNode[]) => (KeycloakService.isLoggedIn()) ? children : null;

