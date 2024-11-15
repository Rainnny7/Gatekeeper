import { BaseUser } from "../types/user/user";

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
}
