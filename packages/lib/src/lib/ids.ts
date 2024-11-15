import Pika from "pika-id";

export const pika = new Pika(
    [
        "session",
        {
            prefix: "sh",
            secure: true,
        },
        "user",
        "salt",
    ],
    {
        epoch: 1731646800000,
    }
);
