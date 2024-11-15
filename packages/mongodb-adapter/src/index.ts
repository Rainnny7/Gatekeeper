import { Collection, ObjectId, Db, MongoClient } from "mongodb";
import { BaseSession } from "gatekeeper-lib/types/user/session";
import { BaseUser } from "gatekeeper-lib/types/user/user";
import { BaseAdapter } from "gatekeeper-lib/adapter/base-adapter";
import { GatekeeperConfig } from "gatekeeper-lib/types/config";
import { deepMerge } from "gatekeeper-lib/lib/array";

/**
 * The config for this adapter.
 */
export type MongoAdapterConfig = {
    collections: {
        sessions: string;
        users: string;
    };
};

const defaultConfig: MongoAdapterConfig = {
    collections: {
        sessions: "sessions",
        users: "users",
    },
};

/**
 * The client for this adapter.
 */
type MongoAdapterClient = {
    sessions: Collection<BaseSession>;
    users: Collection<BaseUser>;
};

/**
 * The adapter for MongoDB.
 */
export class MongoAdapter implements BaseAdapter<MongoAdapterClient> {
    private config: MongoAdapterConfig;
    private client: MongoClient | undefined; // The cached client

    constructor(customConfig: Partial<GatekeeperConfig> = {}) {
        this.config = deepMerge(defaultConfig, customConfig); // Combine the default and custom configs
    }

    /**
     * Invoke a connection to the database.
     */
    async connect(): Promise<MongoAdapterClient | undefined> {
        // Client is not cached, create a new one
        if (!this.client) {
            const connectionUri: string | undefined = process.env.MONGODB_URI;
            if (!connectionUri)
                throw new Error(
                    "Missing the MONGODB_URI environment variable."
                );
            this.client = new MongoClient(connectionUri);
        }
        // Invoke the connection
        const client: MongoClient = await this.client.connect();
        const db: Db = client.db();
        return {
            sessions: db.collection(this.config.collections.sessions),
            users: db.collection(this.config.collections.users),
        };
    }

    /**
     * Get the user from the given access token.
     *
     * @param accessToken the access token
     */
    async getUser(accessToken: string): Promise<BaseUser | undefined> {
        const client: MongoAdapterClient | undefined = await this.connect();
        if (!client) return undefined;

        // find the user id by the access token and then map it to the user from the users collection
        const userId = await client.sessions.findOne({ accessToken });
        const user =
            userId &&
            (await client.users.findOne({ _id: new ObjectId(userId.user) }));
        console.log({ userId, user });

        // return user ? { ...user, snowflake: `sfsfds` } : undefined;
    }
}
