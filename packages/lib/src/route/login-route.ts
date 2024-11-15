import { GatekeeperConfig } from "../types/config";
import { isEmailValid } from "../lib/string";
import { RegisterInput } from "../types/input/register-input";
import { BaseUser } from "../types/user/user";
import { GenericErrors } from "../types/error";
import { scryptSync } from "crypto";
import { buildErrorResponse } from "../lib/error";
import { BaseSession } from "../types/user/session";
import { generateSession } from "../lib/auth";

enum RouteErrors {
    InvalidPassword = "INVALID_PASSWORD",
}

/**
 * Handle the /login route.
 *
 * @param body the login body
 * @param config the Gatekeeper config
 */
export const handleLoginRoute = async (
    body: RegisterInput,
    config: GatekeeperConfig
): Promise<Response> => {
    // Validate the payload before attempting login
    if (!("email" in body) || !("password" in body)) {
        return buildErrorResponse(GenericErrors.InvalidPayload, 400);
    }

    // Validate the email
    if (!isEmailValid(body.email)) {
        return buildErrorResponse(GenericErrors.InvalidEmail, 400);
    }

    // Locate the user by the email
    const user: BaseUser | undefined = await config.adapter?.locateUserByEmail(
        body.email
    );
    if (!user) {
        return buildErrorResponse(GenericErrors.UserNotFound, 400);
    }

    // Ensure the entered password matches the user's password
    if (
        user.password !==
        scryptSync(
            body.password,
            user.passwordSalt,
            config.passwordKeyLength
        ).toString("base64")
    ) {
        return buildErrorResponse(RouteErrors.InvalidPassword, 400);
    }

    // Login the user
    const session: BaseSession = generateSession(user);
    await config.adapter?.storeSession(session);
    if (config.debug)
        console.debug(
            `User logged in (user: ${JSON.stringify(user)}, session: ${JSON.stringify(session)})`
        );

    const { snowflake, user: _, ...strippedSession } = session;
    return Response.json(strippedSession);
};
