import {KeycloakService} from "./KeycloakService.ts";

export const WelcomePage = () => {
    return (
        <div className="my-5 p-5 bg-body-secondary rounded-3">
            <h1 className="text-body-emphasis">Hello Anonymous!</h1>
            <p className="lead">Please authenticate yourself!</p>
            <p>
                <button className="btn btn-lg btn-success" onClick={() => KeycloakService.doLogin()}>Login</button>
            </p>
            <p>
                <button className="btn btn-lg btn-warning">
                    Login (Gold)
                </button>
            </p>
        </div>
    );
};

