"use client";

import { AnimatePresence, motion } from "framer-motion";
import React from "react";
import { useRecoilState } from "recoil";

import getConversations from "@/actions/getConversations";
import { FullConversationType } from "@/lib/types";

import { conversationState } from "../atoms/conversationState";
import { sideBarState } from "../atoms/sideBar";
import ChatListHeader from "./ChatListHeader";
import ContactList from "./ContactList";
import List from "./List";

export default function ChatList(): React.JSX.Element {
	const ConversationState = useRecoilState(conversationState)[0];
	const pageType = useRecoilState(sideBarState)[0];
	const [conversations, setConversations] = React.useState<FullConversationType[]>([]);
	React.useEffect(() => {
		async function getData(): Promise<void> {
			const data = await getConversations();
			setConversations(data);
		}
		void getData();
	}, []);
	return (
		<div
			className={`z-20 h-[100vh] max-h-screen flex-col border border-r-0 border-[#e9edef] bg-white dark:border-[#313d45] dark:bg-[#111b21] lg:flex lg:h-[95vh] lg:rounded-l-lg ${
				ConversationState ? "hidden" : "flex"
			}`}>
			{pageType === "default" && (
				<motion.div>
					<ChatListHeader />
					{conversations.length > 0 && <List conversation={conversations} />}
				</motion.div>
			)}
			<AnimatePresence>{pageType === "contact" && <ContactList />}</AnimatePresence>
		</div>
	);
}
