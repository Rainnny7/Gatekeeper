import { GatekeeperConfig } from "./types/config";
import { NextRequest } from "next/server";
import { deepMerge } from "./lib/array";
import { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { cookies } from "next/headers";
import { handleMeRoute } from "./route/me-route";

export const defaultConfig: GatekeeperConfig = {
    endpoint: "/api",
    sessionCookieName: "gatekeeper-session",
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

        // Extract the access token from the request
        let accessToken: string | null = request.headers.get("Authorization");
        if (!accessToken || !accessToken.startsWith("Bearer ")) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
        }
        accessToken = accessToken.substring(7);

        if (request.method === "GET" && action === "@me") {
            return handleMeRoute(accessToken, config);
        }
        return Response.json({ error: "Route not found" }, { status: 404 });
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
                  session: typeof config.sessionAdapter;
                  user: typeof config.userAdapter;
              }
            | undefined
        > => {
            // Extract the session from the cookie
            const sessionCookie: RequestCookie | undefined = (
                await cookies()
            ).get(config.sessionCookieName);

            let session: typeof config.sessionAdapter | undefined;
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
                      user: (await response.json()) as typeof config.userAdapter,
                  };
        },
    } as any;
};
