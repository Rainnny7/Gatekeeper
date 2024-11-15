import { GatekeeperConfig } from "./types/config";
import { NextRequest } from "next/server";
import { deepMerge } from "./lib/array";
import { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { cookies } from "next/headers";
import { handleMeRoute } from "./route/me-route";
import { handleRegisterRoute } from "./route/register-route";
import { handleLoginRoute } from "./route/login-route";
import { buildErrorResponse } from "./lib/error";
import { GenericErrors } from "./types/error";

/**
 * The default config for Gatekeeper.
 */
export const defaultConfig: GatekeeperConfig = {
    endpoint: "/api",
    sessionCookieName: "gatekeeper-session",
    passwordRequirements: {
        minLength: 7,
        maxLength: 76,
        alphabet: true,
        numeric: true,
        special: true,
    },
    passwordKeyLength: 128,
    routes: {
        me: "/@me",
        login: "/login",
        logout: "/logout",
    },
};

export const Gatekeeper = (customConfig: Partial<GatekeeperConfig> = {}) => {
    const config: GatekeeperConfig = deepMerge(defaultConfig, customConfig); // Combine the default and custom configs

    // Build the HTTP handler for each route
    const httpHandler = async (
        request: NextRequest,
        { params }: { params: Promise<{ slug: string }> }
    ) => {
        const action: string = (await params).slug; // The action to perform

        // Extract the access token from the request if necessary
        let accessToken: string | null = null;
        if (action !== "register" && action !== "login") {
            if (config.debug) console.debug("Looking for access token...");
            if (
                !(accessToken = request.headers.get("Authorization")) ||
                !accessToken.startsWith("Bearer ")
            ) {
                return buildErrorResponse(GenericErrors.Unauthorized, 401);
            }
            accessToken = accessToken.substring(7);
            if (config.debug)
                console.debug(`Found access token: ${accessToken}`);
        }

        // Handle each action separately
        if (config.debug)
            console.debug(
                `Handling action: ${action} (method: ${request.method})`
            );
        if (request.method === "POST") {
            let body: any | undefined;
            try {
                body = await request.json();
            } catch (error) {
                // Safely ignore the error and handle it below
            }
            if (body && config.debug)
                console.debug(`Received ${action} body:`, body);
            if (!body) {
                return buildErrorResponse(GenericErrors.InvalidPayload, 400);
            }
            if (action === "register") {
                return handleRegisterRoute(body, config);
            } else if (action === "login") {
                return handleLoginRoute(body, config);
            }
        } else if (
            request.method === "GET" &&
            action === "@me" &&
            accessToken
        ) {
            return handleMeRoute(accessToken, config);
        }
        return buildErrorResponse("Route not found", 404);
    };

    // Return the result
    return {
        GET: httpHandler,
        POST: httpHandler,

        /**
         * Invoke a request to the API to retrieve the
         * currently logged in user via the session cookie.
         */
        getUser: async (): Promise<
            | {
                  session: typeof config.sessionType;
                  user: typeof config.userType;
              }
            | undefined
        > => {
            // Extract the session from the cookie
            const sessionCookie: RequestCookie | undefined = (
                await cookies()
            ).get(config.sessionCookieName);

            let session: typeof config.sessionType | undefined;
            if (
                !sessionCookie?.value ||
                !("accessToken" in (session = JSON.parse(sessionCookie.value)))
            )
                return undefined;

            // Fetch the user from the API using the session's access token
            const response: Response = await fetch(
                `${config.endpoint}${config.routes.me}`,
                {
                    headers: {
                        Authorization: `Bearer ${session.accessToken}`,
                    },
                }
            );
            return response.status !== 200
                ? undefined
                : {
                      session,
                      user: (await response.json()) as typeof config.userType,
                  };
        },
    } as any;
};
