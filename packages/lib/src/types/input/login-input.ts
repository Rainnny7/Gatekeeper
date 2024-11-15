/**
 * The input for the /login route.
 */
export type LoginInput = {
    /**
     * The email to register with.
     */
    email: string;

    /**
     * The password to register with.
     */
    password: string;
};
