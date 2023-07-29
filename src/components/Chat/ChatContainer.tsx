"use client";

import { useSession } from "next-auth/react";
import React from "react";
import { useRecoilState } from "recoil";

import { UserSession } from "@/lib/model";
import { FullConversationType, FullMessageType } from "@/lib/types";

import { messageSearch } from "../atoms/messageSearch";
import ChatHeader from "./ChatHeader";
import Empty from "./Empty";
import MessageBar from "./MessageBar";
import MessageContainer from "./MessageContainer";

export default function ChatContainer({
	conversation,
	messages,
}: {
	conversation: FullConversationType | null;
	messages: FullMessageType[];
}): React.JSX.Element {
	const { data: session } = useSession() as { data: UserSession | undefined };
	const MessageSearch = useRecoilState(messageSearch)[0];
	return (
		<>
			{conversation ? (
				<div
					className={`z-15 h-[100vh] max-h-screen w-full flex-col items-center border border-b-0 border-[#e9edef] bg-[#efeae2] dark:border-[#313d45] dark:bg-[#0b141a] lg:flex lg:h-[95vh] ${
						// eslint-disable-next-line @typescript-eslint/restrict-template-expressions
						!MessageSearch && "lg:rounded-r-lg"
					} ${MessageSearch ? "hidden" : "flex"}`}>
					<ChatHeader conversation={conversation} email={session?.user?.email ?? ""} />
					<MessageContainer
						users={conversation.users}
						id={conversation.id}
						// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
						messages={messages?.length ? messages : []}
						email={session?.user?.email ?? ""}
					/>
					<MessageBar id={conversation.id} />
				</div>
			) : (
				<Empty />
			)}
		</>
	);
}
