import {ReactNode} from "react";
import {KeycloakService} from "./KeycloakService.ts";

export const RenderOnAnonymous = ({children}: ReactNode[]) => (!KeycloakService.isLoggedIn()) ? children : null;

