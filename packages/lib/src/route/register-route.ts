import { GatekeeperConfig } from "../types/config";
import {
    checkPasswordRequirements,
    isEmailValid,
    isUsernameValid,
    PasswordError,
} from "../lib/string";
import { RegisterInput } from "../types/input/register-input";
import { BaseUser } from "../types/user/user";
import { pika } from "../lib/ids";
import { scryptSync } from "crypto";
import { generateSession } from "../lib/auth";
import { BaseSession } from "../types/user/session";

/**
 * Handle the /login route.
 *
 * @param request the request to handle
 * @param config the Gatekeeper config
 */
export const handleRegisterRoute = async (
    request: Request,
    config: GatekeeperConfig
) => {
    let body: RegisterInput | undefined;
    try {
        body = await request.json();
    } catch (error) {
        // Safely ignore the error and handle it below
    }
    if (body && config.debug) console.debug("Received body:", body);

    // Validate the payload before attempting registration
    if (
        !body ||
        !("email" in body) ||
        !("username" in body) ||
        !("password" in body) ||
        !("confirmedPassword" in body)
    ) {
        return Response.json({ error: "Invalid payload" }, { status: 400 });
    }
    // Validate the email and username
    const emailValid: boolean = isEmailValid(body.email);
    if (!emailValid || !isUsernameValid(body.username)) {
        return Response.json(
            { error: `Invalid ${!emailValid ? "email" : "username"}` },
            { status: 400 }
        );
    }
    // Ensure the passwords match
    if (body.password !== body.confirmedPassword) {
        return Response.json(
            { error: "Passwords do not match" },
            { status: 400 }
        );
    }
    // Ensure the password meets the requirements
    const passwordError: PasswordError | undefined = checkPasswordRequirements(
        body.password,
        config.passwordRequirements
    );
    if (passwordError) {
        return Response.json({ error: passwordError }, { status: 400 });
    }
    // Ensure both the email and username are unique
    if (
        !(await config.adapter?.isEmailUsernameUnique(
            body.email,
            body.username
        ))
    ) {
        return Response.json(
            { error: "Email or username is already taken" },
            { status: 400 }
        );
    }
    // Create the user based on the body
    const salt: string = pika.gen("salt").substring(0, 10);
    const user: BaseUser = {
        snowflake: pika.gen("user"),
        email: body.email,
        password: scryptSync(body.password, salt, 128).toString("base64"),
        passwordSalt: salt,
        lastLogin: new Date(),
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
