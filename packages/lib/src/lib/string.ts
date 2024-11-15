const EMAIL_REGEX = /^[A-Za-z0-9+_.-]+@(.+)$/;
const USERNAME_REGEX = /^[a-zA-Z0-9_.]*$/;

const ALPHABET_REGEX = /[a-zA-Z]/;
const NUMERIC_REGEX = /\d/;
const SPECIAL_REGEX = /[^a-zA-Z0-9]/;

export type PasswordRequirements = {
    minLength: number;
    maxLength: number;
    alphabet: boolean;
    numeric: boolean;
    special: boolean;
};

export type PasswordError =
    | "PASSWORD_TOO_SHORT"
    | "PASSWORD_TOO_LONG"
    | "PASSWORD_MISSING_ALPHABET"
    | "PASSWORD_MISSING_NUMERIC"
    | "PASSWORD_MISSING_SPECIAL";

/**
 * Check if the given email is valid.
 *
 * @param email the email to check
 */
export const isEmailValid = (email: string): boolean => {
    return email.length > 0 && EMAIL_REGEX.test(email);
};

/**
 * Check if the given username is valid.
 *
 * @param username the username to check
 */
export const isUsernameValid = (username: string): boolean => {
    return username.length > 0 && USERNAME_REGEX.test(username);
};

/**
 * Check if the given password meets the given requirements.
 *
 * @param password the password to check
 * @param minLength the minimum password length
 * @param maxLength the maximum password length
 * @param alphabet whether the password must contain at least one alphabet character
 * @param numeric whether the password must contain at least one numeric character
 * @param special whether the password must contain at least one special character
 */
export const checkPasswordRequirements = (
    password: string,
    { minLength, maxLength, alphabet, numeric, special }: PasswordRequirements
): PasswordError | undefined => {
    const tooShort: boolean = password.length < minLength;
    if (password.length < minLength || password.length > maxLength) {
        return tooShort ? "PASSWORD_TOO_SHORT" : "PASSWORD_TOO_LONG";
    }
    if (alphabet && !ALPHABET_REGEX.test(password)) {
        return "PASSWORD_MISSING_ALPHABET";
    }
    if (numeric && !NUMERIC_REGEX.test(password)) {
        return "PASSWORD_MISSING_NUMERIC";
    }
    if (special && !SPECIAL_REGEX.test(password)) {
        return "PASSWORD_MISSING_SPECIAL";
    }
    return undefined; // Password meets the requirements
};
