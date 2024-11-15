/**
 * A session of a {@link BaseUser}.
 */
export interface BaseSession {
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
    user: number;

    /**
     * The unix time this session expires.
     */
    expires: number;
}
