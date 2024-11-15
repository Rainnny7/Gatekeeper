import { pika } from "./ids";
import { BaseUser } from "../types/user/user";

export const generateSession = (user: BaseUser) => {
    return {
        snowflake: pika.gen("session"),
        accessToken: pika.gen("sh"),
        refreshToken: pika.gen("sh"),
        user: user.snowflake,
        expires: Date.now() + 3600 * 1000 * 24 * 7, // 7 days
    };
};
