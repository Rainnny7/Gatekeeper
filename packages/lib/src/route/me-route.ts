import { GatekeeperConfig } from "../types/config";
import { BaseUser } from "../types/user/user";
import { GenericErrors } from "../types/error";
import { buildErrorResponse } from "../lib/error";

/**
 * Handle the /@me route.
 *
 * @param accessToken the user's access token
 * @param config the Gatekeeper config
 */
export const handleMeRoute = async (
    accessToken: string,
    config: GatekeeperConfig
): Promise<Response> => {
    const user: BaseUser | undefined =
        await config.adapter?.locateUserByAccessToken(accessToken);
    if (!user) {
        return buildErrorResponse(GenericErrors.Unauthorized, 401);
    }
    const { password, passwordSalt, ...strippedUser } = user;
    return Response.json(strippedUser);
};
