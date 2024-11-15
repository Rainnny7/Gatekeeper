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
interface AuthContextProps {
    session: BaseSession | undefined;
    user: BaseUser | undefined;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

/**
 * The provider used to store the state of the filter.
 *
 * @param children the children to provide to
 */
export const AuthProvider = ({
    children,
}: {
    children: ReactNode;
}): ReactElement => {
    // Create the states
    const [session] = useState<BaseSession | undefined>(undefined);
    const [user] = useState<BaseUser | undefined>(undefined);

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
