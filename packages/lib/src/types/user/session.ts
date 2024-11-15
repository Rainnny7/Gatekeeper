/**
 * A session of a {@link BaseUser}.
 */
export interface BaseSession {
    /**
     * The snowflake id of this session.
     */
    snowflake: string;

    /**
     * The access token for this session.
     */
    accessToken: string;

    /**
     * The refresh token for this session.
     */
    refreshToken: string;

    /**
     * The snowflake of the user this session is for.
     */
    user: string;

    /**
     * The unix time this session expires.
     */
    expires: number;
}
