import { BaseAdapter } from "../adapter/base-adapter";
import { BaseSession } from "./user/session";
import { BaseUser } from "./user/user";
import { PasswordRequirements } from "../lib/string";

/**
 * The config for Gatekeeper.
 */
export type GatekeeperConfig<
    S extends BaseSession = BaseSession,
    U extends BaseUser = BaseUser,
> = {
    /**
     * The endpoint for the Gatekeeper API.
     */
    endpoint: string;

    /**
     * The name of the cookie to use for the session.
     */
    sessionCookieName: string;

    /**
     * The adapter to use for database interactions.
     */
    adapter?: BaseAdapter<any>;

    /**
     * The type to use for sessions.
     */
    sessionType?: S;

    /**
     * The type to use for users.
     */
    userType?: U;

    /**
     * The requirements for passwords.
     */
    passwordRequirements: PasswordRequirements;

    /**
     * The paths for each route.
     */
    routes: {
        me: string;
        login: string;
        logout: string;
    };

    /**
     * Whether debugging should be enabled.
     */
    debug?: boolean;
};
