import { Gatekeeper } from "gatekeeper-lib/index";
import { MongoAdapter } from "@gatekeeper/mongodb-adapter";

export const { GET, POST, getUser } = Gatekeeper({
    adapter: new MongoAdapter(),
    debug: true,
});
