import { BaseUser } from "../types/user/user";
import { BaseSession } from "../types/user/session";

/**
 * @template C the database client type
 */
export interface BaseAdapter<C> {
    /**
     * Invoke a connection to the database.
     */
    connect(): Promise<C | undefined>;

    /**
     * Get the user from the given access token.
     *
     * @param accessToken the access token
     */
    getUser(accessToken: string): Promise<BaseUser | undefined>;

    /**
     * Check if the given email is unique.
     *
     * @param email the email to check
     */
    isEmailUnique(email: string): Promise<boolean>;

    /**
     * Create a new user.
     *
     * @param user the user to create
     */
    createUser(user: BaseUser): Promise<void>;

    /**
     * Store a session for a user.
     *
     * @param session the session to store
     */
    storeSession(session: BaseSession): Promise<void>;
}
