export interface BaseUser {
    /**
     * The snowflake id of this user.
     */
    snowflake: number;

    /**
     * This user's email.
     */
    email: string;

    /**
     * This user's username.
     */
    username: string;

    /**
     * The hash to the avatar of this user, if any.
     */
    avatar: string | undefined;

    /**
     * The flags for this user.
     */
    flags: number;

    /**
     * The date this user last logged in.
     */
    lastLogin: Date;

    /**
     * The date this user was created.
     */
    created: Date;
}
