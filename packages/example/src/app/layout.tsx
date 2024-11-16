import type { Metadata } from "next";
import "./globals.css";
import { ReactElement, ReactNode } from "react";
import { getUser } from "@/app/api/auth/[slug]/route";
import { BaseUser } from "gatekeeper-lib/types/user/user";
import { AuthProvider } from "gatekeeper-lib/context/auth-context";

export const metadata: Metadata = {
    title: "Gatekeeper Example 💂🏼",
    description: "An example app showcasing how to use Gatekeeper auth",
};

const RootLayout = async ({
    children,
}: Readonly<{
    children: ReactNode;
}>): Promise<ReactElement> => {
    const user: BaseUser | undefined = await getUser();
    console.log({ user });

    return (
        <html lang="en">
            <body className="antialiased">
                <AuthProvider user={user}>{children}</AuthProvider>
            </body>
        </html>
    );
};
export default RootLayout;
