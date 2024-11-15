/**
 * The input for the /login route.
 */
export type LoginInput = {
    /**
     * The email to login with, if given.
     */
    email?: string | undefined;

    /**
     * The username to login with, if given.
     */
    username?: string | undefined;

    /**
     * The password to login with.
     */
    password: string;
};
