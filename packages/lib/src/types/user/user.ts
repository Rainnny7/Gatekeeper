export interface BaseUser {
    /**
     * The snowflake id of this user.
     */
    snowflake: string;

    /**
     * This user's email.
     */
    email: string;

    /**
     * The encrypted password of this user.
     */
    password: string;

    /**
     * The salt for this user's password.
     */
    passwordSalt: string;

    /**
     * The date this user last logged in.
     */
    lastLogin: Date;
}
