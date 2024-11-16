"use client";

import { useAuth } from "gatekeeper-lib/context/auth-context";
import { ReactElement } from "react";

const HomePage = (): ReactElement => {
    const { session, user } = useAuth();
    return (
        <main>
            bob - {JSON.stringify(session)} - {JSON.stringify(user)}
        </main>
    );
};
export default HomePage;
