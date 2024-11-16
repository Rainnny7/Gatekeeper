import { Gatekeeper } from "gatekeeper-lib/index";
import { MongoAdapter } from "@gatekeeper/mongodb-adapter";

export const { GET, POST, getSession, getUser } = Gatekeeper({
    adapter: new MongoAdapter(),
    debug: true,
});
