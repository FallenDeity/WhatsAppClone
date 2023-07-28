"use client";

import "react-toastify/dist/ReactToastify.css";

import axios from "axios";
import Lottie from "lottie-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import React from "react";
import { toast, ToastContainer } from "react-toastify";

import animationData from "@/assets/animation_lkgam3yw.json";
import { UserSession } from "@/lib/model";

export default function Verification({ token }: { token?: string }): React.JSX.Element {
	const [loading, setLoading] = React.useState<boolean>(false);
	const { systemTheme, theme } = useTheme();
	const currentTheme = theme === "system" ? systemTheme : theme;
	const isDark = currentTheme === "dark";
	const { data: session } = useSession() as { data: UserSession | undefined };
	const router = useRouter();
	React.useEffect(() => {
		if (session) {
			const email = session.user?.email ?? "";
			void axios
				.get("/api/users", {
					params: {
						email,
					},
				})
				.then((res) => {
					if (res.status === 200) {
						// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
						if (res.data.emailVerified) {
							router.push("/chat");
						}
					}
				});
			if (token) {
				setLoading(true);
				void axios
					.post("/api/verify", { token: token, email: email })
					.then(() => {
						toast.success("Email verified successfully");
						router.push("/chat");
					})
					.catch((err) => {
						// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
						toast.error(String(err.response.data.error));
						router.push("/verify");
					})
					.finally(() => {
						setLoading(false);
					});
			}
		}
	}, [session, router]);
	return (
		<>
			{loading ? (
				<Lottie animationData={animationData} loop={true} height={500} width={500} />
			) : (
				<div className="max-w-sm px-2 sm:mx-auto sm:w-full sm:max-w-md">
					<div className="relative rounded-lg bg-white px-6 py-6 shadow-lg dark:bg-gray-900 sm:px-10">
						<Image
							className="absolute left-0 right-0 top-0 mx-auto h-24 w-24 -translate-y-1/2 rounded-full bg-white p-3 dark:bg-gray-900"
							src="/logo.png"
							alt="Logo"
							width={72}
							height={72}
						/>
						<div className="relative mt-5">
							<div className="flex justify-center">
								<h1 className="text-3xl font-bold">Verify your email</h1>
							</div>
							<p className="mt-4 text-sm text-gray-700 dark:text-gray-400">
								We have sent an email to your mail. Please check your inbox and click the link in the
								email to verify your email address.
							</p>
						</div>
						<div className="mt-6">
							<button
								onClick={(): void => {
									void signOut();
								}}
								type="button"
								className="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
								Sign out
							</button>
						</div>
					</div>
				</div>
			)}
			<ToastContainer
				position="top-center"
				autoClose={5000}
				closeOnClick
				pauseOnFocusLoss
				theme={isDark ? "dark" : "light"}
			/>
		</>
	);
}
