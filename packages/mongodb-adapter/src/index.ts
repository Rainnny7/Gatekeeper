import { Collection, Db, MongoClient, WithId } from "mongodb";
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

type DatabaseSession = { _id: string } & BaseSession;
type DatabaseUser = { _id: string } & BaseUser;

/**
 * The client for this adapter.
 */
type MongoAdapterClient = {
    sessions: Collection<DatabaseSession>;
    users: Collection<DatabaseUser>;
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
        const client: MongoAdapterClient | undefined = await this.connect(); // Connect to the DB
        if (!client) throw new Error("Database is not connected");

        const result = await client.sessions
            .aggregate([
                { $match: { accessToken } },
                {
                    $lookup: {
                        from: "users",
                        localField: "user",
                        foreignField: "_id",
                        as: "user",
                    },
                },
                { $unwind: "$user" },
                { $replaceRoot: { newRoot: "$user" } },
            ])
            .toArray();
        return result.length
            ? this.transformWithId(result[0] as WithId<BaseUser>)
            : undefined;
    }

    /**
     * Check if the given email and username are unique.
     *
     * @param email the email to check
     * @param username the username to check
     */
    async isEmailUsernameUnique(
        email: string,
        username: string
    ): Promise<boolean> {
        const client: MongoAdapterClient | undefined = await this.connect(); // Connect to the DB
        if (!client) throw new Error("Database is not connected");

        // Check if either the email or username is already taken
        const result = await client.users
            .aggregate([
                { $match: { $or: [{ email }, { username }] } },
                { $group: { _id: "$email", count: { $sum: 1 } } },
                { $group: { _id: "$username", count: { $sum: 1 } } },
            ])
            .toArray();
        return result.length === 0 || result[0].count === 0;
    }

    /**
     * Create a new user.
     *
     * @param user the user to create
     */
    async createUser(user: BaseUser): Promise<void> {
        const client: MongoAdapterClient | undefined = await this.connect(); // Connect to the DB
        if (!client) throw new Error("Database is not connected");

        const { snowflake, ...userWithoutSnowflake } = user;
        await client.users.insertOne({
            _id: snowflake,
            ...userWithoutSnowflake,
        } as DatabaseUser);
    }

    /**
     * Store a session for a user.
     *
     * @param session the session to store
     */
    async storeSession(session: BaseSession): Promise<void> {
        const client: MongoAdapterClient | undefined = await this.connect(); // Connect to the DB
        if (!client) throw new Error("Database is not connected");

        const { snowflake, ...sessionWithoutSnowflake } = session;
        await client.sessions.insertOne({
            _id: snowflake,
            ...sessionWithoutSnowflake,
        } as DatabaseSession);
    }

    /**
     * Transform the given document containing
     * _id long and make it a string.
     *
     * @param document the document to transform
     */
    private transformWithId<T>(document: WithId<T>): T & { snowflake: string } {
        const { _id, ...rest } = document;
        return { snowflake: document._id.toString(), ...rest } as T & {
            snowflake: string;
        };
    }
}
