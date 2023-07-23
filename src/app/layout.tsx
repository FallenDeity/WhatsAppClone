"use client";

import "@/styles/globals.css";

import { Inter } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import React from "react";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }: { children: React.ReactNode }): React.JSX.Element {
	return (
		<html lang="en">
			<body className={`${inter.className}`}>
				<SessionProvider>
					<ThemeProvider attribute="class">{children}</ThemeProvider>
				</SessionProvider>
			</body>
		</html>
	);
}
