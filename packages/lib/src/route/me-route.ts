import { GatekeeperConfig } from "../types/config";
import { BaseUser } from "../types/user/user";

/**
 * Handle the /@me route.
 *
 * @param accessToken the user's access token
 * @param config the Gatekeeper config
 */
export const handleMeRoute = async (
    accessToken: string,
    config: GatekeeperConfig
) => {
    const user: BaseUser | undefined =
        await config.adapter?.getUser(accessToken);
    const { password, passwordSalt, ...strippedUser } = user || {};
    return user
        ? Response.json(strippedUser)
        : Response.json({ error: "User not found" }, { status: 404 });
};
