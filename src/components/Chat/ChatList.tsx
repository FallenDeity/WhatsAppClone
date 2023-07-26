"use client";

import { AnimatePresence, motion } from "framer-motion";
import React from "react";
import { useRecoilState } from "recoil";

import { sideBarState } from "../atoms/sideBar";
import ChatListHeader from "./ChatListHeader";
import ContactList from "./ContactList";
import List from "./List";

export default function ChatList(): React.JSX.Element {
	const pageType = useRecoilState(sideBarState)[0];
	return (
		<div className="z-20 flex max-h-screen flex-col bg-white dark:bg-[#111b21] lg:rounded-l-lg">
			{pageType === "default" && (
				<motion.div>
					<ChatListHeader />
					<List />
				</motion.div>
			)}
			<AnimatePresence>{pageType === "contact" && <ContactList />}</AnimatePresence>
		</div>
	);
}
