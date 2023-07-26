"use client";

import { find } from "lodash";
import { useSession } from "next-auth/react";
import React from "react";
import { useRecoilState } from "recoil";

import getConversationById from "@/actions/getConversationbyId";
import { UserSession } from "@/lib/model";
import { pusherClient } from "@/lib/pusher";
import { FullConversationType, FullMessageType } from "@/lib/types";

import { conversationState } from "../atoms/conversationState";
import ChatHeader from "./ChatHeader";
import Empty from "./Empty";
import MessageBar from "./MessageBar";
import MessageContainer from "./MessageContainer";

export default function ChatContainer(): React.JSX.Element {
	const { data: session } = useSession() as { data: UserSession | undefined };
	const [messages, setMessages] = React.useState<FullConversationType["messages"]>([]);
	const conversationId = useRecoilState(conversationState)[0];
	const [conversation, setConversation] = React.useState<FullConversationType | null>(null);
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
	return (
		<>
			{conversation ? (
				<div className="z-15 flex h-[100vh] max-h-screen w-full flex-col items-center border border-b-0 border-[#e9edef] bg-[#efeae2] dark:border-[#313d45] dark:bg-[#0b141a] lg:h-[95vh] lg:rounded-r-lg">
					<ChatHeader conversation={conversation} email={session?.user?.email ?? ""} />
					<MessageContainer
						users={conversation.users}
						id={conversationId}
						// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
						messages={messages || []}
						email={session?.user?.email ?? ""}
					/>
					<MessageBar id={conversationId} />
				</div>
			) : (
				<Empty />
			)}
		</>
	);
}
