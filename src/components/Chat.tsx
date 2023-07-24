"use client";

import "react-toastify/dist/ReactToastify.css";

import axios from "axios";
import Lottie from "lottie-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import React from "react";
import { toast, ToastContainer } from "react-toastify";
import { useRecoilState } from "recoil";

import animationData from "@/assets/animation_lkgam3yw.json";
import { UserSession } from "@/lib/model";

import { conversationState } from "./atoms/conversationState";
import ChatContainer from "./Chat/ChatContainer";
import ChatList from "./Chat/ChatList";
import Empty from "./Chat/Empty";

export default function Chat(): React.JSX.Element {
	const isTalking = useRecoilState(conversationState)[0];
	const [loading, setLoading] = React.useState<boolean>(true);
	const { resolvedTheme } = useTheme();
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
						if (!res.data.emailVerified) {
							toast.error("Email not verified");
							router.push("/verify");
						} else {
							setLoading(false);
						}
					}
				});
		}
	}, [session, router]);
	return (
		<div className="relative z-0 grid h-screen max-h-screen w-screen max-w-full grid-cols-main overflow-hidden bg-gradient-to-b from-[#f0f2f5] to-[#efeae2] dark:from-[#222e35] dark:to-[#0b141a] lg:p-5">
			{loading ? (
				<div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform">
					<Lottie animationData={animationData} loop={true} height={500} width={500} />
				</div>
			) : (
				<>
					<div className="absolute -z-10 flex h-[20vh] w-full bg-[#00a783] dark:bg-[#10745e] " />
					<ChatList />
					{isTalking ? <ChatContainer /> : <Empty />}
				</>
			)}
			<ToastContainer
				position="top-center"
				autoClose={5000}
				closeOnClick
				pauseOnFocusLoss
				theme={resolvedTheme === "dark" ? "dark" : "light"}
			/>
		</div>
	);
}
