import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "gatekeeper-lib/context/auth-context";
import { ReactElement, ReactNode } from "react";
import { getUser } from "@/app/api/auth/[slug]/route";
import { BaseSession } from "gatekeeper-lib/types/user/session";

export const metadata: Metadata = {
    title: "Gatekeeper Example 💂🏼",
    description: "An example app showcasing how to use Gatekeeper auth",
};

const RootLayout = async ({
    children,
}: Readonly<{
    children: ReactNode;
}>): Promise<ReactElement> => {
    const user: BaseSession | undefined = await getUser();
    console.log({ user });
    return (
        <html lang="en">
            <body className="antialiased">
                <AuthProvider>{children}</AuthProvider>
            </body>
        </html>
    );
};
export default RootLayout;
