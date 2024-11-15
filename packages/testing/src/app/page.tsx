"use client";

import { useAuth } from "gatekeeper-lib/context/auth-context";

const Page = () => {
    const { user } = useAuth();
    return <main>bob - {user?.username}</main>;
};
export default Page;
