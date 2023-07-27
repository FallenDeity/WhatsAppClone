"use client";

import { AnimatePresence, motion } from "framer-motion";
import React from "react";
import { useRecoilState } from "recoil";

import getConversations from "@/actions/getConversations";
import { FullConversationType } from "@/lib/types";

import { sideBarState } from "../atoms/sideBar";
import ChatListHeader from "./ChatListHeader";
import ContactList from "./ContactList";
import List from "./List";

export default function ChatList(): React.JSX.Element {
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
		<div className="z-20 flex h-[100vh] max-h-screen flex-col border border-r-0 border-[#e9edef] bg-white dark:border-[#313d45] dark:bg-[#111b21] lg:h-[95vh] lg:rounded-l-lg">
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
