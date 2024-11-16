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
import { Ratelimiter, RateLimitResponse } from "./middleware/ratelimiter";

/**
 * The default config for Gatekeeper.
 */
export const defaultConfig: GatekeeperConfig = {
    endpoint: "http://localhost:3000/api/auth",
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

enum RouteErrors {
    RateLimitExceeded = "RATE_LIMIT_EXCEEDED",
    InvalidRoute = "INVALID_ROUTE",
}

export const Gatekeeper = (customConfig: Partial<GatekeeperConfig> = {}) => {
    const config: GatekeeperConfig = deepMerge(defaultConfig, customConfig); // Combine the default and custom configs

    // Build the HTTP handler for each route
    const httpHandler = async (
        request: NextRequest,
        { params }: { params: Promise<{ slug: string }> }
    ) => {
        const action: string = (await params).slug; // The action to perform

        // Handle rate limiting
        const rateLimitResponse: RateLimitResponse | undefined =
            Ratelimiter.check(request, `/${action}`);
        if (rateLimitResponse) {
            if (!rateLimitResponse.allowed) {
                return Ratelimiter.applyHeaders(
                    buildErrorResponse(RouteErrors.RateLimitExceeded, 429),
                    rateLimitResponse
                );
            }
        }

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
        let response: Response | undefined;
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
                response = buildErrorResponse(
                    GenericErrors.InvalidPayload,
                    400
                );
            } else if (action === "register") {
                response = await handleRegisterRoute(body, config);
            } else if (action === "login") {
                response = await handleLoginRoute(body, config);
            }
        } else if (
            request.method === "GET" &&
            action === "@me" &&
            accessToken
        ) {
            response = await handleMeRoute(accessToken, config);
        }
        if (response) {
            return rateLimitResponse
                ? Ratelimiter.applyHeaders(response, rateLimitResponse)
                : response;
        }
        return buildErrorResponse(RouteErrors.InvalidRoute, 404);
    };

    // Return the result
    const getSession = async <S extends typeof config.sessionType>(): Promise<
        S | undefined
    > => {
        // Extract the session from the cookie
        const sessionCookie: RequestCookie | undefined = (await cookies()).get(
            config.sessionCookieName
        );

        let session: S | undefined;
        if (
            !sessionCookie?.value ||
            !("accessToken" in (session = JSON.parse(sessionCookie.value)))
        )
            return undefined;
        return session;
    };
    return {
        GET: httpHandler,
        POST: httpHandler,
        getSession,

        /**
         * Invoke a request to the API to retrieve the
         * currently logged in user via the session cookie.
         */
        getUser: async <
            S extends typeof config.sessionType,
            U extends typeof config.userType,
        >(): Promise<U | undefined> => {
            const session: S | undefined = await getSession(); // Get the session
            if (!session) return undefined;

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
                : ((await response.json()) as U);
        },
    } as any;
};
