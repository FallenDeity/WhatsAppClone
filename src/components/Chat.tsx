"use client";

import "react-toastify/dist/ReactToastify.css";

import { User } from "@prisma/client";
import axios from "axios";
import { find } from "lodash";
import Lottie from "lottie-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import React from "react";
import { toast, ToastContainer } from "react-toastify";
import { useRecoilState } from "recoil";

import getConversationById from "@/actions/getConversationbyId";
import getCurrentUser from "@/actions/getCurrentUser";
import animationData from "@/assets/animation_lkgam3yw.json";
import { UserSession } from "@/lib/model";
import { pusherClient } from "@/lib/pusher";
import { FullConversationType, FullMessageType } from "@/lib/types";

import { Call, callState } from "./atoms/CallState";
import { conversationState } from "./atoms/conversationState";
import { messageSearch } from "./atoms/messageSearch";
import IncomingCall from "./Call/IncomingCall";
import OutgoingCall from "./Call/OutgoingCall";
import ChatContainer from "./Chat/ChatContainer";
import ChatList from "./Chat/ChatList";
import Empty from "./Chat/Empty";
import SearchMessages from "./Chat/SearchMessages";

export default function Chat(): React.JSX.Element {
	const [CallState, setCallState] = useRecoilState(callState);
	const MessageSearch = useRecoilState(messageSearch)[0];
	const [user, setUser] = React.useState<User | null>(null);
	const [loading, setLoading] = React.useState<boolean>(true);
	const { systemTheme, theme } = useTheme();
	const currentTheme = theme === "system" ? systemTheme : theme;
	const isDark = currentTheme === "dark";
	const { data: session } = useSession() as { data: UserSession | undefined };
	const router = useRouter();
	const [messages, setMessages] = React.useState<FullConversationType["messages"]>([]);
	const conversationId = useRecoilState(conversationState)[0];
	const [conversation, setConversation] = React.useState<FullConversationType | null>(null);
	// const [incomingCall, setIncomingCall] = React.useState<Call | null>(null);
	React.useEffect(() => {
		if (!conversationId) {
			setConversation(null);
			return;
		}
		setConversation(null);
		async function getConversation(): Promise<void> {
			const data = await getConversationById(conversationId);
			setConversation(data);
			setMessages(data?.messages ?? []);
		}
		void getConversation();
	}, [conversationId]);
	React.useEffect(() => {
		pusherClient.subscribe(conversationId);
		const messageHandler = (message: FullMessageType): void => {
			setMessages((prev) => {
				if (find(prev, { id: message.id })) {
					return prev;
				}
				return [...prev, message];
			});
		};
		const updateHandler = (messages: FullMessageType[]): void => {
			messages.map((message) => {
				setMessages((prev) =>
					prev.map((m) => {
						if (m.id === message.id) {
							return message;
						}
						return m;
					})
				);
			});
		};
		pusherClient.bind("messages:new", messageHandler);
		pusherClient.bind("message:update", updateHandler);
		return () => {
			pusherClient.unsubscribe(conversationId);
			pusherClient.unbind("messages:new", messageHandler);
			pusherClient.unbind("message:update", updateHandler);
		};
	}, [conversationId]);
	React.useEffect(() => {
		if (session) {
			pusherClient.subscribe(session.user?.email ?? "");
			pusherClient.bind("call:incoming", (call: Call) => {
				if (call.type === "voice") {
					setCallState({ voiceCall: call });
				} else {
					setCallState({ videoCall: call });
				}
			});
			return () => {
				pusherClient.unsubscribe(session.user?.email ?? "");
				pusherClient.unbind("call:incoming");
			};
		}
		return () => null;
	}, [session]);
	React.useEffect(() => {
		async function getUser(): Promise<void> {
			const data = await getCurrentUser();
			setUser(data);
		}
		void getUser();
	}, []);
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
		<>
			{(CallState.videoCall?.incoming || CallState.voiceCall?.incoming) && user && (
				<div className="relative z-0 h-screen max-h-screen w-screen max-w-full overflow-hidden lg:p-5">
					<div className="absolute left-0 top-0 -z-10 flex h-[20vh] w-full bg-[#00a783] dark:bg-[#10745e] " />
					<IncomingCall
						user={user}
						email={session?.user?.email ?? ""}
						// eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
						call={(CallState.videoCall ?? CallState.voiceCall) as Call}
					/>
				</div>
			)}
			{(CallState.voiceCall?.outgoing || CallState.videoCall?.outgoing) && user && (
				<div className="relative z-0 h-screen max-h-screen w-screen max-w-full overflow-hidden lg:p-5">
					<div className="absolute left-0 top-0 -z-10 flex h-[20vh] w-full bg-[#00a783] dark:bg-[#10745e] " />
					{/* eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style */}
					<OutgoingCall user={user} call={(CallState.videoCall ?? CallState.voiceCall) as Call} />
				</div>
			)}
			{!CallState.videoCall?.outgoing &&
				!CallState.voiceCall?.outgoing &&
				!CallState.videoCall?.incoming &&
				!CallState.voiceCall?.incoming && (
					<div className="relative z-0 grid h-screen max-h-screen w-screen max-w-full overflow-hidden bg-gradient-to-b from-[#f0f2f5] to-[#efeae2] dark:from-[#222e35] dark:to-[#0b141a] lg:grid-cols-main lg:p-5">
						{loading || !session ? (
							<div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform">
								<Lottie animationData={animationData} loop={true} height={500} width={500} />
							</div>
						) : (
							<>
								<div className="absolute -z-10 flex h-[20vh] w-full bg-[#00a783] dark:bg-[#10745e] " />
								<ChatList />
								{conversationId ? (
									<div className={MessageSearch ? "grid grid-cols-1 lg:grid-cols-2" : "grid-cols-2"}>
										<ChatContainer conversation={conversation} messages={messages} />
										{MessageSearch && <SearchMessages messages={messages} />}
									</div>
								) : (
									<Empty />
								)}
							</>
						)}
						<ToastContainer
							position="top-center"
							autoClose={5000}
							closeOnClick
							pauseOnFocusLoss
							theme={isDark ? "dark" : "light"}
						/>
					</div>
				)}
		</>
	);
}
