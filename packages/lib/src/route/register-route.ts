import { GatekeeperConfig } from "../types/config";
import {
    checkPasswordRequirements,
    isEmailValid,
    PasswordError,
} from "../lib/string";
import { RegisterInput } from "../types/input/register-input";
import { BaseUser } from "../types/user/user";
import { pika } from "../lib/ids";
import { scryptSync } from "crypto";
import { generateSession } from "../lib/auth";
import { BaseSession } from "../types/user/session";
import { GenericErrors } from "../types/error";
import { buildErrorResponse } from "../lib/error";
import { Ratelimiter } from "../middleware/ratelimiter";

/**
 * Configure the rate limit for this route.
 */
Ratelimiter.configRoute("/register", {
    windowMs: 1000 * 60,
    maxRequests: 10, // 10 requests per minute
});

enum RouteErrors {
    PasswordMismatch = "PASSWORD_MISMATCH",
    EmailTaken = "EMAIL_TAKEN",
}

/**
 * Handle the /login route.
 *
 * @param body the registration body
 * @param config the Gatekeeper config
 */
export const handleRegisterRoute = async (
    body: RegisterInput,
    config: GatekeeperConfig
): Promise<Response> => {
    // Validate the payload before attempting registration
    if (
        !("email" in body) ||
        !("password" in body) ||
        !("confirmedPassword" in body)
    ) {
        return buildErrorResponse(GenericErrors.InvalidPayload, 400);
    }

    // Validate the email
    if (!isEmailValid(body.email)) {
        return buildErrorResponse(GenericErrors.InvalidEmail, 400);
    }

    // Ensure the passwords match
    if (body.password !== body.confirmedPassword) {
        return buildErrorResponse(RouteErrors.PasswordMismatch, 400);
    }

    // Ensure the password meets the requirements
    const passwordError: PasswordError | undefined = checkPasswordRequirements(
        body.password,
        config.passwordRequirements
    );
    if (passwordError) {
        return buildErrorResponse(passwordError, 400);
    }

    // Check if the email is unique
    if (!(await config.adapter?.isEmailUnique(body.email))) {
        return buildErrorResponse(RouteErrors.EmailTaken, 400);
    }

    // Register the user
    const salt: string = pika.gen("salt").substring(0, 10);
    const user: BaseUser = {
        snowflake: pika.gen("user"),
        email: body.email,
        password: scryptSync(
            body.password,
            salt,
            config.passwordKeyLength
        ).toString("base64"),
        passwordSalt: salt,
    };
    await config.adapter?.createUser(user);
    const session: BaseSession = generateSession(user);
    await config.adapter?.storeSession(session);
    if (config.debug)
        console.debug(
            `User registered (user: ${JSON.stringify(user)}, session: ${JSON.stringify(session)})`
        );

    const { snowflake, user: _, ...strippedSession } = session;
    return Response.json(strippedSession);
};
