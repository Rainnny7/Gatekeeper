import { BaseUser } from "../types/user/user";
import { BaseSession } from "../types/user/session";

/**
 * An adapter for database interactions.
 *
 * @template C the database client type
 */
export interface BaseAdapter<C> {
    /**
     * Invoke a connection to the database.
     */
    connect(): Promise<C | undefined>;

    /**
     * Locate the user from the given access token.
     *
     * @param accessToken the access token
     */
    locateUserByAccessToken(accessToken: string): Promise<BaseUser | undefined>;

    /**
     * Locate the user with the given email.
     *
     * @param email the user's email
     */
    locateUserByEmail(email: string): Promise<BaseUser | undefined>;

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
