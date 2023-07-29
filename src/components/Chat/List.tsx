"use client";

import { find } from "lodash";
import { useSession } from "next-auth/react";
import React, { useMemo } from "react";
import { BiFilter } from "react-icons/bi";
import { FaMagnifyingGlass } from "react-icons/fa6";
import { useRecoilState } from "recoil";

import { UserSession } from "@/lib/model";
import { pusherClient } from "@/lib/pusher";
import { FullConversationType } from "@/lib/types";

import { conversationState } from "../atoms/conversationState";
import ChatListItem from "./ChatListItem";

export default function List({ conversation }: { conversation: FullConversationType[] }): React.JSX.Element {
	const conversationId = useRecoilState(conversationState)[0];
	const { data: session } = useSession() as { data: UserSession | undefined };
	const [conversations, setConversations] = React.useState<FullConversationType[]>(conversation);
	const searchRef = React.useRef<HTMLInputElement>(null);
	const [searchResults, setSearchResults] = React.useState<FullConversationType[]>([]);
	const pusherKey = useMemo(() => session?.user?.email, [session?.user?.email]);
	React.useEffect(() => {
		if (!pusherKey) return;
		pusherClient.subscribe(pusherKey);
		const newHandler = (data: FullConversationType): void => {
			setConversations((prev) => {
				if (find(prev, { id: data.id })) return prev;
				return [data, ...prev];
			});
		};
		const updateHandler = (data: FullConversationType): void => {
			console.log(data);
			setConversations((prev) =>
				prev.map((conversation) => {
					if (conversation.id === data.id) {
						const dataTime = new Date(data.messages[data.messages.length - 1].createdAt);
						return {
							...conversation,
							messages: [...conversation.messages, data.messages[data.messages.length - 1]],
							messagesIds: [...conversation.messagesIds, data.messages[data.messages.length - 1].id],
							lastMessageAt:
								conversation.lastMessageAt.getTime() > dataTime.getTime()
									? conversation.lastMessageAt
									: dataTime,
						};
					}
					return conversation;
				})
			);
			setConversations((prev) => prev.sort((a, b) => b.lastMessageAt.getTime() - a.lastMessageAt.getTime()));
		};
		const deleteHandler = (data: FullConversationType): void => {
			setConversations((prev) => {
				return [...prev.filter((conversation) => conversation.id !== data.id)];
			});
		};
		pusherClient.bind("conversation:new", newHandler);
		pusherClient.bind("conversation:update", updateHandler);
		pusherClient.bind("conversation:remove", deleteHandler);
		return () => {
			pusherClient.unsubscribe(pusherKey);
			pusherClient.unbind("conversation:new", newHandler);
			pusherClient.unbind("conversation:update", updateHandler);
			pusherClient.unbind("conversation:remove", deleteHandler);
		};
	}, [pusherKey, conversationId]);
	const handleSearch = (): void => {
		if (!searchRef.current) return;
		const value = searchRef.current.value;
		if (value.trim().length === 0) {
			setSearchResults([]);
			return;
		}
		const results = conversations.filter((conversation) =>
			String(
				conversation.isGroup
					? conversation.name
					: conversation.users.filter((user) => user.email !== session?.user?.email)[0].name
			)
				.toLowerCase()
				.includes(value.toLowerCase())
		);
		setSearchResults(results);
	};
	return (
		<>
			<div className="flex h-14 items-center gap-1 pl-5">
				<div className="flex flex-grow items-center gap-7 rounded-lg bg-[#f0f2f5] px-4 py-1.5 dark:bg-[#222e35]">
					<div>
						<FaMagnifyingGlass className="cursor-pointer text-sm text-[#54656f] dark:text-[#aebac1]" />
					</div>
					<div>
						<input
							ref={searchRef}
							onChange={handleSearch}
							type="text"
							placeholder="Search or start new chat"
							className="w-full bg-transparent text-sm text-[#54656f] placeholder-[#54656f] outline-none dark:text-[#aebac1] dark:placeholder-[#aebac1]"
						/>
					</div>
				</div>
				<div className="pl-3 pr-5">
					<BiFilter className="cursor-pointer text-xl text-[#54656f] dark:text-[#aebac1]" />
				</div>
			</div>
			<div className="flex h-[90vh] flex-grow flex-col overflow-y-auto border-t border-[#e9edef] pb-24 scrollbar-thin scrollbar-thumb-gray-300 dark:border-[#313d45] dark:scrollbar-thumb-gray-700 lg:h-[80vh]">
				{session &&
					searchResults.length === 0 &&
					conversations.map((conversation: FullConversationType) => (
						<ChatListItem
							conversation={conversation}
							key={conversation.id}
							email={String(session.user?.email)}
						/>
					))}
				{session &&
					searchResults.length > 0 &&
					searchResults.map((conversation: FullConversationType) => (
						<ChatListItem
							conversation={conversation}
							key={conversation.id}
							email={String(session.user?.email)}
						/>
					))}
			</div>
		</>
	);
}
