"use client";

import {
    createContext,
    ReactElement,
    ReactNode,
    useContext,
    useState,
} from "react";
import { BaseSession } from "../types/user/session";
import { BaseUser } from "../types/user/user";

/**
 * The props for this context.
 */
export type AuthContextProps = {
    session: BaseSession | undefined;
    user: BaseUser | undefined;
};

export type AuthProviderProps = {
    user: any;
    children: ReactNode;
};

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({
    user: defaultUser,
    children,
}: AuthProviderProps): ReactElement => {
    // Create the states
    const [session] = useState<BaseSession | undefined>(undefined);
    const [user] = useState<BaseUser | undefined>(defaultUser);

    // Provide the context
    return (
        <AuthContext.Provider value={{ session, user }}>
            {children}
        </AuthContext.Provider>
    );
};

/**
 * Use the filter context.
 */
export const useAuth = (): AuthContextProps => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
