"use client";

import { useSession } from "next-auth/react";
import React from "react";
import { useRecoilState } from "recoil";

import getConversationById from "@/actions/getConversationbyId";
import { UserSession } from "@/lib/model";
import { FullConversationType } from "@/lib/types";

import { conversationState } from "../atoms/conversationState";
import ChatHeader from "./ChatHeader";
import Empty from "./Empty";
import MessageBar from "./MessageBar";
import MessageContainer from "./MessageContainer";

export default function ChatContainer(): React.JSX.Element {
	const { data: session } = useSession() as { data: UserSession | undefined };
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
		}
		void getConversation();
	}, [conversationId]);
	return (
		<>
			{conversation ? (
				<div className="z-15 flex h-[100vh] max-h-screen w-full flex-col items-center border border-b-0 border-[#e9edef] bg-[#efeae2] dark:border-[#313d45] dark:bg-[#0b141a] lg:h-[95vh] lg:rounded-r-lg">
					<ChatHeader conversation={conversation} email={session?.user?.email ?? ""} />
					<MessageContainer
						id={conversationId}
						// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
						messages={conversation.messages || []}
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
