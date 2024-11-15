"use client";

import { useAuth } from "gatekeeper-lib/context/auth-context";
import { ReactElement } from "react";

const HomePage = (): ReactElement => {
    const { user } = useAuth();
    return <main>bob - {user?.username}</main>;
};
export default HomePage;
