"use client";

import { useSession } from "next-auth/react";
import React from "react";

import getConversations from "@/actions/getConversations";
import { UserSession } from "@/lib/model";
import { FullConversationType } from "@/lib/types";

import ChatListItem from "./ChatListItem";

export default function List(): React.JSX.Element {
	const { data: session } = useSession() as { data: UserSession | undefined };
	const [conversations, setConversations] = React.useState<FullConversationType[]>([]);
	React.useEffect(() => {
		async function getData(): Promise<void> {
			const data = await getConversations();
			setConversations(data);
		}
		void getData();
	}, []);
	return (
		<div className="flex h-[90vh] flex-grow flex-col overflow-y-auto border-t border-[#e9edef] pb-24 scrollbar-thin scrollbar-thumb-gray-300 dark:border-[#313d45] dark:scrollbar-thumb-gray-700 lg:h-[80vh]">
			{session &&
				conversations.map((conversation: FullConversationType) => (
					<ChatListItem
						conversation={conversation}
						key={conversation.id}
						email={String(session.user?.email)}
					/>
				))}
		</div>
	);
}
