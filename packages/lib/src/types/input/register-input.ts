/**
 * The input for the /register route.
 */
export type RegisterInput = {
    /**
     * The email to register with.
     */
    email: string;

    /**
     * The username to register with.
     */
    username: string;

    /**
     * The password to register with.
     */
    password: string;

    /**
     * The confirmed password to register with.
     */
    confirmedPassword: string;
};
