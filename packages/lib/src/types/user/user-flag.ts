/**
 * Flags for a {@link User}.
 */
export enum UserFlag {
    /**
     * The user is disabled.
     */
    DISABLED = 1 << 0,

    /**
     * The user's email has been verified.
     */
    EMAIL_VERIFIED = 1 << 1,

    /**
     * The user has two-factor auth enabled.
     */
    TFA_ENABLED = 1 << 2,

    /**
     * The user is an administrator.
     */
    ADMINISTRATOR = 1 << 3,
}